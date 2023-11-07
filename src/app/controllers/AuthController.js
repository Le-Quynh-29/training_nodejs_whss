require('dotenv').config();
const baseController = require("./BaseController.js");
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const blacklistedTokens = [];

class AuthController {
    /**
     * Login
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    login(req, res) {
        const username = req.body.username;
        const password = req.body.password;

        // Check for validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // If there are errors, you can access them as an array of objects
            const errorArray = errors.array();

            // Create an array to store error messages
            const errorMessages = errorArray.map((error) => error.msg);
            return res.status(400).json({ errors: errorMessages });
        }

        // Authenticate user
        User.findOne({ username: username }).then(async (user) => {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Authentication failed' });
            }

            const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
            res.json({
                user_id: user._id,
                user_name: user.username,
                role: user.role,
                access_token: token,
                token_type: 'bearer',
                expires_in: '1d',
            });
        }).catch((error) => { return baseController.responseError(res, error); });
    }

    /**
     * Logout
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    logout(req, res) {
        const token = req.headers.authorization;
        if (token && !blacklistedTokens.includes(token)) {
            blacklistedTokens.push(token);
        } else if (blacklistedTokens.includes(token)) {
            return baseController.responseSuccess(res, { message: 'Logout failded' });
        }
        return baseController.responseSuccess(res, { message: 'Logout successful' });
    }
}

module.exports = new AuthController();