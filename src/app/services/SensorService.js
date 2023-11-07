const Sensor = require('../models/Sensor');
const UserSensor = require('../models/UserSensor');
const UserSetting = require('../models/SensorSetting');

class SensorService {
    /**
     * Get all sensors
     * @param {*} req 
     * @return mixed
     */
    getAllSensors(req) {
        const itemsPerPage = parseInt(req.query.size);
        const page = parseInt(req.query.page);
        const column = req.query.column;
        const sortBy = parseInt(req.query.sort_by);

        let sensorQuery = Sensor.aggregate([
            {
                $lookup: {
                    from: 'sensormacs',
                    let: {
                        gwId: "$gwId",
                        sensorMacId: "$sensorMacId"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$gwId", "$$gwId"] },
                                        { $eq: ["$num", "$$sensorMacId"] }
                                    ]
                                }
                            }
                        },
                    ],
                    as: 'sensorMacs',
                },
            },
            // {
            //     $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$sensorMacs", 0 ] }, "$$ROOT" ] } }
            //  },
            //  { $project: { sensorMacs: 0 } }
            {
                $project: {
                    _id: 1,
                    name: 1,
                    place: 1,
                    gwName: 1,
                    gwId: 1,
                    sensorMacId: 1,
                    macAddress: { $arrayElemAt: ["$sensorMacs.macAddress", 0] }
                }
            },
            {
                $sort: {
                    [column]: sortBy
                }
            },
            {
                $skip: page * itemsPerPage, // Bỏ qua các tài liệu trên trang trước
            },
            {
                $limit: itemsPerPage, // Giới hạn số lượng tài liệu lấy
            },
        ]);

        return sensorQuery;
    }

    /**
     * Create a new sensor
     * @param {*} req 
     * @returns mixed
     */
    createSensor(req) {
        const formData = {
            name: req.body.name,
            place: req.body.place,
            gwName: req.body.gw_name,
            gwId: req.body.gw_id,
            sensorMacId: req.body.sensor_mac_id,
        };
        return Sensor.create(formData);
    }

    /**
     * Update a sensor
     * @param {*} req 
     * @return mixed
     */
    updateSensor(req) {
        const id = req.params.id;
        const formData = {
            name: req.body.name,
            place: req.body.place,
            gwName: req.body.gw_name,
            gwId: req.body.gw_id,
            sensorMacId: req.body.sensor_mac_id,
        };
        return Sensor.updateOne({ _id: id }, formData);
    }

    /**
     * Delete a sensor
     * @param {*} req 
     * @return mixed
     */
    async deleteSensor(req) {
        const id = req.params.id;
        await UserSetting.deleteMany({ sensorId: id });
        await UserSensor.deleteMany({ sensorId: id });
        await Sensor.deleteOne({ _id: id });
    }

    /**
     * Get show sensor
     * @param {*} sensorId 
     * @return mixed
     */
    getSensor(sensorId) {
        return Sensor.findOne({ _id: sensorId });
    }

    /**
     * Get sensor by user
     * @param {Number} userId 
     * @return mixed
     */
    async getSensorByUser(userId) {
        userId = parseInt(userId);
        const data = await UserSensor.aggregate([
            {
                $lookup: {
                    from: "sensors",
                    localField: "sensorId",   
                    foreignField: "_id",
                    as: "sensors"
                }
            },
            { 
                $match: {
                    userId: userId
                }
            }, 
            {
                $project: {
                    _id: 0,
                    sensorId: 1, 
                }
            }
        ]);
        return data.map((value) => value.sensorId);
    }

    /**
     * Get list sensor
     * @return mixed
     */
    async getListSensor() {
        return await Sensor.aggregate([
            {
                $project: {
                    _id: 1, 
                    name: 1
                }
            }
        ]);
    }
}

module.exports = new SensorService();