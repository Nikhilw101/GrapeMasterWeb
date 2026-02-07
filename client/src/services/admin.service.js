import api from './api';

// Admin Login
export const adminLogin = async (credentials) => {
    const response = await api.post('/admin/login', credentials);
    if (response.data.success) {
        localStorage.setItem('adminToken', response.data.data.accessToken);
        localStorage.setItem('adminUser', JSON.stringify(response.data.data.admin));
    }
    return response.data;
};

// Admin Logout
export const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
};

// Admin forgot password (mail-based: sends reset link to admin email)
export const adminForgotPassword = async (email) => {
    const response = await api.post('/admin/forgot-password', { email });
    return response.data;
};

// Admin reset password (token from email link + new password)
export const adminResetPassword = async (token, password) => {
    const response = await api.post('/admin/reset-password', { token, password });
    return response.data;
};

export const changePassword = async (passwords) => {
    const response = await api.put('/admin/change-password', passwords);
    return response.data;
};

// Dashboard Stats
export const getDashboardStats = async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
};

export const getOrderStats = async () => {
    const response = await api.get('/admin/orders/stats');
    return response.data;
};

// Product Management
export const getProducts = async (includeInactive = true) => {
    const response = await api.get(`/admin/products?includeInactive=${includeInactive}`);
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await api.post('/admin/products', productData);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
};

export const toggleProductStatus = async (id) => {
    const response = await api.patch(`/admin/products/${id}/toggle`);
    return response.data;
};

export const bulkDeleteProducts = async (productIds) => {
    const response = await api.post('/admin/products/bulk-delete', { productIds });
    return response.data;
};

export const bulkUpdateProducts = async (productIds, action) => {
    const response = await api.post('/admin/products/bulk-update', { productIds, action });
    return response.data;
};

// User Management
export const getUsers = async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
};

export const updateUserStatus = async (id, status) => {
    const response = await api.put(`/admin/users/${id}/status`, { status });
    return response.data;
};

export const getUserDetails = async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
};


// Order Management
export const getOrders = async (params) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
};

export const updateOrderStatus = async (id, status, note) => {
    const response = await api.put(`/admin/orders/${id}/status`, { status, note });
    return response.data;
};

export const approveOrder = async (id, note) => {
    const response = await api.put(`/admin/orders/${id}/approve`, { note });
    return response.data;
};

export const rejectOrder = async (id, reason) => {
    const response = await api.put(`/admin/orders/${id}/reject`, { reason });
    return response.data;
};

export const deleteOrder = async (id) => {
    const response = await api.delete(`/admin/orders/${id}`);
    return response.data;
};
