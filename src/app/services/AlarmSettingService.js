const AlarmSetting = require('../models/AlarmSetting');

class AlarmSettingService {
    /**
     * Get a alarm setting
     * @param {*} req 
     * @return mixed
     */
    getAlarmSetting(req) {
        let userId = req.user.userId;
        let alarmSetting = AlarmSetting.findOne({ userId: userId });
        return alarmSetting;
    }

    /**
     * Create or update a alarm setting
     * @param {*} req 
     * @return mixed
     */
    createOrUpdateAlarmSetting(req) {
        let userId = req.user.userId;
        const formData = {
            alarmHydrogenValueLevel1: req.body.alarm_hydrogen_value_level_1,
            alarmHydrogenValueLevel2: req.body.alarm_hydrogen_value_level_2,
            chartHydrogenStatusMarkerLevel1: req.body.chart_hydrogen_status_marker_level_1,
            chartHydrogenStatusMarkerLevel2: req.body.chart_hydrogen_status_marker_level_2,
            chartHydrogenStatusDashedLineLevel1: req.body.chart_hydrogen_status_dashed_line_level_1,
            chartHydrogenStatusDashedLineLevel2: req.body.chart_hydrogen_status_dashed_line_level_2,
            statusDashedLineLevel2: req.body.status_dashed_line_level_2,
            userId: req.user.userId,
        };
        if (!userId) {
            return AlarmSetting.create(formData);
        } else {
            return AlarmSetting.updateOne({ userId: userId }, formData);
        }
    }
}

module.exports = new AlarmSettingService();