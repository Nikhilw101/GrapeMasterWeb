/**
 * Application Configuration
 * Contains all app-wide settings and constants
 */

export const APP_CONFIG = {
    name: 'GrapeMaster',
    version: '1.0.0',
    description: 'Premium fresh grapes delivered daily',

    // Base URL for future API integration
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',

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
