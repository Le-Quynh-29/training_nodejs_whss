const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const SensorRecord = new Schema({
    timestamp: { type: Number, required: true },
    body: { type: String, required: true, maxlength: 255 },
    dataType1: { type: String, required: true, maxlength: 255 },
    dataType2: { type: String, required: true, maxlength: 255 },
    gwId: { type: String, required: true },
    sensorId: { type: Number, required: true },
    ph: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    pressure: { type: Number, required: true },
    sendCount: { type: Number, required: true },
    voltageDifference: { type: Number, required: true },
    longevity: { type: Number, required: true },
}, {
    timestamps: true,
});

//Add plugins
SensorRecord.plugin(AutoIncrement.plugin, {
    model: 'SensorRecord', 
    field: '_id', 
    startAt: 1,
    incrementBy: 1, 
});

exports.textTitle = [
    ph => '水素濃度',
    pressure => '気圧',
    humidity => '湿度',
    temperature => '温度',
    voltage_difference => 'センサ差電圧',
    send_count => '送信カウント',
    longevity => 'センサ予測寿命',
];

exports.unit = [
    ph => '[%]',
    pressure => '[hPa]',
    humidity => '[%]',
    temperature => '[°C]',
    voltage_difference => '[回]',
    send_count => '[mV]',
    longevity => '[日]',
];
module.exports = mongoose.model('SensorRecord', SensorRecord);