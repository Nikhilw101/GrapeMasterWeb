import api from './api';

// Public Product Endpoints
export const getProducts = async (params = {}) => {
    // Public endpoint for listing products
    const response = await api.get('/admin/products', { params });
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
};

export const getCategories = async () => {
    const response = await api.get('/admin/products/categories');
    return response.data;
};
