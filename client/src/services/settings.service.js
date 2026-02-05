import api from './api';

export const getSettingByKey = async (key) => {
    const response = await api.get(`/admin/settings/${key}`);
    return response.data;
};

export const updateSetting = async (key, value) => {
    const response = await api.put(`/admin/settings/${key}`, { value });
    return response.data;
};
