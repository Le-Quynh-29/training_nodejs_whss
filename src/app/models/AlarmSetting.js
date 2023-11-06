const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const AlarmSetting = new Schema({
    alarmHydrogenValueLevel1: { type: Number, required: true, min: 0, max: 100 },
    alarmHydrogenValueLevel2: { type: Number, required: true, min: 0, max: 100 },
    chartHydrogenStatusMarkerLevel1: { type: Number, required: true },
    chartHydrogenStatusMarkerLevel2: { type: Number, required: true },
    chartHydrogenStatusDashedLineLevel1: { type: Number, required: true },
    chartHydrogenStatusDashedLineLevel2: { type: Number, required: true },
    statusDashedLineLevel2: { type: Number, required: true },
    userId: { type: Number, required: true },
}, {
    timestamps: true,
});

//Add plugins
AlarmSetting.plugin(AutoIncrement.plugin, {
    model: 'AlarmSetting', 
    field: '_id', 
    startAt: 1,
    incrementBy: 1, 
});

module.exports = mongoose.model('AlarmSetting', AlarmSetting);