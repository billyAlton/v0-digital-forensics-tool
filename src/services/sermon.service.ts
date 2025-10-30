// src/services/sermon.service.ts
import apiClient from "@/lib/apiCaller";

export interface Sermon {
  _id?: string;
  title: string;
  description: string | null;
  pastor_name: string;
  sermon_date: string;
  scripture_reference: string | null;
  video_url: string | null;
  audio_url: string | null;
  transcript: string | null;
  series: string | null;
  tags: string[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// services/sermon.service.ts
export const SermonService = {
  // 🟢 Récupérer tous les sermons
  async getAllSermons(): Promise<Sermon[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Sermon[];
        count: number;
      }>("/sermons");
      
      // Retourner directement le tableau data
      return response.data.data;
    } catch (error: any) {
      console.error(
        "Erreur lors du chargement des sermons :",
        error.message
      );
      throw error;
    }
  },

  // 🟣 Récupérer un sermon par ID
  async getSermonById(id: string): Promise<Sermon> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Sermon;
      }>(`/sermons/${id}`);
      
      return response.data.data;
    } catch (error: any) {
      console.error(
        `Erreur lors du chargement du sermon ${id} :`,
        error.message
      );
      throw error;
    }
  },

  // 🟡 Créer un nouveau sermon
  async createSermon(data: Sermon | FormData): Promise<Sermon> {
    try {
      console.log("=== Envoi des données du sermon ===");
      
      let requestData: any;
      
      if (data instanceof FormData) {
        requestData = data;
        console.log("Type: FormData");
      } else {
        requestData = {
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : 
                typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()) : 
                []
        };
        console.log("Type: Object - Tags:", requestData.tags);
      }
      
      const response = await apiClient.post<{
        success: boolean;
        data: Sermon;
        message: string;
      }>("/sermons", requestData);
      
      console.log("Réponse:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("=== ERREUR COMPLÈTE ===");
      console.error("Message:", error.message);
      console.error("Response:", error.response?.data);
      console.error("Status:", error.response?.status);
      throw error;
    }
  },

  // 🟠 Mettre à jour un sermon
  async updateSermon(id: string, data: Partial<Sermon> | FormData): Promise<Sermon> {
    try {
      console.log(`=== Mise à jour du sermon ${id} ===`);
      
      let requestData: any;
      
      if (data instanceof FormData) {
        requestData = data;
        console.log("Type: FormData");
      } else {
        requestData = {
          ...data,
          tags: data.tags !== undefined ? 
                (Array.isArray(data.tags) ? data.tags : 
                 typeof data.tags === 'string' ? data.tags?.split(',').map(tag => tag.trim()) : 
                 []) : 
                undefined
        };
        console.log("Type: Object - Tags:", requestData.tags);
      }
      
      const response = await apiClient.put<{
        success: boolean;
        data: Sermon;
        message: string;
      }>(`/sermons/${id}`, requestData);
      
      console.log("Réponse:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("=== ERREUR COMPLÈTE ===");
      console.error("Message:", error.message);
      console.error("Response:", error.response?.data);
      console.error("Status:", error.response?.status);
      throw error;
    }
  },

  // 🔴 Supprimer un sermon
  async deleteSermon(id: string): Promise<any> {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`/sermons/${id}`);
      
      return response.data;
    } catch (error: any) {
      console.error(
        `Erreur lors de la suppression du sermon ${id} :`,
        error.message
      );
      throw error;
    }
  },

  // 🔵 Rechercher des sermons
  async searchSermons(params: {
    query?: string;
    pastor?: string;
    series?: string;
    tags?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Sermon[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Sermon[];
        count: number;
      }>("/sermons/search", { params });
      
      return response.data.data;
    } catch (error: any) {
      console.error(
        "Erreur lors de la recherche des sermons :",
        error.message
      );
      throw error;
    }
  },
};