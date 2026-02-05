import api from './api';

export const placeOrder = async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

export const getUserOrders = async (params) => {
    const response = await api.get('/orders', { params });
    return response.data;
};

export const getOrderById = async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
};

export const cancelOrder = async (orderId, reason) => {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
};
