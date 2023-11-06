const { body } = require('express-validator');

exports.loginValidator = [
    body('username').trim().notEmpty().withMessage('ユーザーIDが必須です。')
    .isString().withMessage('ユーザー名は文字列である必要があります。')
    .isLength({ min: 8, max: 20 }).withMessage('ユーザー名の長さは 8 ～ 20 文字にする必要があります。'),

    body('password').trim().notEmpty().withMessage('パスワードが必須です。')
    .isString().withMessage('パスワードは文字列である必要があります。')
    .isLength({ min: 8, max: 20 }).withMessage('パスワードの長さは 8 ～ 20 文字にする必要があります。')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('パスワードの形式が正しくありません。'),
];