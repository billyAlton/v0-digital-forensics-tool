// services/gallery.service.ts
import apiClient from "@/lib/apiCaller";

export interface GalleryAlbum {
  _id?: string;
  title: string;
  description: string;
  date: string;
  photoCount: number;
  coverImage: string;
  category: string;
  images?: string[];
  is_published: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryVideo {
  _id?: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: number;
  category: string;
  is_published: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
}

export const GalleryService = {
  // Albums
  async getAlbums(params?: {
    category?: string;
    published?: boolean;
    limit?: number;
    page?: number;
  }): Promise<{ data: GalleryAlbum[]; pagination: any }> {
    try {
      const response = await apiClient.get("/gallery/albums", { params });
      return response.data;
    } catch (error: any) {
      console.error("Erreur chargement albums:", error.message);
      throw error;
    }
  },

  async getAlbumById(id: string): Promise<GalleryAlbum> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: GalleryAlbum;
      }>(`/gallery/albums/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur chargement album ${id}:`, error.message);
      throw error;
    }
  },

  async createAlbum(data: Partial<GalleryAlbum>): Promise<GalleryAlbum> {
    try {
      const response = await apiClient.post("/gallery/albums", data);
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur création album:", error.message);
      throw error;
    }
  },

  async updateAlbum(id: string, data: Partial<GalleryAlbum>): Promise<GalleryAlbum> {
    try {
      const response = await apiClient.put(`/gallery/albums/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur mise à jour album ${id}:`, error.message);
      throw error;
    }
  },

  async deleteAlbum(id: string): Promise<void> {
    try {
      await apiClient.delete(`/gallery/albums/${id}`);
    } catch (error: any) {
      console.error(`Erreur suppression album ${id}:`, error.message);
      throw error;
    }
  },

  // Vidéos
  async getVideos(params?: {
    category?: string;
    published?: boolean;
    limit?: number;
    page?: number;
  }): Promise<{ data: GalleryVideo[]; pagination: any }> {
    try {
      const response = await apiClient.get("/gallery/videos", { params });
      return response.data;
    } catch (error: any) {
      console.error("Erreur chargement vidéos:", error.message);
      throw error;
    }
  },

  async getVideoById(id: string): Promise<GalleryVideo> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: GalleryVideo;
      }>(`/gallery/videos/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur chargement vidéo ${id}:`, error.message);
      throw error;
    }
  },

  async createVideo(data: Partial<GalleryVideo>): Promise<GalleryVideo> {
    try {
      const response = await apiClient.post("/gallery/videos", data);
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur création vidéo:", error.message);
      throw error;
    }
  },

  async updateVideo(id: string, data: Partial<GalleryVideo>): Promise<GalleryVideo> {
    try {
      const response = await apiClient.put(`/gallery/videos/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur mise à jour vidéo ${id}:`, error.message);
      throw error;
    }
  },

  async deleteVideo(id: string): Promise<void> {
    try {
      await apiClient.delete(`/gallery/videos/${id}`);
    } catch (error: any) {
      console.error(`Erreur suppression vidéo ${id}:`, error.message);
      throw error;
    }
  },

  async incrementViews(id: string): Promise<GalleryVideo> {
    try {
      const response = await apiClient.patch<{
        success: boolean;
        data: GalleryVideo;
        message: string;
      }>(`/gallery/videos/${id}/views`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur incrémentation vues ${id}:`, error.message);
      throw error;
    }
  },
};