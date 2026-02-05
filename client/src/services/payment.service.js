import api from './api';

export const initiatePayment = async (orderId) => {
    const response = await api.post(`/payments/initiate/${orderId}`);
    return response.data;
};

export const getPaymentStatus = async (orderId) => {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data;
};

export const retryPayment = async (orderId) => {
    const response = await api.post(`/payments/retry/${orderId}`);
    return response.data;
};
