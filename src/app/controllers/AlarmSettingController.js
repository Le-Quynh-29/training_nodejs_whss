const baseController = require("./BaseController.js");
const AlarmSetting = require('../models/AlarmSetting');
const { validationResult } = require('express-validator');
const alarmSettingService = require('../services/AlarmSettingService');

class AlarmSettingController {
    /**
     * Get a alarm setting by authorization
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    index(req, res) {
        alarmSettingService.getAlarmSetting(req).then(users => {
            return baseController.responseSuccess(res, users);
        }).catch((err) => {
            return baseController.responseError(res, err.message);
        });
    }

    /**
     * Create or update a new alarm setting
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    createOrUpdate(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // If there are errors, you can access them as an array of objects
            const errorArray = errors.array();

            // Create an array to store error messages
            const errorMessages = errorArray.map((error) => error.msg);
            return res.status(400).json({ errors: errorMessages });
        }
        alarmSettingService.createOrUpdateAlarmSetting(req).then(users => {
            return baseController.responseSuccess(res, 'データは正常に更新されました。');
        }).catch((err) => {
            return baseController.responseError(res, err.message);
        });
    }
}

module.exports = new AlarmSettingController();