import { uploadToCloudinary } from './cloudinary';

export interface ImageUploadResult {
  url: string;
  error?: string;
}

export const handleImageUpload = async (file: File): Promise<ImageUploadResult> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        url: '',
        error: 'Please upload an image file',
      };
    }

    // Validate file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return {
        url: '',
        error: 'Image size should be less than 5MB',
      };
    }

    // Upload to Cloudinary
    const url = await uploadToCloudinary(file);
    return { url };
  } catch (error) {
    console.error('Error handling image upload:', error);
    return {
      url: '',
      error: 'Failed to upload image. Please try again.',
    };
  }
}; 