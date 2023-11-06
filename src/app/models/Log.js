const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-plugin-autoinc');
const Schema = mongoose.Schema;

const Log = new Schema({
    gwId: { type: String, required: true, maxlength: 255 },
    httpCode: { type: String, required: true, maxlength: 255 },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    lastTimestamp: { type: Number, required: true },
    isManual: { type: Boolean, required: true },
    content: { type: String, required: true, maxlength: 255 },
}, {
    timestamps: true,
});

//Add plugins
Log.plugin(AutoIncrement.plugin, {
    model: 'Log', 
    field: '_id', 
    startAt: 1,
    incrementBy: 1, 
});

module.exports = mongoose.model('Log', Log);