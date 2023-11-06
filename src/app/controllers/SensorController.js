const baseController = require("./BaseController.js");
const Sensor = require('../models/Sensor');
const sensorService = require('../services/SensorService');
const { validationResult } = require('express-validator');

class SensorController {
    /**
     * Get all sensors
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    index(req, res) {
        sensorService.getAllSensors(req).then(sensors => {
            return baseController.responseSuccess(res, sensors);
        }).catch((err) => {
            return baseController.responseError(res, err.message);
        });
    }

    /**
     * Create a new sensor
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    store(req, res) {
        // Check for validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // If there are errors, you can access them as an array of objects
            const errorArray = errors.array();

            // Create an array to store error messages
            const errorMessages = errorArray.map((error) => error.msg);
            return res.status(400).json({ errors: errorMessages });
        }

        sensorService.createSensor(req).then(sensors => {
            return baseController.responseSuccess(res, 'データは正常に更新されました。');
        }).catch((err) => {
            return baseController.responseError(res, err.message);
        });
    }

    /**
     * Update a sensor
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    update(req, res) {
        const id = req.params.id;
        const sensor = Sensor.findOne({ _id: id});
        if (!sensor) {
            return baseController.responseError(res, 'データが存在しません。', 404);
        }

        // Check for validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // If there are errors, you can access them as an array of objects
            const errorArray = errors.array();

            // Create an array to store error messages
            const errorMessages = errorArray.map((error) => error.msg);
            return res.status(400).json({ errors: errorMessages });
        }

        sensorService.updateSensor(req).then(sensors => {
            return baseController.responseSuccess(res, 'データは正常に更新されました。');
        }).catch((err) => {
            return baseController.responseError(res, err.message);
        });
    }

    /**
     * Delete a sensor
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    destroy(req, res) {
        const id = req.params.id;
        const sensor = Sensor.findOne({ _id: id});
        if (!sensor) {
            return baseController.responseError(res, 'データが存在しません。', 404);
        }
        sensorService.deleteSensor(req);
        return baseController.responseSuccess(res, '削除しました。'); 
    }
}

module.exports = new SensorController();