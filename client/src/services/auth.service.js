import api from './api';

export const register = async (userData) => {
    const response = await api.post('/users/register', userData);
    if (response.data?.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken); // Store refresh token too
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
};

export const login = async (mobile, password) => {
    const response = await api.post('/users/login', { mobile, password });
    if (response.data?.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
};

export const logout = async () => {
    try {
        await api.post('/users/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};
