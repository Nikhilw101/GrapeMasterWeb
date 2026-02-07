import Settings from './settings.model.js';
import { COMPANY_NAME, COMPANY_ADDRESS, COMPANY_PHONE, COMPANY_EMAIL } from '../../../config/env.js';
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

// Optional display-only keys with defaults when not in DB (avoids 404 for hero/footer copy)
const OPTIONAL_SETTING_DEFAULTS = {
    freeDeliveryThreshold: 500,
    orderCancellationEnabled: true,
    orderCancellationDays: 5,
    adminEmail: null, // notification recipient; null = use env fallback when not in DB
    // Company (emails & templates) – editable in Admin Settings; env used only as fallback
    companyName: COMPANY_NAME || 'Grape Master',
    companyAddress: COMPANY_ADDRESS || '123 Grape Street, Vineyard City, CA 94000',
    companyPhone: COMPANY_PHONE || '',
    companyEmail: COMPANY_EMAIL || 'hello@grapemaster.com'
};

// Get setting by key
const getSettingByKey = async (key) => {
    try {
        const setting = await Settings.findOne({ key });

        if (setting) {
            return {
                success: true,
                data: {
                    key: setting.key,
                    value: setting.value,
                    description: setting.description,
                    type: setting.type
                }
            };
        }

        if (Object.prototype.hasOwnProperty.call(OPTIONAL_SETTING_DEFAULTS, key)) {
            const val = OPTIONAL_SETTING_DEFAULTS[key];
            const type = val === null ? 'string' : typeof val === 'boolean' ? 'boolean' : typeof val;
            return {
                success: true,
                data: {
                    key,
                    value: val,
                    description: 'Default (not stored in database)',
                    type
                }
            };
        }

        return { success: false, message: 'Setting not found' };
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

// Get company settings for emails/templates (DB overrides env; used by email.util and orderEmail.util)
const getCompanySettings = async () => {
    try {
        const keys = ['companyName', 'companyAddress', 'companyPhone', 'companyEmail'];
        const out = {
            companyName: COMPANY_NAME || 'Grape Master',
            companyAddress: COMPANY_ADDRESS || '123 Grape Street, Vineyard City, CA 94000',
            companyPhone: COMPANY_PHONE || '',
            companyEmail: COMPANY_EMAIL || 'hello@grapemaster.com'
        };
        const settings = await Settings.find({ key: { $in: keys } });
        settings.forEach((s) => {
            if (s.key === 'companyName') out.companyName = s.value ?? out.companyName;
            if (s.key === 'companyAddress') out.companyAddress = s.value ?? out.companyAddress;
            if (s.key === 'companyPhone') out.companyPhone = s.value ?? out.companyPhone;
            if (s.key === 'companyEmail') out.companyEmail = s.value ?? out.companyEmail;
        });
        return { success: true, data: out };
    } catch (error) {
        logger.error(`Get company settings error: ${error.message}`);
        return {
            success: true,
            data: {
                companyName: COMPANY_NAME || 'Grape Master',
                companyAddress: COMPANY_ADDRESS || '123 Grape Street, Vineyard City, CA 94000',
                companyPhone: COMPANY_PHONE || '',
                companyEmail: COMPANY_EMAIL || 'hello@grapemaster.com'
            }
        };
    }
};

export default {
    getAllSettings,
    getSettingByKey,
    getCompanySettings,
    updateSetting,
    createSetting
};
