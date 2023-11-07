require('dotenv').config();
const axios = require('axios');
const Token = require('../models/Token');
const qs = require('querystring');

class WhssHelper {
    /**
     * get new token
     * @returns mixed
     */
    async getNewToken() {
        try {
            const apiUrl = process.env.WHSS_AUTH_TOKEN_URL;
            const requestData = {
                grant_type: process.env.WHSS_AUTH_TOKEN_GRANT_TYPE,
                client_id: process.env.WHSS_AUTH_TOKEN_CLIENT_ID,
                refresh_token: process.env.WHSS_AUTH_REFRESH_TOKEN,
            };
            const res = await axios.post(apiUrl, qs.stringify(requestData));
            if (res.status === 200) {
                const access_token = res.data.access_token;
                const query = {};
                const update = { token: access_token };
                const options = { upsert: true, new: true, setDefaultsOnInsert: true };
                await Token.findOneAndUpdate(query, update, options);
                return access_token;
            } else {
                throw new Error('Server returned non-200 status code');
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * send unit to deployment
     * @param {string} token 
     * @param {number} count 
     * @param {string} deployment 
     * @param {string} body 
     */
    async sendUnitToGw(token, count, deployment, body) {
        if (count >= 3) {
            return;
        } 
        try {
            const apiUrl = process.env.WHSS_SONAS_HOST + '/settings/deployments/' + deployment + '/action?project_id=' + process.env.WHSS_SONAS_PROJECT_ID;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            await axios.post(apiUrl, [body], config);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                token = await this.getNewToken();
                return await this.sendUnitToGw(token, ++count, deployment, body);
            }
            return;
        }
        
    }
}

module.exports = new WhssHelper();