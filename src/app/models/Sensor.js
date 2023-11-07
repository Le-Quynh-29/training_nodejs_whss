const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const Sensor = new Schema({
    name: { type: String, required: true, maxlength: 20 },
    place: { type: String, required: true, maxlength: 20 },
    gwName: { type: String, required: true, maxlength: 20 },
    gwId: { type: String, required: true },
    sensorMacId: { type: Number, required: true },
}, {
    timestamps: true,
});

//Add plugins
Sensor.plugin(AutoIncrement.plugin, {
    model: 'Sensor',
    field: '_id',
    startAt: 1,
    incrementBy: 1,
});

module.exports = mongoose.model('Sensor', Sensor);