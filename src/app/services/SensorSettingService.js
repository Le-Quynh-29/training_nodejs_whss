const SensorSetting = require('../models/SensorSetting');

class SensorSettingService {
    /**
     * Get sensor setting
     * @param {*} req 
     * @return mixed
     */
    getSensorSetting(req) {
        return SensorSetting.findOne({ userId: req.user.userId, sensorId: req.query.sensor_id});
    }

    /**
     * Create or update sensor setting
     * @param {*} req 
     * @return mixed 
     */
    createOrUpdateSetting(req) {
        const column = req.body.column;
        const sensorId = req.body.sensor_id;
        const userId = req.user.userId;
        const formDate = {
            sensorId: sensorId,
            userId: userId,
            [column]: req.body.setting
        };
        const query = { sensorId: sensorId, userId: userId };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        return SensorSetting.findOneAndUpdate(query, formDate, options);
    }
}

module.exports = new SensorSettingService();