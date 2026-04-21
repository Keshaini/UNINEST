const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await mongoose.connection.db.collection('users').find().sort({createdAt: -1}).limit(1).toArray();
    if (users.length > 0) {
      console.log('LATEST_USER_EMAIL:' + users[0].email);
    } else {
      console.log('NO_USERS_FOUND');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
