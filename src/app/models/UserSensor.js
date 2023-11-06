const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const UserSensor = new Schema({
    sensorId: { type: Number, required: true },
    userId: { type: Number, required: true },
}, {
    timestamps: false,
});

//Add plugins
UserSensor.plugin(AutoIncrement.plugin, {
    model: 'UserSensor', 
    field: '_id', 
    startAt: 1,
    incrementBy: 1, 
});

module.exports = mongoose.model('UserSensor', UserSensor);