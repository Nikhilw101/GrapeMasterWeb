import Settings from './settings.model.js';
import logger from '../../../utils/logger.js';

// Get all settings
const getAllSettings = async () => {
    try {
        const settings = await Settings.find();

        // Convert to key-value object for easier consumption
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.key] = {
                value: setting.value,
                description: setting.description,
                type: setting.type
            };
        });

        return {
            success: true,
            data: settingsObj
        };
    } catch (error) {
        logger.error(`Get all settings error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Get setting by key
const getSettingByKey = async (key) => {
    try {
        const setting = await Settings.findOne({ key });

        if (!setting) {
            return { success: false, message: 'Setting not found' };
        }

        return {
            success: true,
            data: {
                key: setting.key,
                value: setting.value,
                description: setting.description,
                type: setting.type
            }
        };
    } catch (error) {
        logger.error(`Get setting by key error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Update setting
const updateSetting = async (key, value) => {
    try {
        const setting = await Settings.findOneAndUpdate(
            { key },
            { value },
            { new: true, upsert: true }
        );

        return {
            success: true,
            data: setting
        };
    } catch (error) {
        logger.error(`Update setting error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Create setting
const createSetting = async (settingData) => {
    try {
        const { key, value, description, type } = settingData;

        const existingSetting = await Settings.findOne({ key });
        if (existingSetting) {
            return { success: false, message: 'Setting with this key already exists' };
        }

        const setting = await Settings.create({
            key,
            value,
            description,
            type
        });

        return {
            success: true,
            data: setting
        };
    } catch (error) {
        logger.error(`Create setting error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

export default {
    getAllSettings,
    getSettingByKey,
    updateSetting,
    createSetting
};
