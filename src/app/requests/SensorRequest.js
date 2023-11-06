const { body } = require('express-validator');
const Sensor = require('../models/Sensor');
const Gw = require('../models/Gw');
const SensorMac = require('../models/SensorMac');

// Custom validation check exist sensor by gw and num create a sensor
const checkExistSensorByGwAndNumCreate = () => {
    return async (value, { req }) => {
        const gwId = req.body.gw_id;
        const num = parseFloat(req.body.sensor_mac_id);
        try {
            if ((gwId != null && num != null) || (gwId != '' && num != '')) {
                const checkExistGwAndNum = await Sensor.findOne({ gwId: gwId, sensorMacId: num });
                if (checkExistGwAndNum) {
                    throw new Error('GWセンサーIDとセンサーIDはすでに存在します。');
                }
            }
            return true;
        } catch (error) {
            throw error.message;
        }
    };
};

// Custom validation check exist sensor by gw and num update a sensor
const checkExistSensorByGwAndNumUpdate = () => {
    return async (value, { req }) => {
        const sensorId = req.params.id;
        const gwId = req.body.gw_id;
        const num = parseFloat(req.body.sensor_mac_id);
        try {
            if ((gwId != null && num != null) || (gwId != '' && num != '')) {
                const checkExistGwAndNum = await Sensor.findOne({ gwId: gwId, sensorMacId: num });
                if (checkExistGwAndNum && checkExistGwAndNum.id != sensorId) {
                    throw new Error('GWセンサーIDとセンサーIDはすでに存在します。');
                }
            }

            return true;
        } catch (error) {
            throw error.message;
        }
    };
};

// Custom validation check exist gw
const checkExistGw = (field) => {
    return async (value, { req }) => {
        try {
            const isExistGw = await Gw.findOne({ [field]: value });
            if (!isExistGw) {
                throw new Error('GWセンサーIDが存在しません。');
            }

            return true;
        } catch (error) {
            throw error.message;
        }
    };
};

// Custom validation check exist sensor mac
const checkExistSensorMac = (field) => {
    return async (value, { req }) => {
        const gw = req.body.gw_id;
        try {
            const isExistSensorMac = await SensorMac.findOne({ gwId: gw, [field]: value });
            if (!isExistSensorMac) {
                throw new Error('センサIDが存在しません。');
            }

            return true;
        } catch (error) {
            throw error.message;
        }
    };
};

exports.SensorCreateValidator = [
    body('name').trim().notEmpty().withMessage('この項目は入力必須です。')
        .isString().withMessage('センサ名は文字列である必要があります。')
        .isLength({ min: 0, max: 20 }).withMessage('20 文字以内で入力してください。'),
    body('place').trim().notEmpty().withMessage('この項目は入力必須です。')
        .isString().withMessage('センサ名は文字列である必要があります。')
        .isLength({ min: 0, max: 20 }).withMessage('20 文字以内で入力してください。'),
    body('gw_name').trim().notEmpty().withMessage('この項目は入力必須です。')
        .isString().withMessage('センサ名は文字列である必要があります。')
        .isLength({ min: 0, max: 20 }).withMessage('20 文字以内で入力してください。'),
    body('gw_id').trim().notEmpty().withMessage('この項目は入力必須です。')
        .custom(checkExistSensorByGwAndNumCreate()).withMessage('GWセンサーIDとセンサーIDはすでに存在します。')
        .custom(checkExistGw('gw')).withMessage('GWセンサーIDが存在しません。'),
    body('sensor_mac_id').trim().notEmpty().withMessage('この項目は入力必須です。')
        .custom(checkExistSensorByGwAndNumCreate()).withMessage('GWセンサーIDとセンサーIDはすでに存在します。')
        .custom(checkExistSensorMac('num')).withMessage('センサIDが存在しません。')
];

exports.SensorUpdateValidator = [
    body('name').trim().notEmpty().withMessage('この項目は入力必須です。')
        .isString().withMessage('センサ名は文字列である必要があります。')
        .isLength({ min: 0, max: 20 }).withMessage('20 文字以内で入力してください。'),
    body('place').trim().notEmpty().withMessage('この項目は入力必須です。')
        .isString().withMessage('センサ名は文字列である必要があります。')
        .isLength({ min: 0, max: 20 }).withMessage('20 文字以内で入力してください。'),
    body('gw_name').trim().notEmpty().withMessage('この項目は入力必須です。')
        .isString().withMessage('センサ名は文字列である必要があります。')
        .isLength({ min: 0, max: 20 }).withMessage('20 文字以内で入力してください。'),
    body('gw_id').trim().notEmpty().withMessage('この項目は入力必須です。')
        .custom(checkExistSensorByGwAndNumUpdate()).withMessage('GWセンサーIDとセンサーIDはすでに存在します。')
        .custom(checkExistGw('gw')).withMessage('GWセンサーIDが存在しません。'),
    body('sensor_mac_id').trim().notEmpty().withMessage('この項目は入力必須です。')
        .custom(checkExistSensorByGwAndNumUpdate()).withMessage('GWセンサーIDとセンサーIDはすでに存在します。')
        .custom(checkExistSensorMac('num')).withMessage('センサIDが存在しません。')
];