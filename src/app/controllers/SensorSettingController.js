const baseController = require("./BaseController.js");
const SensorSettingService = require('../services/SensorSettingService');

class SensorSettingController {
    /**
     * Get sensor setting
     * @param {*} req 
     * @param {*} res 
     * @return mixed 
     */
    getSensorSetting(req, res) {
        SensorSettingService.getSensorSetting(req).then(sensorSetting => {
            return baseController.responseSuccess(res, sensorSetting);
        }).catch((err) => {
            return baseController.responseError(res, err.message);
        });
    }

    /**
     * Create or update a new sensor setting
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    createOrUpdateSetting(req, res) {
        SensorSettingService.createOrUpdateSetting(req).then(setting => {
            return baseController.responseSuccess(res, 'データは正常に更新されました。');
        }).catch(err => {
            return baseController.responseError(res, err.message);
        });
    }
}

module.exports = new SensorSettingController();
