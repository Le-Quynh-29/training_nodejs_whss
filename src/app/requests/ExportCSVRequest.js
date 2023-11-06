const { body } = require('express-validator');
const moment = require('moment');

const isDateFormatValid = () => {
    return async (value, { req }) => {
        try {
            const dateFormatPattern = /^\d{4}\/\d{2}\/\d{2}$/;
            if (value == ''|| value == null || dateFormatPattern.test(value)) {
                return true;
            }
            throw new Error('日付形式が正しくありません。');
        } catch (error) {
            throw error.message;
        }
    };
};

const comparateStartDateAndEndDate = () => {
    return async (value, { req }) => {
        const startDate = req.body.start_date;
        const endDate = req.body.end_date;
        try {
            const unixStartDate = parseInt(moment(startDate, 'YYYY/MM/DD').unix());
            const unixEndDate = parseInt(moment(endDate, 'YYYY/MM/DD').unix());
            if ((startDate != '' || startDate != null) && (endDate != '' || endDate != null) && unixStartDate > unixEndDate) {
                throw new Error('開始日は終了日より前の日付にする必要があります。');
            }
            return true;
        } catch (error) {
            throw error.message;
        }
    };
};

exports.DateValidator = [
    body('start_date').trim()
        .custom(isDateFormatValid()).withMessage('日付形式が正しくありません。')
        .custom(comparateStartDateAndEndDate()).withMessage('開始日は終了日より前の日付にする必要があります。'),
    body('end_date').trim()
        .custom(isDateFormatValid()).withMessage('日付形式が正しくありません。')
        .custom(comparateStartDateAndEndDate()).withMessage('開始日は終了日より前の日付にする必要があります。')
];