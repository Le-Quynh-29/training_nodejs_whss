require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = function authenticateToken(req, res, next) {
    let token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    token = token.replace('Bearer ', '');
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
}