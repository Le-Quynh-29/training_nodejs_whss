const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const SensorMac = new Schema({
    gwId: { type: String, required: true },
    num: { type: Number, required: true },
    macAddress: { type: String, required: true, maxlength: 255 },
}, {
    timestamps: true,
});

//Add plugins
SensorMac.plugin(AutoIncrement.plugin, {
    model: 'SensorMac', 
    field: '_id', 
    startAt: 1,
    incrementBy: 1, 
});

module.exports = mongoose.model('SensorMac', SensorMac);