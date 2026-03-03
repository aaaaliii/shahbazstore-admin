import api from './api';

export interface UploadResponse {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export interface MultipleUploadResponse {
  images: UploadResponse[];
}

export const uploadApi = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/product-image', formData);

    // Backend now returns both path and full URL
    const imagePath = response.data.image || response.data.publicId || response.data.url;
    const fullUrl = response.data.url || imagePath;
    
    return {
      url: fullUrl, // Full URL for display/preview
      publicId: imagePath, // Path for storage (e.g., "/uploads/products/filename.jpg")
    };
  },

  uploadMultipleImages: async (files: File[]): Promise<MultipleUploadResponse> => {
    // Use the new multiple images endpoint
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await api.post('/upload/product-images', formData);
    
    // Backend returns array of images with both path and full URL
    const images = response.data.images.map((img: any) => ({
      url: img.url || img.image, // Full URL for display
      publicId: img.image || img.publicId || img.url, // Path for storage
    }));
    
    return {
      images: images,
    };
  },

  deleteImage: async (_publicId: string): Promise<void> => {
    // Backend doesn't have a delete endpoint for uploads
    // Images are managed through product updates
    // This is a no-op for now
  },
};
