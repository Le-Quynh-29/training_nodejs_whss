const bcrypt = require('bcrypt');
const User = require('../../app/models/User');
const truncateCollection = require('../../app/helper/TruncateCollection');
const db = require('../../config/db');

//connect db
db.connect();

async function UserSeeder() {
    await truncateCollection('users');
    const data = {
        username: 'whssadmin',
        password: bcrypt.hashSync('12345678', 10),
        passwordRaw: '12345678',
        role: 1,
    };
    await User.insertMany(data);
    await console.log('Seeder saved successfully!');
    await process.exit(0);
}

module.exports = UserSeeder();
