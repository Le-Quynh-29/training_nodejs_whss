const Log = require('../models/Log');

class LogService {
    /**
     * Creates a new Log
     * @param {String} deployment 
     * @param {String} httpCode 
     * @param {Number} startTime 
     * @param {Number} endTime 
     * @param {Number} lastTimestamp 
     * @param {String} content 
     * @param {Boolean} isManual 
     * @return void
     */
    async createLog(deployment, httpCode, startTime, endTime, lastTimestamp, content, isManual) {
        const query = { gwId: deployment, startTime: startTime };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const formData = {
            gwId: deployment,
            httpCode: httpCode,
            startTime: startTime,
            endTime: endTime,
            lastTimestamp: lastTimestamp,
            isManual: isManual,
            content: content
        };
        await Log.findOneAndUpdate(query, formData, options);
    }
}

module.exports = new LogService();