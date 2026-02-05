import api from './api';

// Profile Management
export const getProfile = async () => {
    const response = await api.get('/users/profile');
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
};

// Address Management
export const addAddress = async (addressData) => {
    const response = await api.post('/users/address', addressData);
    return response.data;
};

export const updateAddress = async (addressId, addressData) => {
    const response = await api.put(`/users/address/${addressId}`, addressData);
    return response.data;
};

export const deleteAddress = async (addressId) => {
    const response = await api.delete(`/users/address/${addressId}`);
    return response.data;
};
