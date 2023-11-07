const SensorMac = require('../models/SensorMac');
const whssHelper = require('../helper/WhssHelper');
const axios = require('axios');
const Gw = require('../models/Gw');

class SensorMacService {
    /**
     * get mac address by deployment and unit
     * @param {*} req 
     * @return mixed
     */
    getMacAddressByGwAndNum(req) {
        let gwId = req.body.gw_id;
        let num = req.body.num;
        return SensorMac.findOne({ gwId: gwId, num: num });
    }

    async callCordlessHandsetUnApi(token, count, deployment) {
        if (count >= 3) {
            return null;
        }
        try {
            const apiUrl = process.env.WHSS_SONAS_HOST + '/settings/units';
            const requestData = {
                params: {
                    project_id: process.env.WHSS_SONAS_PROJECT_ID,
                    deployment_id: deployment
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const res = await axios.get(apiUrl, requestData);
            if (res.status === 200) {
                return res.data.data;
            } else {
                return null;
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                token = await whssHelper.getNewToken();
                return await this.callCordlessHandsetUnApi(token, ++count, deployment);
            }
            return null;
        }
    }

    /**
     * Get num by gw
     * @param {*} req
     * @return mixed 
     */
    async getNumByGw(req) {
        const gwId = req.query.gw_id;
        const gw = await Gw.aggregate([
            {
                $match: {
                    gw: gwId
                }
            },
            {
                $lookup: {
                    from: "sensormacs",
                    localField: "gw",    
                    foreignField: "gwId",
                    as: "sensorMacs"
                }
            },
            {
                $lookup: {
                    from: "sensors",
                    localField: "gw",   
                    foreignField: "gwId", 
                    as: "sensors"
                }
            },
            {
                $group: {
                    _id: "$gw",
                    value_sensor_macs: { $push: "$sensorMacs.num" },
                    value_sensors: { $push: "$sensors.sensorMacId" }
                },
            }
        ]);
        const convertGw = Object.assign({}, ...gw);
        const numUnregistered = convertGw.value_sensor_macs[0]
        .filter(num => convertGw.value_sensors[0].indexOf(num) === -1)
        .sort((a, b) => a - b);
        return numUnregistered;
    }
}

module.exports = new SensorMacService();