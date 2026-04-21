const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    const uri = process.env.MONGO_URI;
    console.log('Connecting to:', uri.substring(0, 20) + '...');
    await mongoose.connect(uri);
    console.log('Connected!');

    // List users created in the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    console.log('--- Scanning "users" collection (Recent) ---');
    const recentUsers = await mongoose.connection.db.collection('users')
      .find({ createdAt: { $gte: thirtyMinutesAgo } })
      .toArray();

    if (recentUsers.length > 0) {
      console.log(`Found ${recentUsers.length} recent users:`);
      recentUsers.forEach(u => console.log(`- Email: ${u.email}, CreatedAt: ${u.createdAt}`));
    } else {
      console.log('No users created in the last 30 minutes.');
      
      // List the last 5 users overall
      console.log('--- Last 5 users in the DB ---');
      const lastUsers = await mongoose.connection.db.collection('users')
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
      
      lastUsers.forEach(u => console.log(`- Email: ${u.email}, CreatedAt: ${u.createdAt}`));
    }

    process.exit(0);
  } catch (err) {
    console.error('CRASHED:', err);
    process.exit(1);
  }
}

run();
