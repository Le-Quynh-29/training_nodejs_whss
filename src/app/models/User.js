const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const User = new Schema({
    username: { type: String, required: true, minlength: 8, maxlength: 20, unique: true },
    password: { type: String, required: true, minlength: 8, maxlength: 255},
    passwordRaw: { type: String, maxlength: 255 },
    role: { type: Number, },
}, {
    timestamps: true,
});

//Add plugins
User.plugin(AutoIncrement.plugin, {
    model: 'User', 
    field: '_id', 
    startAt: 1,
    incrementBy: 1, 
});

module.exports = mongoose.model('User', User);