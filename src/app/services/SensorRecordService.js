require('dotenv').config();
const SensorRecord = require('../models/SensorRecord');
const tokenService = require('../services/TokenService');
const whssHelper = require('../../helper/WhssHelper');
const axios = require('axios');
const logService = require('../services/LogService');
const Log = require('../models/Log');
const moment = require('moment');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const Sensor = require('../models/Sensor');

class SensorRecordService {
    /**
     * Cronjob get data by start time in .env
     * @param {String} deployment 
     * @return void
     */
    async getCollectX(deployment) {
        const token = await tokenService.getToken();
        const count = 0;
        const startTimestamp = moment(process.env.WHSS_START_TIME, 'YYYY-MM-DD HH:mm:ss').unix();
        const now = moment().unix();
        for (let start = startTimestamp; start <= now - 3600; start += 3600) {
            await this.handlerApiCollectX(token, count, start, deployment);
        }
    }

    /**
     * Handler api collect X
     * @param {String} token 
     * @param {Number} count 
     * @param {Number} startTimestamp 
     * @param {String} deployment 
     * @return mixed 
     */
    async handlerApiCollectX(token, count, startTimestamp, deployment) {
        const endTimestamp = startTimestamp + 3600;
        const res = await this.callApiCollectX(token, count, startTimestamp, deployment);
        const httpCode = res.response ? res.response.status : res.status;
        let content = 'Error';
        let lastTime = startTimestamp;
        if (httpCode === 200) {
            const data = res.data.data;
            lastTime = endTimestamp;
            content = 'No data';
            if (data.length > 0) {
                let maxTimestamp = startTimestamp;
                for (const value of data) {
                    const unit = value.unitId;
                    const records = value.records;
                    for (const record of records) {
                        if (maxTimestamp < record.timestamp) {
                            maxTimestamp = record.timestamp;
                        }
                        await this.saveData(deployment, unit, record);
                    }
                }
                if (maxTimestamp < endTimestamp) {
                    lastTime = Math.ceil(maxTimestamp);
                }
                content = 'Have data';
            }
        }
        await logService.createLog(deployment, httpCode, startTimestamp, endTimestamp, lastTime, content, false);
    }

    /**
     * Call api collect X
     * @param {String} token 
     * @param {Number} count 
     * @param {Number} startTimestamp 
     * @param {String} deployment 
     * @return mixed
     */
    async callApiCollectX(token, count, startTimestamp, deployment) {
        if (count >= 3) {
            return { status: 500 };
        }

        try {
            const apiUrl = process.env.WHSS_SONAS_HOST + '/un/v1/' + deployment + '/collect-x/raw';
            const requestData = {
                params: {
                    project_id: process.env.WHSS_SONAS_PROJECT_ID,
                    start: startTimestamp,
                    end: startTimestamp + 3600,
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            const res = await axios.get(apiUrl, requestData);
            return res;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                token = await whssHelper.getNewToken();
                return await this.callApiCollectX(token, ++count, startTimestamp, deployment)
            }
            return error;
        }
    }

    /**
     * Save data
     * @param {String} deployment 
     * @param {Number} unit 
     * @param {*} record 
     */
    async saveData(deployment, unit, record) {
        const data = this.convertData(record, deployment, unit);
        const query = { gwId: deployment, sensorId: unit, timestamp: data.timestamp };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        await SensorRecord.findOneAndUpdate(query, data, options);
    }

    /**
     * Convert data
     * @param {*} data 
     * @param {String} deployment 
     * @param {Number} unit 
     * @return mixed 
     */
    convertData(data, deployment, unit) {
        let step = 0;
        const body = data.body;
        const dataType1 = body.substr(step, 2);
        //voltage difference
        const rawVoltageDifference = body.substr(step += 2, 6);
        const num = parseInt(this.reverseEndian(rawVoltageDifference), 16);
        const voltageDifference = (num / Math.pow(2, 24) * (1.65 * 2) - 1.65) * 1000;

        //data type 2
        const dataType2 = body.substr(step += 6, 2);

        //temperature
        const rawTemperature = body.substr(step += 2, 8);
        const dec = parseInt(this.reverseEndian(rawTemperature), 16);
        let temperature = dec / 100;
        if (dec & Math.pow(16, this.reverseEndian(rawTemperature).length) / 2) {
            temperature = (dec - Math.pow(16, this.reverseEndian(rawTemperature).length)) / 100;
        }

        //humidity
        const rawHumidity = body.substr(step += 8, 8);
        const humidity = parseInt(this.reverseEndian(rawHumidity), 16) / 1024;

        //pressure
        const rawPressure = body.substr(step += 8, 8);
        const pressure = parseInt(this.reverseEndian(rawPressure), 16) / 100;

        //ph
        const rawPh = body.substr(step += 8, 4);
        const ph = parseInt(this.reverseEndian(rawPh), 16) / 1000;

        //longevity
        const rawLongevity = body.substr(step += 4, 4);
        const longevity = parseInt(this.reverseEndian(rawLongevity), 16);

        //send count
        const rawSendCount = body.substr(step += 4, 4);
        const sendCount = parseInt(this.reverseEndian(rawSendCount), 16);

        //timestamp and id
        const timestamp = data.timestamp;

        return {
            body: body,
            timestamp: timestamp,
            ph: ph,
            humidity: humidity,
            pressure: pressure,
            longevity: longevity,
            sendCount: sendCount,
            temperature: temperature,
            voltageDifference: voltageDifference,
            dataType1: dataType1,
            dataType2: dataType2,
            gwId: deployment,
            sensorId: unit
        }
    }

    /**
     * Reverse endian
     * @param {String} string 
     * @return mixed 
     */
    reverseEndian(string) {
        let arr = [];
        for (let i = 0; i < string.length; i++) {
            if (i % 2 == 0) {
                arr.push(string[i] + string[i + 1]);
            }
        }
        const arrReverse = arr.reverse();
        return arrReverse.join('');
    }

    /**
     * Click get data
     * @param {String} deployment 
     * @return void
     */
    async getData(deployment) {
        const token = await tokenService.getToken();
        const count = 0;
        const now = moment().unix();
        await this.handlerApiGetData(token, count, now, deployment);
    }

    /**
     * Handler api get data
     * @param {String} token 
     * @param {Number} count 
     * @param {Number} endTimestamp  
     * @param {String} deployment 
     * @return mixed 
     */
    async handlerApiGetData(token, count, endTimestamp, deployment) {
        const startTimestamp = endTimestamp - 3600;
        const res = await this.callApiGetData(token, count, endTimestamp, deployment);
        const httpCode = res.response ? res.response.status : res.status;
        let content = 'Error';
        let lastTime = startTimestamp;
        if (httpCode === 200) {
            const data = res.data.data;
            lastTime = endTimestamp;
            content = 'No data';
            if (data.length > 0) {
                for (const value of data) {
                    const unit = value.unitId;
                    const records = value.records;
                    for (const record of records) {
                        await this.saveData(deployment, unit, record);
                    }
                }
                content = 'Have data';
            }
        }
        await logService.createLog(deployment, httpCode, startTimestamp, endTimestamp, lastTime, content, true);
    }

    /**
     * Call api get data
     * @param {String} token 
     * @param {Number} count 
     * @param {Number} endTimestamp 
     * @param {String} deployment 
     * @return mixed
     */
    async callApiGetData(token, count, endTimestamp, deployment) {
        if (count >= 3) {
            return { status: 500 };
        }

        try {
            const apiUrl = process.env.WHSS_SONAS_HOST + '/un/v1/' + deployment + '/collect-x/raw';
            const requestData = {
                params: {
                    project_id: process.env.WHSS_SONAS_PROJECT_ID,
                    start: endTimestamp - 3600,
                    end: endTimestamp,
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            const res = await axios.get(apiUrl, requestData);
            return res;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                token = await whssHelper.getNewToken();
                return await this.callApiGetData(token, ++count, endTimestamp, deployment)
            }
            return error;
        }
    }

    /**
     * Get last time log
     * @param {String} deployment 
     * @return mixed
     */
    async getStartTime(deployment) {
        const log = await Log.aggregate([
            {
                $match: {
                    gwId: deployment,
                    isManual: false,
                }
            },
            {
                $sort: {
                    lastTimestamp: -1
                }
            },
            {
                $limit: 1
            }
        ]);
        let startTimestamp = moment().unix();
        if (log) {
            startTimestamp = log[0].lastTimestamp;
        }
        return startTimestamp;
    }

    /**
     * Get data api by second
     * @param {String} deployment 
     * @return void
     */
    async getCollectXByInterval(deployment) {
        const token = await tokenService.getToken();
        const count = 0;
        const startTimestamp = await getStartTime(deployment);
        await this.handlerApiCollectXByInterval(token, count, startTimestamp, deployment);
    }

    /**
     * Insert data api by second
     * @param {String} token 
     * @param {Number} count 
     * @param {String} startTimestamp 
     * @param {String} deployment 
     * @return void
     */
    async handlerApiCollectXByInterval(token, count, startTimestamp, deployment) {
        const endTimestamp = startTimestamp + 3600;
        const res = await this.callApiCollectX(token, count, startTimestamp, deployment);
        const httpCode = res.response ? res.response.status : res.status;
        let content = 'Error';
        let lastTime = startTimestamp;
        if (httpCode === 200) {
            const data = res.data.data;
            if (data.length > 0) {
                let maxTimestamp = startTimestamp;
                for (const value of data) {
                    const unit = value.unitId;
                    const records = value.records;
                    for (const record of records) {
                        if (maxTimestamp < record.timestamp) {
                            maxTimestamp = record.timestamp;
                        }
                        await this.saveData(deployment, unit, record);
                    }
                }
                if (maxTimestamp < endTimestamp) {
                    lastTime = Math.ceil(maxTimestamp);
                }
                content = 'Have data';
            } else {
                lastTime = startTimestamp + parseInt(process.env.WHSS_SONAS_PULL_INTERVAL);
                content = 'No data';
            }
        }
        await logService.createLog(deployment, httpCode, startTimestamp, endTimestamp, lastTime, content, false);
    }

    /**
     * 
     * @param {*} startDate 
     * @param {*} endDate 
     * @returns 
     */
    deleteSensorRecord(startDate, endDate) {
        const startTimestamp = startDate != '' ? moment(startDate + ' 00:00:00', 'YYYY/MM/DD HH:mm:ss').unix() : null;
        const endTimestamp = endDate != '' ? moment(endDate + ' 23:59:59', 'YYYY/MM/DD HH:mm:ss').unix() : null;
        let conditionDelete = {};
        if (startTimestamp != null && endTimestamp != null) {
            conditionDelete = { $gte: startTimestamp, $lt: endTimestamp };
        } else if (startTimestamp != null && endTimestamp == null) {
            conditionDelete = { $gte: startTimestamp };
        } else {
            conditionDelete = { $lte: startTimestamp };
        }
        return SensorRecord.deleteMany({ timestamp: { $gte: startTimestamp, $lte: endTimestamp } });
    }

    /**
     * Export data api
     * @param {String} deployment 
     * @return mixed
     */
    async exportRadio(deployment) {
        let token = await tokenService.getToken();
        let count = 0;
        await whssHelper.sendUnitToGw(token, count, deployment, 'nwstat');
        const dataApi = await this.callGetUnApi(token, count, deployment);
        let path = process.cwd() + '/src/storage/public/' + '電波強度データログ_' + moment().format('YYYYMMDD_HHmmss') + '.csv';
        let data = [];
        let time = '';
        if (dataApi != null) {
            // const csvWriter = createCsvWriter({
            //     path: path,
            //     header: [
            //         { id: 'time' },
            //         { id: 'recvUnitId' },
            //         { id: 'sendUnitId' },
            //         { id: 'rssiMax' },
            //         { id: 'rssiMin' },
            //         { id: 'rssiAvg' },
            //         { id: 'rssiVar' },
            //         { id: 'sendCnt' },
            //         { id: 'recvCnt' },
            //     ]
            // });
            time = moment(dataApi.measurementTs * 1000).format('YYYY-MM-DD HH:mm:ss');
            data = dataApi.stats;
            // .map(value => {
            //     return {
            //         time: time,
            //         recvUnitId: value.recvUnitId,
            //         sendUnitId: value.sendUnitId,
            //         rssiMax: value.rssiMax,
            //         rssiMin: value.rssiMin,
            //         rssiAvg: value.rssiAvg,
            //         rssiVar: value.rssiVar,
            //         sendCnt: value.sendCnt,
            //         recvCnt: value.recvCnt
            //     }
            // });
            // await csvWriter.writeRecords(data);
        }
        return { path: path, time: time, data: data };
    }

    /**
     * Get data export api
     * @param {String} token 
     * @param {Number} count 
     * @param {String} deployment 
     * @return mixed
     */
    async callGetUnApi(token, count, deployment) {
        if (count >= 3) {
            return null;
        }
        try {
            const apiUrl = process.env.WHSS_SONAS_HOST + '/un/v1/' + deployment + '/nwlink';
            const requestData = {
                params: {
                    project_id: process.env.WHSS_SONAS_PROJECT_ID,
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const response = await axios.get(apiUrl, requestData);
            if (response.status === 200) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                token = await whssHelper.getNewToken();
                return await this.callGetUnApi(token, ++count, deployment);
            }
            return null;
        }
    }

    /**
     * Export data by time
     * @param {String} startDate 
     * @param {String} endDate 
     * @return mixed
     */
    async prepareParameters(startDate, endDate) {
        let unixStartDate = null;
        let unixEndDate = null;
        if ((startDate == null || startDate == '') && (endDate == null || endDate == '')) {
            const formatEndDate = moment().format('YYYY-MM-DD');
            unixEndDate = moment(formatEndDate + ' 23:59:59').unix();
            unixStartDate = moment(formatEndDate + ' 00:00:00').subtract(1, 'year').unix();
        } else if ((startDate == null || startDate == '') && (endDate != null || endDate != '')) {
            unixEndDate = moment(endDate + ' 23:59:59', 'YYYY/MM/DD HH:mm:ss').unix();
            unixStartDate = moment(endDate + ' 00:00:00', 'YYYY/MM/DD HH:mm:ss').subtract(1, 'year').unix();
        } else if ((startDate != null || startDate != '') && (endDate == null || endDate == '')) {
            unixStartDate = moment(startDate + ' 00:00:00', 'YYYY/MM/DD HH:mm:ss').unix();
            unixEndDate = moment(startDate + ' 23:59:59', 'YYYY/MM/DD HH:mm:ss').add(1, 'year').unix();
        } else {
            const timestampYear = 31536000;
            unixStartDate = moment(startDate + ' 00:00:00', 'YYYY/MM/DD HH:mm:ss').unix();
            unixEndDate = moment(endDate + ' 23:59:59', 'YYYY/MM/DD HH:mm:ss').unix();
            const periodTime = unixEndDate - unixStartDate;
            if (periodTime > timestampYear) {
                unixStartDate = moment(endDate + ' 00:00:00', 'YYYY/MM/DD HH:mm:ss').subtract(1, 'year').unix();
            }
        }

        const data = await this.getDataExportByTime(unixStartDate, unixEndDate);
        let path = process.cwd() + '/src/storage/public/' + 'センサデータログ_' + moment().format('YYYYMMDD_HHmmss') + '.csv';
        return { path: path, data: data };
    }

    /**
     * Get data by time
     * @param {String} startDate 
     * @param {String} endDate 
     * @return mixed
     */
    async getDataExportByTime(startDate, endDate) {
        const data = await SensorRecord.aggregate([
            {
                $match: {
                    timestamp: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $addFields: {
                    time: {
                        $dateToString: {
                            date: { $toDate: { $multiply: ["$timestamp", 1000] } },
                            format: '%Y/%m/%d %H:%M:%S',
                        },
                    },
                    gw: {
                        $concat: [{ $toString: "$gwId" }, ':', { $toString: "$sensorId" }]
                    }
                },
            },
            {
                $sort: {
                    time: 1
                }
            },
            {
                $project: {
                    _id: 0,
                    time: 1,
                    gw: 1,
                    ph: 1,
                    temperature: 1,
                    humidity: 1,
                    pressure: 1,
                    sendCount: 1,
                    voltageDifference: 1,
                    longevity: 1
                },
            }
        ]);
        return data;
    }

    /**
     * Get data dashboard by field
     * @param {*} req 
     * @param {String} nameChart 
     * @return mixed
     */
    async getDataDashboardByNameChart(req, nameChart) {
        let userId = req.user.userId;
        let labels = [null];
        let newTimestamp = [];
        let data = [];
        const sensors = await Sensor.aggregate([
            {
                $lookup: {
                    from: 'usersensors',
                    localField: '_id',
                    foreignField: 'sensorId',
                    as: 'user_sensor'
                }
            },
            {
                $match: {
                    'user_sensor.userId': userId,
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    place: 1,
                    gwId: 1,
                    sensorMacId: 1
                }
            }
        ]);
        if (sensors.length > 0) {
            for (const sensor of sensors) {
                const sensorRecord = await SensorRecord.aggregate([
                    {
                        $match: {
                            'gwId': sensor.gwId,
                            'sensorId': sensor.sensorMacId
                        }
                    },
                    {
                        $sort: {
                            timestamp: -1
                        }
                    },
                    {
                        $limit: 1
                    },
                    {
                        $project: {
                            _id: 0,
                            timestamp: 1,
                            [nameChart]: 1
                        }
                    }
                ]);
                if (sensorRecord.length > 0) {
                    labels.push('[' + sensor.name + ']_[' + sensor.place + ']');
                    const convetData = Object.values(sensorRecord[0]);
                    newTimestamp.push(convetData[0]);
                    data.push(convetData[1])
                }
            }
        }
        return {
            labels: labels,
            data: data,
            timestamps: newTimestamp
        };
    }

    /**
     * Get data chart show sensor
     * @param {String} nameChart 
     * @param {*} req 
     * @return mixed
     */
    async getDataChartShowSensor(nameChart, req) {
        const endDate = moment().unix();
        const time = req.query.time;
        const convertTime = this.convertTime(time);
        const startDate = convertTime.start_date;
        const formatDate = convertTime.format_date;
        const gwId = req.query.gw_id;
        const sensorId = +req.query.sensor_id;
        let data = [];
        if (time == '1 year') {
            data = await SensorRecord.aggregate([
                {
                    $match: {
                        timestamp: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                        gwId: gwId,
                        sensorId: sensorId
                    },
                },
                {
                    $addFields: {
                        time: {
                            $dateToString: {
                                date: { $toDate: { $multiply: ["$timestamp", 1000] } },
                                format: formatDate,
                            },
                        }
                    },
                },
                {
                    $project: {
                        _id: 0,
                        time: {
                            $dateToString: {
                                date: { $toDate: { $multiply: ["$timestamp", 1000] } },
                                format: formatDate,
                            },
                        },
                        week: { $week: { $toDate: '$time' } },
                        [nameChart]: 1
                    }
                },
                {
                    $group: {
                        _id: '$week',
                        time: { $first: '$time' },
                        averageValue: { $avg: '$' + nameChart }
                    }
                },
                {
                    $sort: {
                        time: 1
                    }
                },
            ]);
        } else {
            data = await SensorRecord.aggregate([
                {
                    $match: {
                        timestamp: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                        gwId: gwId,
                        sensorId: sensorId
                    },
                },
                {
                    $addFields: {
                        time: {
                            $dateToString: {
                                date: { $toDate: { $multiply: ["$timestamp", 1000] } },
                                format: formatDate,
                            },
                        }
                    },
                },
                {
                    $group: {
                        _id: '$time',
                        averageValue: { $avg: '$' + nameChart }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        time: '$_id',
                        averageValue: 1
                    }
                },
                {
                    $sort: {
                        time: 1
                    }
                },
            ]);
        }
        return data;
    }

    /**
     * Get start date and format date
     * @param {String} time 
     * @returns 
     */
    convertTime(time) {
        const arrayTime = time.split(' ');
        const startDate = moment().subtract(parseInt(arrayTime[0]), arrayTime[1]).unix();
        let formatDate = '%Y/%m/%d %H:%M:%S';
        if (time.includes("month") || time.includes("year")) {
        // if (time == '1 month' || time == '1 year') {
            formatDate = '%Y/%m/%d';
        // } else if (time == '1 week') {
        } else if (time.includes("week")) {
            formatDate = '%Y/%m/%d %H';
        }
        return {
            start_date: startDate,
            format_date: formatDate
        }
    }
}

module.exports = new SensorRecordService();