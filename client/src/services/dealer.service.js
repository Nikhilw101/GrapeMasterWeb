import api from './api';

export const submitDealerRequest = async (data) => {
    const response = await api.post('/dealer-requests', data);
    return response.data;
};

export const getDealerRequests = async (params = {}) => {
    const response = await api.get('/admin/dealer-requests', { params });
    return response.data;
};

export const getDealerRequestById = async (id) => {
    const response = await api.get(`/admin/dealer-requests/${id}`);
    return response.data;
};

export const updateDealerRequestStatus = async (id, status, statusNote) => {
    const response = await api.put(`/admin/dealer-requests/${id}/status`, { status, statusNote });
    return response.data;
};
