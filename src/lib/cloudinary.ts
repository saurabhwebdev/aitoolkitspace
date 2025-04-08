// Browser-compatible Cloudinary upload implementation
// No Node.js dependencies required

const CLOUDINARY_CLOUD_NAME = "dceq8oxm3";
// Cloudinary preset must be whitelisted for unsigned uploads
// Let's use a properly configured preset for unsigned uploads
const CLOUDINARY_UPLOAD_PRESET = "aitoolkit_upload"; 

export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    // Create a FormData instance
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'aitoolkit'); // Store uploads in a dedicated folder
    
    // Make direct upload request to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary response:', errorText);
      throw new Error('Failed to upload to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}; 