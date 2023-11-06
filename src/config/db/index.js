require('dotenv').config();
const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION + '://' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_DATABASE, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        console.log('connect success!!!');
    } catch (error) {
        console.log('connect fail!!!');
    }
}

module.exports = { connect };