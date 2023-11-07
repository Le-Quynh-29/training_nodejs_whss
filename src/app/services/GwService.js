require('dotenv').config();
const Gw = require('../models/Gw');
const SensorMac = require('../models/SensorMac');
const axios = require('axios');
const whssHelper = require('../helper/WhssHelper');
const sensorMacService = require('../services/SensorMacService');

class GwService {
  /**
   * Get list deployments from api sonas
   * @param {string} token 
   * @param {number} count 
   * @return mixed 
   */
  async getGw(token, count) {
    if (count >= 3) {
      return null;
    }

    try {
      const apiUrl = process.env.WHSS_SONAS_HOST + '/settings/projects/' + process.env.WHSS_SONAS_PROJECT_ID;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.get(apiUrl, config);
      if (res.status === 200) {
        return res.data.data.deployments.map(deployment => deployment.id);
      } else {
        return null;
      }
    } catch (error) {
      if (error.response && error.response.status == 401) {
        const token = await whssHelper.getNewToken();
        return await this.getGw(token, ++count);
      }

      return null;
    };
  }

  /**
   * Create or update a deployment and create or update unit, mac address
   * @param {string} token 
   * @param {number} count 
   * @return void
   */
  async createOrUpdateGwAndSensorMac(token, count) {
    const gws = await this.getGw(token, count);
    if (gws != null) {
      if (gws.length > 0) {
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        for (const deployment of gws) {
          const updateGw = { gw: deployment };
          await Gw.findOneAndUpdate(updateGw, updateGw, options);
          await whssHelper.sendUnitToGw(token, count, deployment, "unitlist assigned");
          const resUnit = await sensorMacService.callCordlessHandsetUnApi(token, count, deployment);
          if (resUnit != null) {
            if (resUnit.length > 0) {
              for (const unit of resUnit) {
                const num = unit.num;
                const querySensorMac = {
                  gwId: deployment,
                  num: num
                };
                for (const hw of unit.hw) {
                  const macAddress = hw.macAddress;
                  const updateSensorMac = {
                    macAddress: macAddress
                  };
                  await SensorMac.findOneAndUpdate(querySensorMac, updateSensorMac, options);
                }
              }
            }
          }
        }
        return 'success';
      }
    }
    return null;
  }

  /**
   * Get list gw
   * @param {*} req
   * @return mixed 
   */
  getListGw() {
    return Gw.aggregate([
      {
        $sort: {
          gw: 1
        }
      },
      {
        $project: {
          gw: 1,
          _id: 0
        }
      }
    ]);
  }
}

module.exports = new GwService();