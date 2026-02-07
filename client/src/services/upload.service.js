import api from './api';

export const uploadImage = async (formData) => {
    const response = await api.post('/admin/upload', formData, {
        headers: {
            // Let axios set Content-Type with boundary for multipart/form-data
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
