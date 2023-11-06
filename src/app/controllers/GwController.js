const baseController = require("./BaseController.js");
const Gw = require('../models/Gw');
const gwService = require('../services/GWService');
const tokenService = require('../services/TokenService');

class GwController {
    /**
     * Get all gws
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    index(req, res) {
        gwService.getListGw().then(gws => {
            return baseController.responseSuccess(res, gws);
        }).catch((err) => {
            return baseController.responseError(res, err.message);
        });
    }
    
    /**
     * Create or update gw and sensor mac
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    async store(req, res) {
        const token = await tokenService.getToken();
        const count = 0;
        const gws = await gwService.createOrUpdateGwAndSensorMac(token, count);
        if (gws == null) {
            return baseController.responseError(res, '失敗。リストを取得できませんでした。');
        }
        return baseController.responseSuccess(res, '成功。リストを取得しました。');
    }
}

module.exports = new GwController();