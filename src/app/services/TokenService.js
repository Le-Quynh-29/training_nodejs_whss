const Token = require('../models/Token');

class TokenService {
    /**
     * Get a token
     * @return mixed
     */
    async getToken() {
        const token = await Token.findOne({});
        return token != null ? token.token : null;
    }
}

module.exports = new TokenService();