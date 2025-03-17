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
   * Register user with TOTP
   * Path: /v1/feeds/subscription/register?user=xxx&expire=30&quota=30&token=123456
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

      if (!username || !/^[0-9A-Za-z_]+$/.test(username)) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Username must contain only 0-9, A-Z, a-z, and _')
        );
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(StatusCode.CONFLICT).json(
          errorResponse(StatusCode.CONFLICT, 'Username already exists')
        );
      }

      const expireDays = expire ? parseInt(expire, 10) : 30;
      if (isNaN(expireDays) || expireDays < 0 || expireDays > 365) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Expire must be a number between 0 and 365')
        );
      }

      const dataQuota = quota ? parseInt(quota, 10) : 30;
      if (isNaN(dataQuota) || dataQuota < 0 || dataQuota > 500) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Quota must be a number between 0 and 500')
        );
      }

      const lastUser = await User.findOne().sort({ id: -1 });
      const newId = lastUser ? String(Number(lastUser.id) + 1).padStart(3, '0') : '001';

      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + expireDays);

      const userToken = uuidv4();

      const newUser = new User({
        id: newId,
        username,
        expireDate,
        quota: dataQuota,
        token: userToken,
      });
      await newUser.save();

      console.log(`+ Registered user: ${username}`);

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
   * Update user with TOTP
   * Path: /v1/feeds/subscription/update?user=xxx&expire=30&quota=30&token=123456
   */
  @Get('update')
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

      if (!id && !username) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Either id or user must be provided')
        );
      }

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

      if (expire !== undefined) {
        const expireDays = parseInt(expire, 10);
        if (isNaN(expireDays) || expireDays < 0 || expireDays > 365) {
          return res.status(StatusCode.BAD_REQUEST).json(
            errorResponse(StatusCode.BAD_REQUEST, 'Expire must be a number between 0 and 365')
          );
        }
        const currentDate = new Date();
        const baseDate = user.expireDate > currentDate ? user.expireDate : currentDate;
        const newExpireDate = new Date(baseDate);
        newExpireDate.setDate(newExpireDate.getDate() + expireDays);
        user.expireDate = newExpireDate;
      }

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

      console.log(`+ Updated user: ${user.username}`);

      return res.json(successResponse({}, 'User updated successfully'));
    } catch (error) {
      console.error('! Error in updateUser:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to update user')
      );
    }
  }

  /**
   * Get subscription with user token
   * Path: /v1/feeds/subscription?id=001&token=uuid-token
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

      if (!id && !username) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Either id or user must be provided')
        );
      }

      if (!token) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Token is required')
        );
      }

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

      if (user.expireDate < new Date()) {
        return res.status(StatusCode.FORBIDDEN).json(
          errorResponse(StatusCode.FORBIDDEN, 'Subscription has expired')
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

  /**
   * Get user token with TOTP
   * Path: /v1/feeds/subscription/token?id=001&token=totp
   */
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

      if (!id && !username) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Either id or user must be provided')
        );
      }

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

  /**
   * Rename user with TOTP
   * Path: /v1/feeds/subscription/rename?user=oldname&name=newname&token=totp
   *       or /v1/feeds/subscription/rename?id=001&name=newname&token=totp
   */
  @Get('rename')
  @UseGuards(TotpGuard)
  async renameUser(
    @Query('user') username: string,
    @Query('id') id: string,
    @Query('name') newUsername: string,
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

      if (!username && !id) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Either user or id must be provided')
        );
      }

      if (!newUsername || !/^[0-9A-Za-z_]+$/.test(newUsername)) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'New username must contain only 0-9, A-Z, a-z, and _')
        );
      }

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

      const existingUser = await User.findOne({ username: newUsername });
      if (existingUser) {
        return res.status(StatusCode.CONFLICT).json(
          errorResponse(StatusCode.CONFLICT, 'New username already exists')
        );
      }

      user.username = newUsername;
      await user.save();

      return res.json(successResponse({}, 'User renamed successfully'));
    } catch (error) {
      console.error('! Error in renameUser:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to rename user')
      );
    }
  }

  /**
   * Get user info with TOTP
   * Path: /v1/feeds/subscription/info?user=xxx&token=totp
   *       or /v1/feeds/subscription/info?id=001&token=totp
   */
  @Get('info')
  @UseGuards(TotpGuard)
  async getUserInfo(
    @Query('user') username: string,
    @Query('id') id: string,
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

      if (!username && !id) {
        return res.status(StatusCode.BAD_REQUEST).json(
          errorResponse(StatusCode.BAD_REQUEST, 'Either user or id must be provided')
        );
      }

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

      const userInfo = {
        id: user.id,
        username: user.username,
        expireDate: user.expireDate,
        quota: user.quota,
        token: user.token,
      };

      return res.json(successResponse(userInfo, 'User info retrieved successfully'));
    } catch (error) {
      console.error('! Error in getUserInfo:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to retrieve user info')
      );
    }
  }
}