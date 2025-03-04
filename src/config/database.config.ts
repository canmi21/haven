import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import mongoose from 'mongoose';

config();

const databaseConfig = () => ({
  mongoUri: process.env.MONGO_URI,
  mongoUser: process.env.MONGO_USER,
  mongoPassword: process.env.MONGO_PASSWD,
});

export const testMongoConnection = async () => {
  const uri = process.env.MONGO_URI;
  const user = process.env.MONGO_USER;
  const password = process.env.MONGO_PASSWD;

  if (!uri || !user || !password) {
    console.error('[Mongo] Missing required environment variables.');
    process.exit(1);
  }

  const connectionPromise = mongoose.connect(uri, {
    user: user,
    pass: password,
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('[Mongo] Connection timed out after 10 seconds.')), 10000)
  );

  try {
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('[Mongo] Connection to MongoDB successful.\n');
  } catch (error) {
    console.error('[Mongo] Connection to MongoDB failed:', error.message, '\n');
    process.exit(1);
  }
};

console.log('[Mongo] URI:', process.env.MONGO_URI);
const password = process.env.MONGO_PASSWD;
if (password && password.length < 10) {
  console.warn('[Mongo] Warning: Please ensure your password is strong enough.');
  console.warn('[Mongo] Try using "openssl rand -base64 64" to generate a secure password.\n');
  process.exit(1);
}
console.log('[Mongo] User:', process.env.MONGO_USER);
console.log('[Mongo] Password:', password ? `${password.slice(0, 3)}${'*'.repeat(password.length - 3)}` : 'Not provided');

@Module({
  imports: [
    ConfigModule.forRoot({ load: [databaseConfig] }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongoUri')!,
        user: configService.get<string>('mongoUser')!,
        pass: configService.get<string>('mongoPassword')!,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
export default databaseConfig;
