import jwt from 'jsonwebtoken';
import {
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRE,
    JWT_REFRESH_EXPIRE
} from '../config/env.js';
import logger from './logger.js';

// Token Types
export const TOKEN_TYPES = {
    ACCESS: 'access',
    REFRESH: 'refresh'
};

/**
 * Generate Access Token
 * @param {Object} payload - User data to encode in token
 * @returns {String} JWT access token
 */
export const generateAccessToken = (payload) => {
    try {
        return jwt.sign(
            { ...payload, type: TOKEN_TYPES.ACCESS },
            JWT_ACCESS_SECRET,
            { expiresIn: JWT_ACCESS_EXPIRE }
        );
    } catch (error) {
        logger.error(`Error generating access token: ${error.message}`);
        throw new Error('Failed to generate access token');
    }
};

/**
 * Generate Refresh Token
 * @param {Object} payload - User data to encode in token
 * @returns {String} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
    try {
        return jwt.sign(
            { ...payload, type: TOKEN_TYPES.REFRESH },
            JWT_REFRESH_SECRET,
            { expiresIn: JWT_REFRESH_EXPIRE }
        );
    } catch (error) {
        logger.error(`Error generating refresh token: ${error.message}`);
        throw new Error('Failed to generate refresh token');
    }
};

/**
 * Verify Access Token
 * @param {String} token - JWT access token
 * @returns {Object} Decoded token payload
 */
export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

        if (decoded.type !== TOKEN_TYPES.ACCESS) {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Access token expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid access token');
        }
        throw error;
    }
};

/**
 * Verify Refresh Token
 * @param {String} token - JWT refresh token
 * @returns {Object} Decoded token payload
 */
export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

        if (decoded.type !== TOKEN_TYPES.REFRESH) {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Refresh token expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid refresh token');
        }
        throw error;
    }
};

/**
 * Decode token without verification (for expired tokens)
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        logger.error(`Error decoding token: ${error.message}`);
        return null;
    }
};

/**
 * Generate both access and refresh tokens
 * @param {Object} payload - User data
 * @returns {Object} { accessToken, refreshToken }
 */
export const generateTokenPair = (payload) => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { accessToken, refreshToken };
};

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
    generateTokenPair,
    TOKEN_TYPES
};
