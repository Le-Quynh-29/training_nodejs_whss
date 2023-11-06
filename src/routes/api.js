const express = require('express');
const router = express.Router();
const { loginValidator } = require('../app/requests/LoginRequest');
const { UserCreateValidator, UserUpdateValidator } = require('../app/requests/UserRequest');
const { AlarmSettingValidator } = require('../app/requests/AlarmSettingRequest');
const { SensorCreateValidator, SensorUpdateValidator } = require('../app/requests/SensorRequest');
const { DateValidator } = require('../app/requests/ExportCSVRequest');
const authMiddleware = require('../app/middlewares/JwtAuthMiddleware');
const authController = require('../app/controllers/AuthController');
const userController = require('../app/controllers/UserController');
const sensorController = require('../app/controllers/SensorController');
const alarmSettingController = require('../app/controllers/AlarmSettingController');
const gwController = require('../app/controllers/GwController');
const SensorMacController = require('../app/controllers/SensorMacController');
const SensorRecordController = require('../app/controllers/SensorRecordController');
const SensorSettingController = require('../app/controllers/SensorSettingController');

//auth
router.post('/auth/login', loginValidator, authController.login);
router.post('/auth/logout', authMiddleware, authController.logout);

//user
router.post('/user/store', authMiddleware, UserCreateValidator, userController.store);
router.put('/user/update-relationship/:id', authMiddleware, userController.updateRelationship);
router.put('/user/update/:id', authMiddleware, UserUpdateValidator, userController.update);
router.delete('/user/destroy/:id', authMiddleware, userController.destroy);
router.get('/user', authMiddleware, userController.index);

//sensor
router.get('/sensor', authMiddleware, sensorController.index);
router.post('/sensor/store', authMiddleware, SensorCreateValidator, sensorController.store);
router.put('/sensor/update/:id', authMiddleware, SensorUpdateValidator, sensorController.update);
router.delete('/sensor/delete/:id', authMiddleware, sensorController.destroy);

//alarm-setting
router.get('/alarm-setting', authMiddleware, alarmSettingController.index);
router.post('/alarm-setting/create-or-update', authMiddleware, AlarmSettingValidator, alarmSettingController.createOrUpdate);

//sensor-mac
router.get('/sensor-mac/get-num-by-gw', authMiddleware, SensorMacController.getNumByGw);

//gw
router.get('/gw', authMiddleware, gwController.index);
router.post('/gw/create-or-update', authMiddleware, gwController.store);

//sensor-record
router.delete('/sensor-record/delete', authMiddleware, DateValidator, SensorRecordController.destroy);
router.post('/sensor-record/export-radio', authMiddleware, SensorRecordController.exportRadio);
router.post('/sensor-record/export-data', authMiddleware, DateValidator, SensorRecordController.exportData);
router.get('/sensor-record/data-dashboard/:name', authMiddleware, SensorRecordController.getDataDashboardByNameChart);
router.get('/sensor-record/data-show-sensor/:name', authMiddleware, SensorRecordController.getDataChartShowSensor);
router.post('/sensor-record/create-by-all-gw', authMiddleware, SensorRecordController.clickGetDataDashboard);
router.post('/sensor-record/create-by-gw', authMiddleware, SensorRecordController.clickGetDataByDeployment);

//sensor-setting
router.get('/sensor-setting', authMiddleware, SensorSettingController.getSensorSetting);
router.post('/sensor-setting/create-or-update', authMiddleware, SensorSettingController.createOrUpdateSetting);

module.exports = router;