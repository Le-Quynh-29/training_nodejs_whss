const baseController = require("./BaseController");
const SensorMac = require('../models/SensorMac');
const SensorMacService = require('../services/SensorMacService');

class SensorMacController {
    /**
     * Get mac address by deployment and unit
     * @param {*} req 
     * @param {*} res 
     * @return mixed 
     */
    getMacAddress(req, res) {
        SensorMacService.getMacAddressByGwAndNum(req).then(sensorMac => {
            return baseController.responseSuccess(res, sensorMac);
        }).catch((err) => {
            return baseController.responseError(res, err.message);
        });
    }

    /**
     * Get num by gw
     * @param {*} req 
     * @param {*} res
     * @return mixed  
     */
    async getNumByGw(req, res) {
        const num = await SensorMacService.getNumByGw(req);
        return baseController.responseSuccess(res, num);
    }
}

module.exports = new SensorMacController();