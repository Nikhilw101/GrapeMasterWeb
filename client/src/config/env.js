/**
 * Single source of truth for API configuration.
 * Set VITE_API_BASE_URL in .env (e.g. http://localhost:5001/api).
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

/** Base URL for assets (no /api suffix) - use for uploads/images */
export function getAssetBaseUrl() {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
    return base.replace(/\/api\/?$/, '') || 'http://localhost:5001';
}

/** Stripe publishable key for embedded payment UI */
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
