const { body } = require('express-validator');
const AlarmSetting = require('../models/AlarmSetting');

// Custom validation middleware to check compare two numbers
const compareNumbers = () => {
    return async (value, { req }) => {
        const numberOne = parseFloat(req.body.alarm_hydrogen_value_level_1); 
        const numberTwo = parseFloat(req.body.alarm_hydrogen_value_level_2); 
        try {
            if (numberOne < numberTwo) {
                throw new Error(`警報設定値 > 自主警報設定値を入力してください。`);
            }
            return true;
        } catch (error) {
            throw error.message;
        }
    };
};

exports.AlarmSettingValidator = [
    body('alarm_hydrogen_value_level_1').trim().notEmpty().withMessage('この項目は入力必須です。')
        .isFloat({ min: 0, max: 100 }).withMessage('0.0～100.0を入力してください。')
        .matches(/^100(\.(0){0,2})?$|^([1-9]?[0-9])(\.(\d?))?$/).withMessage('0.0～100.0を入力してください。')
        .custom(compareNumbers()).withMessage('警報設定値 > 自主警報設定値を入力してください。'),

    body('alarm_hydrogen_value_level_2').trim().notEmpty().withMessage('この項目は入力必須です。')
        .isFloat({ min: 0, max: 100 }).withMessage('0.0～100.0を入力してください。')
        .matches(/^100(\.(0){0,2})?$|^([1-9]?[0-9])(\.(\d?))?$/).withMessage('0.0～100.0を入力してください。')
        .custom(compareNumbers()).withMessage('警報設定値 > 自主警報設定値を入力してください。')
];