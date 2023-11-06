const baseController = require("./BaseController.js");
const User = require('../models/User');
const { validationResult } = require('express-validator');
const userService = require('../services/UserService');

class UserController {
    /**
     * Get all users
     * @param {*} req 
     * @param {*} res 
     * @return mixed 
     */
    index(req, res) {
        userService.getAllUsers(req).then(users => {
            return baseController.responseSuccess(res, users);
        })
        .catch((err) => { 
            return baseController.responseError(res, err.message);
         });
    }

    /**
     * Create or copy a user
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

        userService.createUser(req);
        return baseController.responseSuccess(res, 'データは正常に更新されました。');
    }

    /**
     * Update a user
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    update(req, res) {
        const id = req.params.id;
        const user = User.findOne({ _id: id});
        if (!user) {
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

        userService.updateUser(req).then(users => {
            return baseController.responseSuccess(res, 'データは正常に更新されました。');
        })
        .catch((err) => { 
            return baseController.responseError(res, err.message);
         });
    }

    /**
     * Update user relationship
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    updateRelationship(req, res) {
        const id = req.params.id;
        const user = User.findOne({ _id: id});
        if (!user) {
            return baseController.responseError(res, 'データが存在しません。', 404);
        }
        userService.updateUserRelationship(req);
        return baseController.responseSuccess(res, 'データは正常に更新されました。'); 
    }

    /**
     * Delete a user
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    destroy(req, res) {
        const id = req.params.id;
        const user = User.findOne({ _id: id});
        if (!user) {
            return baseController.responseError(res, 'データが存在しません。', 404);
        }
        userService.deleteUser(req);
        return baseController.responseSuccess(res, '削除しました。'); 
    }
}

module.exports = new UserController();