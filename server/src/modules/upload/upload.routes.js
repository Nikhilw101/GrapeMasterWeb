
import express from 'express';
import upload from '../../middlewares/upload.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/admin.middleware.js';

const router = express.Router();

// @desc    Upload single image
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, isAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Return path relative to server root, clients should prepend base URL
        // Window paths might have backslashes, normalize to forward slashes for URLs
        const relativePath = req.file.path.replace(/\\/g, '/');
        const imageUrl = `/${relativePath}`;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageUrl: imageUrl, // e.g., "/uploads/filename.jpg"
                filename: req.file.filename
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
