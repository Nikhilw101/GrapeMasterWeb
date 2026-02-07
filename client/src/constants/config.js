import { API_BASE_URL } from '@/config/env';

/**
 * Application Configuration
 * Contains all app-wide settings and constants
 */
export const APP_CONFIG = {
    name: 'GrapeMaster',
    version: '1.0.0',
    description: 'Premium fresh grapes delivered daily',
    apiBaseUrl: API_BASE_URL,

    // Feature flags
    features: {
        cart: true,
        wishlist: true,
        search: true,
        newsletter: true,
    },

    // Social media links
    social: {
        twitter: '#',
        instagram: '#',
        facebook: '#',
    },

    // Business info
    business: {
        email: 'hello@grapemaster.com',
        phone: '+1 (555) 123-4567',
        address: '123 Grape Street, Vineyard City, CA 94000',
    },

    // Delivery settings
    delivery: {
        freeShippingThreshold: 30,
        estimatedDays: '2-3',
    },
};

export default APP_CONFIG;
