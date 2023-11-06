const User = require('../models/User');
const UserSensor = require('../models/UserSensor');
const SensorSetting = require('../models/SensorSetting');
const AlarmSetting = require('../models/AlarmSetting');
const bcrypt = require('bcrypt');

class UserService {
    /**
     * Get all the users
     * @param {*} req 
     * @return mixed 
     */
    getAllUsers(req) {
        const itemsPerPage = parseInt(req.query.size);
        const page = parseInt(req.query.page);
        const column = req.query.column;
        const sortBy = parseInt(req.query.sort_by);
        let userQuery = User.aggregate([
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
    
        return userQuery;
    }

    /**
     * Create a new user or copy and create a new user
     * @param {*} req 
     * @return void
     */
    async createUser(req) {
        const userIdCopy = req.body.user_id;
        const formData = {
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10),
            passwordRaw: req.body.password,
            role: req.body.role,
        };
        const user = await User.create(formData);
    
        if (userIdCopy != -1) {
            //create sensor setting
            await SensorSetting.find({ userId: userIdCopy }).then(async(sensorSettings) => {
                const data = sensorSettings.map((sensorSetting) => {
                    return {
                        sensorId: sensorSetting.sensorId,
                        userId: user._id,
                        voltageDifference: sensorSetting.voltageDifference,
                        temperature: sensorSetting.temperature,
                        humidity: sensorSetting.humidity,
                        pressure: sensorSetting.pressure,
                        ph: sensorSetting.ph,
                        longevity: sensorSetting.longevity,
                        sendCount: sensorSetting.sendCount,
                    };
                });
                await SensorSetting.insertMany(data);
            }).catch((err) => {
                console.log(err.message);
            });

            //create alarm setting 
            await AlarmSetting.findOne({ userId: userIdCopy }).then(async(alarmSetting) => {
                const data = {
                    alarmHydrogenValueLevel1: alarmSetting.alarmHydrogenValueLevel1,
                    alarmHydrogenValueLevel2: alarmSetting.alarmHydrogenValueLevel2,
                    chartHydrogenStatusMarkerLevel1: alarmSetting.chartHydrogenStatusMarkerLevel1,
                    chartHydrogenStatusMarkerLevel2: alarmSetting.chartHydrogenStatusMarkerLevel2,
                    chartHydrogenStatusDashedLineLevel1: alarmSetting.chartHydrogenStatusDashedLineLevel1,
                    chartHydrogenStatusDashedLineLevel2: alarmSetting.chartHydrogenStatusDashedLineLevel2,
                    statusDashedLineLevel2: alarmSetting.statusDashedLineLevel2,
                    userId: user._id,
                }
                await AlarmSetting.insertMany(data);
            }).catch((err) => {
                console.log(err.message);
            });

            //create user sensor
            await UserSensor.find({ userId: userIdCopy }).then(async(userSensors) => {
                const data = userSensors.map((userSensor) => {
                    return {
                        sensorId: userSensor.sensorId,
                        userId: user._id,
                    };
                });
                await UserSensor.insertMany(data);
            }).catch((err) => {
                console.log(err.message);
            });
        }
    }

    /**
     * Update a user
     * @param {*} req
     * @return mixed 
     */
    updateUser(req) {
        const userId = req.params.id;
        const formData = {
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10),
            passwordRaw: req.body.password,
            role: req.body.role,
        };
        return User.updateOne({ _id: userId }, formData);
    }

    /**
     * Update user relationship
     * @param {*} req 
     * @return void
     */
    async updateUserRelationship(req) {
        const userId = req.params.id;
        await UserSensor.deleteMany({ userId: userId });
        const sensorIds = req.body.sensor_id.split(',');
        const userRelationship = sensorIds.map((value) => {
            return {
                sensorId: value,
                userId: userId,
            };
        });
        await UserSensor.insertMany(userRelationship);
    }

    /**
     * Delete user relationship and delete user
     * @param {*} req
     * @return void
     */
    async deleteUser(req) {
        const userId = req.params.id;
        await UserSensor.deleteMany({ userId: userId });
        await SensorSetting.deleteMany({ userId: userId });
        await AlarmSetting.deleteOne({ userId: userId });
        await User.deleteOne({ _id: userId });
    }
}

module.exports = new UserService();
