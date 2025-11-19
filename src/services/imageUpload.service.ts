// src/services/imageUpload.service.ts
import apiClient from "@/lib/apiCaller";

export interface UploadResponse {
  success: boolean;
  message: string;
  imageUrl: string;
  imageId: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  imageUrls: string[];
}

export const ImageUploadService = {
  //  Uploader une seule image
  async uploadSingleImage(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post<UploadResponse>(
        '/upload/single',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de l\'upload de l\'image :', error.message);
      throw error;
    }
  },

  //  Uploader plusieurs images
  async uploadMultipleImages(files: File[]): Promise<MultipleUploadResponse> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('images', file);
      });

      const response = await apiClient.post<MultipleUploadResponse>(
        '/upload/multiple',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de l\'upload des images :', error.message);
      throw error;
    }
  },

  //  Supprimer une image
  async deleteImage(imageId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        `/upload/${imageId}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        `Erreur lors de la suppression de l'image ${imageId} :`,
        error.message
      );
      throw error;
    }
  }
};