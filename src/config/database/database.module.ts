import { Module } from '@nestjs/common';
import { connectMongo } from './mongo';

@Module({})
export class DatabaseModule {
  static async initialize() {
    await connectMongo();
  }
}
