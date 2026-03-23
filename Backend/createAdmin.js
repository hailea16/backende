require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

async function run() {
  try {
    await connectDB();

    const [admin, created] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        name: 'Administrator',
        username: 'admin',
        email: 'admin@nds.com',
        password: 'admin123',
        sex: 'Male',
        age: 30,
        grade: 'Admin',
        phoneNumber: '+251944777048',
        isAdmin: true,
        isApproved: true,
        emailVerified: true,
      },
    });

    if (!created) {
      await admin.update({
        name: 'Administrator',
        email: 'admin@nds.com',
        password: 'admin123',
        sex: 'Male',
        age: 30,
        grade: 'Admin',
        phoneNumber: '+251902412923',
        isAdmin: true,
        isApproved: true,
        emailVerified: true,
      });
    }

    console.log('Admin user ready:', admin.username);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    const sequelize = require('./config/sequelize');
    await sequelize.close();
    console.log('Done');
  }
}

run();

