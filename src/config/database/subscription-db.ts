import mongoose from 'mongoose';

export async function initSubscriptionDB() {
  console.log(`> Initializing "subscription" database`);
  
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    console.error(`! MongoDB connection is not established.`);
    return;
  }
  
  const adminDb = mongoose.connection.db.admin();
  const { databases } = await adminDb.listDatabases();
  const dbNames = databases.map(db => db.name);
  
  if (dbNames.includes('subscription')) {
    console.log(`+ "subscription" database already exists.`);
  } else {
    console.log(`+ "subscription" database does not exist. Initializing...`);
    const subscriptionDb = mongoose.connection.useDb('subscription');
    await subscriptionDb.createCollection('user');
    console.log(`+ "subscription" database initialized with "user" collection.`);
  }
}