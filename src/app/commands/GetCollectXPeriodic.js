const cron = require('node-cron');
const gwService = require('../services/GwService');
const db = require('../../config/db');
const sensorRecordService = require('../services/SensorRecordService');

//connect db
db.connect();

 // Define the schedule
cron.schedule('* * * * *', async () => {
    const gws = await gwService.getListGw();
    for (const gw of gws) {
        const deployment = await gw.gw;
        await sensorRecordService.getCollectXByInterval(deployment);
    }
});
