const baseController = require("./BaseController.js");
const sensorRecordService = require('../services/SensorRecordService');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const gwService = require('../services/GwService');

class SensorRecordController {
    /**
     * Delete data by time
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    destroy(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // If there are errors, you can access them as an array of objects
            const errorArray = errors.array();

            // Create an array to store error messages
            const errorMessages = errorArray.map((error) => error.msg);
            return res.status(400).json({ errors: errorMessages });
        }

        const startDate = req.body.start_date;
        const endDate = req.body.end_date;
        if (startDate != '' || startDate != null || endDate != '' || endDate != null) {
            sensorRecordService.deleteSensorRecord(startDate, endDate).then(sensorRecords => {
                return baseController.responseSuccess(res, 'センサデータを削除されました。');
            }).catch((err) => {
                return baseController.responseError(res, err.message);
            });
        }
    }

    /**
     * Export data api
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    async exportRadio(req, res) {
        const deployment = req.body.deployment;
        const dataExport = await sensorRecordService.exportRadio(deployment);
        const filePath = dataExport.path;
        const data = dataExport.data;
        const time = dataExport.time;

        if (data.length > 0) {
            // Create a writable stream to the CSV file
            const stream = fs.createWriteStream(filePath);

            // Iterate through the data and write it to the file
            data.forEach((item) => {
                const csvLine = time + ',' + item.recvUnitId + ',' + item.sendUnitId + ',' + item.rssiMax + ',' + item.rssiMin
                    + ',' + item.rssiAvg + ',' + item.rssiVar + ',' + item.sendCnt + ',' + item.recvCnt + '\n';
                stream.write(csvLine);
            });

            // Close the stream to finish writing
            stream.end(() => {
                res.download(filePath, path.basename(filePath), (err) => {
                    if (err) {
                        baseController.responseError(res, 'ダウンロードに失敗しました。', 500);
                    } else {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                baseController.responseError(res, 'ファイルの削除中にエラーが発生しました。', 500);
                            }
                        });
                    }
                });
            });
        } else {
            baseController.responseError(res, 'データがありません。');
        }
    }

    /**
     * Export data by time
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    async exportData(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // If there are errors, you can access them as an array of objects
            const errorArray = errors.array();

            // Create an array to store error messages
            const errorMessages = errorArray.map((error) => error.msg);
            return res.status(400).json({ errors: errorMessages });
        }

        const startDate = req.body.start_date;
        const endDate = req.body.end_date;
        let dataExport = await sensorRecordService.prepareParameters(startDate, endDate);
        const filePath = dataExport.path;
        const data = dataExport.data;

        if (data.length > 0) {
            // Create a writable stream to the CSV file
            const stream = fs.createWriteStream(filePath);

            // Iterate through the data and write it to the file
            data.forEach((item) => {
                const csvLine = item.time + ',' + item.gw + ',' + item.ph + ',' + item.temperature + ',' + item.humidity
                    + ',' + item.pressure + ',' + item.sendCount + ',' + item.voltageDifference + ',' + item.longevity + '\n';
                stream.write(csvLine);
            });

            // Close the stream to finish writing
            stream.end(() => {
                res.download(filePath, path.basename(filePath), (err) => {
                    if (err) {
                        baseController.responseError(res, 'ダウンロードに失敗しました。', 500);
                    } else {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                baseController.responseError(res, 'ファイルの削除中にエラーが発生しました。', 500);
                            }
                        });
                    }
                });
            });
        } else {
            baseController.responseError(res, 'データがありません。');
        }
    }

    /**
     * Get data dashboard by name chart
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async getDataDashboardByNameChart(req, res) {
        const nameChart = req.params.name;
        const data = await sensorRecordService.getDataDashboardByNameChart(req, nameChart);
        return baseController.responseSuccess(res, data);
    }

    /**
     * Get data chart show sensor
     * @param {*} req 
     * @param {*} res 
     * @return mixed 
     */
    async getDataChartShowSensor(req, res) {
        const nameChart = req.params.name;
        const data = await sensorRecordService.getDataChartShowSensor(nameChart, req);
        return baseController.responseSuccess(res, data);
    }

    /**
     * Get data dashboard call api
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    async clickGetDataDashboard(req, res) {
        const gws = await gwService.getListGw();
        if (gws.length > 0) {
            for (const gw of gws) {
                const deployment = gw.gw;
                await sensorRecordService.getData(deployment);
            }
        }
        return baseController.responseSuccess(res, 'データは正常に更新されました。');
    }

    /**
     * Get data by deployment
     * @param {*} req 
     * @param {*} res 
     * @return mixed
     */
    async clickGetDataByDeployment(req, res) {
        const deployment = req.body.deployment;
        await sensorRecordService.getData(deployment);
        return baseController.responseSuccess(res, 'データは正常に更新されました。');
    }
}

module.exports = new SensorRecordController();