import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { handleImageUpload, ImageUploadResult } from '@/lib/imageUtils';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  currentImageUrl?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  onUploadError,
  currentImageUrl,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    try {
      const result = await handleImageUpload(file);
      if (result.error) {
        onUploadError(result.error);
        setPreviewUrl(null);
      } else {
        onUploadComplete(result.url);
      }
    } catch (error) {
      onUploadError('Failed to upload image. Please try again.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Clean up the preview URL
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`
          relative w-full h-52 rounded-lg border-2
          ${isUploading ? 'border-blue-400' : previewUrl ? 'border-blue-300' : 'border-gray-300 border-dashed'}
          flex items-center justify-center cursor-pointer
          overflow-hidden bg-gray-50 hover:bg-gray-100
          transition-all duration-200 shadow-sm
        `}
      >
        {previewUrl ? (
          <div className="relative w-full h-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
              <span className="text-white bg-gray-900 bg-opacity-70 px-3 py-1 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100">
                Click to change
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <svg
              className="mx-auto h-14 w-14 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-600">
              Click to upload an image
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              <p className="mt-2 text-white text-sm">Uploading...</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}; 