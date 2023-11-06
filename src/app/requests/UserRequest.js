const { body } = require('express-validator');
const User = require('../models/User');

// Custom validation middleware to check if a field is unique
const isUniqueCreate = (field) => {
  return async (value, { req }) => {
    try {
      const existingUser = await User.findOne({ [field]: value });
      if (existingUser) {
        throw new Error(`${field} is already in use`);
      }
      return true;
    } catch (error) {
      throw error.message;
    }
  };
};

// Custom validation middleware to check if a field is unique
const isUniqueUpdate = (field) => {
  return async (value, { req }) => {
    try {
      const existingUser = await User.findOne({ [field]: value });
      if (existingUser && existingUser._id != req.params.id) {
        throw new Error(`${field} is already in use`);
      }
      return true;
    } catch (error) {
      throw error.message;
    }
  };
};

exports.UserCreateValidator = [
    body('username').trim().notEmpty().withMessage('ユーザーIDが必須です。')
    .isString().withMessage('ユーザー名は文字列である必要があります。')
    .isLength({ min: 8, max: 20 }).withMessage('ユーザー名の長さは 8 ～ 20 文字にする必要があります。')
    .custom(isUniqueCreate('username')).withMessage('この名前は既に存在します。別の値を入力してください。'),

    body('password').trim().notEmpty().withMessage('パスワードが必須です。')
    .isString().withMessage('パスワードは文字列である必要があります。')
    .isLength({ min: 8, max: 20 }).withMessage('パスワードの長さは 8 ～ 20 文字にする必要があります。')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('パスワードの形式が正しくありません。'),

    body('role').trim().notEmpty().withMessage('権限が必須です。')
];

exports.UserUpdateValidator = [
  body('username').trim().notEmpty().withMessage('ユーザーIDが必須です。')
  .isString().withMessage('ユーザー名は文字列である必要があります。')
  .isLength({ min: 8, max: 20 }).withMessage('ユーザー名の長さは 8 ～ 20 文字にする必要があります。')
  .custom(isUniqueUpdate('username')).withMessage('この名前は既に存在します。別の値を入力してください。'),

  body('password').trim().notEmpty().withMessage('パスワードが必須です。')
  .isString().withMessage('パスワードは文字列である必要があります。')
  .isLength({ min: 8, max: 20 }).withMessage('パスワードの長さは 8 ～ 20 文字にする必要があります。')
  .matches(/^[a-zA-Z0-9]+$/).withMessage('パスワードの形式が正しくありません。'),

  body('role').trim().notEmpty().withMessage('権限が必須です。')
];