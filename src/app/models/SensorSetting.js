const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const SensorSetting = new Schema({
    sensorId: { type: Number, required: true },
    userId: { type: Number, required: true },
    voltageDifference: { type: Array },
    temperature: { type: Array },
    humidity: { type: Array },
    pressure: { type: Array },
    ph: { type: Array },
    longevity: { type: Array },
    sendCount: { type: Array },
}, {
    timestamps: true,
});

//Add plugins
SensorSetting.plugin(AutoIncrement.plugin, {
    model: 'SensorSetting', 
    field: '_id', 
    startAt: 1,
    incrementBy: 1, 
});

module.exports = mongoose.model('SensorSetting', SensorSetting);