const sensorRecordService = require('../services/SensorRecordService');
const gwService = require('../services/GwService');
const db = require('../../config/db');
const truncateCollection = require('../helper/TruncateCollection');

//connect db
db.connect();

async function cronjobGetCollectX() {
    // await truncateCollection('logs');
    const gws = await gwService.getListGw();
    for (const gw of gws) {
        const deployment = await gw.gw;
        await sensorRecordService.getCollectX(deployment);
    }
    await process.exit(0);
}

cronjobGetCollectX();