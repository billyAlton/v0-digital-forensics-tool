// src/services/resource.service.ts
import apiClient from "@/lib/apiCaller";

export interface Resource {
  _id?: string;
  title: string;
  description: string;
  category: 'book' | 'brochure' | 'song' | 'faq' | 'other';
  file_type: 'pdf' | 'audio' | 'video' | 'text' | 'image' | 'none';
  file_url?: string;
  file_size?: number;
  pages?: number;
  duration?: string;
  artist?: string;
  download_count: number;
  is_published: boolean;
  published_at?: string;
  tags?: string[];
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourcesResponse {
  data: Resource[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ResourceStats {
  byCategory: Array<{
    _id: string;
    count: number;
    published: number;
    totalDownloads: number;
  }>;
  total: number;
  totalDownloads: number;
}

export const ResourceService = {
  //  Récupérer les ressources publiées (public)
  async getPublishedResources(params?: {
    category?: string;
    limit?: number;
    page?: number;
    search?: string;
  }): Promise<ResourcesResponse> {
    try {
      const response = await apiClient.get<ResourcesResponse>("/resources/public", { params });
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors du chargement des ressources :", error.message);
      throw error;
    }
  },

  //  Récupérer les FAQ (public)
  async getFAQs(): Promise<Resource[]> {
    try {
      const response = await apiClient.get<{ data: Resource[] }>("/resources/public/faqs");
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur lors du chargement des FAQ :", error.message);
      throw error;
    }
  },

  //  Récupérer une ressource par ID (public)
  async getResourceById(id: string): Promise<Resource> {
    try {
      const response = await apiClient.get<{ data: Resource }>(`/resources/public/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur lors du chargement de la ressource ${id} :`, error.message);
      throw error;
    }
  },

  //  Incrémenter le compteur de téléchargements
  async incrementDownloadCount(id: string): Promise<Resource> {
    try {
      const response = await apiClient.put<{ data: Resource }>(`/resources/public/${id}/download`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur lors de l'incrémentation du compteur ${id} :`, error.message);
      throw error;
    }
  },

  // === ADMIN METHODS ===

  //  Récupérer toutes les ressources (admin)
  async getAllResources(params?: {
    category?: string;
    published?: boolean;
    limit?: number;
    page?: number;
    search?: string;
  }): Promise<ResourcesResponse> {
    try {
      const response = await apiClient.get<ResourcesResponse>("/resources/admin", { params });
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors du chargement des ressources admin :", error.message);
      throw error;
    }
  },

  //  Créer une ressource (admin)
  async createResource(data: Partial<Resource>): Promise<Resource> {
    try {
      const response = await apiClient.post<{ data: Resource }>("/resources/admin", data);
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur lors de la création de la ressource :", error.message);
      throw error;
    }
  },

  //  Mettre à jour une ressource (admin)
  async updateResource(id: string, data: Partial<Resource>): Promise<Resource> {
    try {
      const response = await apiClient.put<{ data: Resource }>(`/resources/admin/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour de la ressource ${id} :`, error.message);
      throw error;
    }
  },

  //  Supprimer une ressource (admin)
  async deleteResource(id: string): Promise<void> {
    try {
      await apiClient.delete(`/resources/admin/${id}`);
    } catch (error: any) {
      console.error(`Erreur lors de la suppression de la ressource ${id} :`, error.message);
      throw error;
    }
  },

  //  Récupérer les statistiques (admin)
  async getResourceStats(): Promise<ResourceStats> {
    try {
      const response = await apiClient.get<{ data: ResourceStats }>("/resources/admin/stats");
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur lors du chargement des statistiques :", error.message);
      throw error;
    }
  }
};