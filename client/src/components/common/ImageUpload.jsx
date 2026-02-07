import React, { useState, useRef } from 'react';
import { Upload, X, Loader, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getAssetBaseUrl } from '@/config/env';
import * as uploadService from '@/services/upload.service';

const ImageUpload = ({ value, onChange, className }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadImage(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            await uploadImage(file);
        }
    };

    const uploadImage = async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('image', file);

            // Use the upload service
            const response = await uploadService.uploadImage(formData);

            if (response.success) {
                // The backend returns a relative URL like "/uploads/filename.jpg"
                // We pass this back to the parent component
                onChange(response.data.imageUrl);
                toast.success('Image uploaded successfully');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
            // Reset input so validation triggers again if same file selected
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div className={className}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative group cursor-pointer 
                    border-2 border-dashed rounded-xl p-4
                    transition-all duration-200
                    flex flex-col items-center justify-center
                    min-h-[200px] w-full bg-gray-50
                    ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400 hover:bg-gray-100'}
                    ${value ? 'p-0 border-solid border-gray-200 overflow-hidden' : ''}
                `}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Loader className="w-8 h-8 animate-spin text-green-600" />
                        <span className="text-sm font-medium">Uploading...</span>
                    </div>
                ) : value ? (
                    <div className="relative w-full h-full min-h-[200px]">
                        {/* Image Preview */}
                        <img
                            src={`${getAssetBaseUrl()}${value?.startsWith('/') ? value : `/${value || ''}`}`}
                            alt="Uploaded preview"
                            className="absolute inset-0 w-full h-full object-contain bg-white"
                        />

                        {/* Overlay with Remove Button */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-red-500 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <p className="absolute bottom-4 text-white text-xs font-medium">Click to change</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                        <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-200">
                            <Upload className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">Click to upload</p>
                            <p className="text-xs text-gray-500 mt-1">or drag and drop JPG, PNG</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
