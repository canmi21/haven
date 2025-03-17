import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import * as yaml from 'js-yaml';
import { TotpGuard } from '../../totp/totp.guard';
import { User } from './user.model';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse, StatusCode } from '../../../utils/response';
import { rateLimiter } from '../../../utils/limiter';
import { config } from './subscriptions';

@Controller('v1/feeds/subscription')
export class SubscriptionController {
  /**
   * Register a new user
   * Path: v1/feeds/subscription/register?user=xxx&expire=30&quota=30&token=123456
   * Requires TOTP verification
   */
  @Get('register')
  @UseGuards(TotpGuard)
  async registerUser(
    @Query('user') username: string,
    @Query('expire') expire: string,
    @Query('quota') quota: string,
    @Res() res: Response
  ) {
    try {
      const ip = res.req.ip;
      if (!ip) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'IP address is undefined')
        );
      }

      const allowed = await rateLimiter(ip, res.req.path, 5, 1);
      if (!allowed) {
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(
          errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded')
        );
      }

      // Validate username
      if (!username || !/^[0-9A-Za-z_]+$/.test(username)) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Username must contain only 0-9, A-Z, a-z, and _')
        );
      }

      // Check if username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(StatusCode.CONFLICT).json(
          errorResponse(StatusCode.CONFLICT, 'Username already exists')
        );
      }

      // Validate and parse expire (default 30 days)
      const expireDays = expire ? parseInt(expire, 10) : 30;
      if (isNaN(expireDays) || expireDays < 0 || expireDays > 365) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Expire must be a number between 0 and 365')
        );
      }

      // Validate and parse quota (default 30 GB)
      const dataQuota = quota ? parseInt(quota, 10) : 30;
      if (isNaN(dataQuota) || dataQuota < 0 || dataQuota > 500) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Quota must be a number between 0 and 500')
        );
      }

      // Generate incremental ID
      const lastUser = await User.findOne().sort({ id: -1 });
      const newId = lastUser ? String(Number(lastUser.id) + 1).padStart(3, '0') : '001';

      // Calculate expire date
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + expireDays);

      // Generate UUID token
      const userToken = uuidv4();

      // Create and save new user
      const newUser = new User({
        id: newId,
        username,
        expireDate,
        quota: dataQuota,
        token: userToken,
      });
      await newUser.save();

      return res.json(
        successResponse({ id: newId, token: userToken }, 'User registered successfully')
      );
    } catch (error) {
      console.error('! Error in registerUser:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to register user')
      );
    }
  }

  /**
   * Update an existing user
   * Path: v1/feeds/subscription/user/update?id=001&expire=30&quota=30&token=123456
   *       or v1/feeds/subscription/user/update?user=xxx&expire=30&quota=30&token=123456
   * Requires TOTP verification
   */
  @Get('user/update')
  @UseGuards(TotpGuard)
  async updateUser(
    @Query('id') id: string,
    @Query('user') username: string,
    @Query('expire') expire: string,
    @Query('quota') quota: string,
    @Res() res: Response
  ) {
    try {
      const ip = res.req.ip;
      if (!ip) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'IP address is undefined')
        );
      }

      const allowed = await rateLimiter(ip, res.req.path, 5, 1);
      if (!allowed) {
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(
          errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded')
        );
      }

      // Must provide either id or username
      if (!id && !username) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Either id or user must be provided')
        );
      }

      // Find user
      let user;
      if (id) {
        user = await User.findOne({ id });
      } else {
        user = await User.findOne({ username });
      }

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json(
          errorResponse(StatusCode.NOT_FOUND, 'User not found')
        );
      }

      // Update expire date if provided
      if (expire !== undefined) {
        const expireDays = parseInt(expire, 10);
        if (isNaN(expireDays) || expireDays < 0 || expireDays > 365) {
          return res.status(StatusCode.BAD_REQUEST).json(
            errorResponse(StatusCode.BAD_REQUEST, 'Expire must be a number between 0 and 365')
          );
        }
        const newExpireDate = new Date(user.expireDate);
        newExpireDate.setDate(newExpireDate.getDate() + expireDays);
        user.expireDate = newExpireDate;
      }

      // Update quota if provided
      if (quota !== undefined) {
        const dataQuota = parseInt(quota, 10);
        if (isNaN(dataQuota) || dataQuota < 0 || dataQuota > 500) {
          return res.status(StatusCode.BAD_REQUEST).json(
            errorResponse(StatusCode.BAD_REQUEST, 'Quota must be a number between 0 and 500')
          );
        }
        user.quota = dataQuota;
      }

      await user.save();

      return res.json(successResponse({}, 'User updated successfully'));
    } catch (error) {
      console.error('! Error in updateUser:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to update user')
      );
    }
  }

  /**
   * Get subscription data
   * Path: v1/feeds/subscription?id=001&token=uuid-token
   *       or v1/feeds/subscription?user=xxx&token=uuid-token
   */
  @Get()
  async getSubscription(
    @Query('id') id: string,
    @Query('user') username: string,
    @Query('token') token: string,
    @Res() res: Response
  ) {
    try {
      const ip = res.req.ip;
      if (!ip) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'IP address is undefined')
        );
      }

      const allowed = await rateLimiter(ip, res.req.path, 10, 1);
      if (!allowed) {
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(
          errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded')
        );
      }

      // Must provide either id or username
      if (!id && !username) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Either id or user must be provided')
        );
      }

      // Must provide token
      if (!token) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Token is required')
        );
      }

      // Find user and verify token
      let user;
      if (id) {
        user = await User.findOne({ id, token });
      } else {
        user = await User.findOne({ username, token });
      }

      if (!user) {
        return res.status(StatusCode.UNAUTHORIZED).json(
          errorResponse(StatusCode.UNAUTHORIZED, 'Invalid id/user or token')
        );
      }

      const yamlData = yaml.dump(config);
      res.setHeader('Content-Type', 'text/yaml');
      return res.send(yamlData);
    } catch (error) {
      console.error('! Error in getSubscription:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to load subscription data')
      );
    }
  }
  @Get('token')
  @UseGuards(TotpGuard)
  async getUserToken(
    @Query('id') id: string,
    @Query('user') username: string,
    @Res() res: Response
  ) {
    try {
      const ip = res.req.ip;
      if (!ip) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'IP address is undefined')
        );
      }

      const allowed = await rateLimiter(ip, res.req.path, 5, 1);
      if (!allowed) {
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(
          errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded')
        );
      }

      // Must provide id or user argument
      if (!id && !username) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Either id or user must be provided')
        );
      }

      // Find user
      let user;
      if (id) {
        user = await User.findOne({ id });
      } else {
        user = await User.findOne({ username });
      }

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json(
          errorResponse(StatusCode.NOT_FOUND, 'User not found')
        );
      }

      // UUID token
      return res.json(
        successResponse({ token: user.token }, 'User token retrieved successfully')
      );
    } catch (error) {
      console.error('! Error in getUserToken:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to retrieve user token')
      );
    }
  }
}