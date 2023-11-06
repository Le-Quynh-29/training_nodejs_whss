const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const Gw = new Schema({
    gw: { type: String, required: true },
}, {
    timestamps: true,
});

//Add plugins
Gw.plugin(AutoIncrement.plugin, {
    model: 'Gw', 
    field: '_id', 
    startAt: 1,
    incrementBy: 1, 
});

module.exports = mongoose.model('Gw', Gw);