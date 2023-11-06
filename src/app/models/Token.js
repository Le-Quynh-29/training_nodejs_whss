const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const Token = new Schema({
    token: { type: String, required: true },
}, {
    timestamps: true,
});

//Add plugins
Token.plugin(AutoIncrement.plugin, {
    model: 'Token', 
    field: '_id', 
    startAt: 1,
    incrementBy: 1, 
});

module.exports = mongoose.model('Token', Token);