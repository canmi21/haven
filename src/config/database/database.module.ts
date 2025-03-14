import { Module } from '@nestjs/common';
import { connectMongo } from './mongo';
import { connectRedis } from './redis';

@Module({})
export class DatabaseModule {
  static async initialize() {
    await connectRedis();
    await connectMongo();
  }
}
