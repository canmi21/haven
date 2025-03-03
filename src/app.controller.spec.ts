import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return OK and timestamp with User-Agent', () => {
      const req = { get: jest.fn().mockReturnValue('Mozilla/5.0') };
      const res = { json: jest.fn() };

      appController.getRoot(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          timestamp: expect.any(String),
          userAgent: 'Mozilla/5.0',
        })
      );
    });
  });

  describe('healthcheck', () => {
    it('should return OK status with timestamp', () => {
      const result = appController.getLive();
      expect(result.status).toBe('OK');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('uptime', () => {
    it('should return uptime data', () => {
      const result = appController.getUptime();
      expect(result).toHaveProperty('osUptime');
      expect(result).toHaveProperty('appUptime');
      expect(result).toHaveProperty('cpuUsage');
      expect(result).toHaveProperty('memoryUsage');
    });
  });
});
