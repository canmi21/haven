import mongoose from 'mongoose';

export async function connectMongo() {
  console.log(`> MongoDB`);
  console.log(`+ URI: ${process.env.MONGO_URI}`);
  const password = process.env.MONGO_PASSWD;
  if (password && password.length < 10) {
    console.warn(`! Please ensure your password is strong enough.`);
    console.warn(`> Try using "openssl rand -base64 64" to generate a secure password.\n`);
    process.exit(1);
  }
  console.log(`+ User: ${process.env.MONGO_USER}`);
  console.log(`+ Password: ${password ? `${password.slice(0, 3)}${'*'.repeat(password.length - 3)}` : 'Not provided'}`);

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`# Connecting to MongoDB (${attempt}/${maxRetries})`);
      await mongoose.connect(process.env.MONGO_URI || '', {
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASSWD,
        dbName: process.env.MONGO_DB,
        authSource: 'admin',
        serverSelectionTimeoutMS: 10000, 
      });
      console.log(`+ MongoDB connection established`);
      return;
    } catch (error) {
      console.error(`! Failed to connect to MongoDB (${attempt}/${maxRetries})`);
      console.error(`- ${error}`);
      if (attempt < maxRetries) {
        console.log(`> Retrying in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  console.error(`! MongoDB connection failed after ${maxRetries} attempts`);
  process.exit(1);
}
