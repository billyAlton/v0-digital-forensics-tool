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
  createdAt?: string;
  updatedAt?: string;
}

export const SermonService = {
  //  Récupérer tous les sermons
  async getAllSermons(): Promise<any> {
    try {
      const response = await apiClient.get<any[]>("/sermons/sermons");
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors du chargement des sermons :",
        error.message
      );
      throw error;
    }
  },

  // 🟣 Récupérer un sermon par ID
  async getSermonById(id: string): Promise<any> {
    try {
      const response = await apiClient.get<Sermon>(`/sermons/sermons/${id}`);
      return response.data;
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
      console.log("Type:", data instanceof FormData ? "FormData" : "Object");
      
      if (data instanceof FormData) {
        console.log("Contenu du FormData:");
        for (let [key, value] of data.entries()) {
          console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
        }
      } else {
        console.log("Données JSON:", data);
      }
      
      const response = await apiClient.post<Sermon>("/sermons/sermons", data);
      console.log("Réponse:", response.data);
      return response.data;
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
      console.log("Type:", data instanceof FormData ? "FormData" : "Object");
      
      if (!(data instanceof FormData)) {
        console.log("Données JSON:", data);
      }
      
      const response = await apiClient.put<Sermon>(`/sermons/sermons/${id}`, data);
      console.log("Réponse:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("=== ERREUR COMPLÈTE ===");
      console.error("Message:", error.message);
      console.error("Response:", error.response?.data);
      console.error("Status:", error.response?.status);
      throw error;
    }
  },

  // 🔴 Supprimer un sermon
  async deleteSermon(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/sermons/sermons/${id}`);
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
      const response = await apiClient.get<Sermon[]>("/sermons/search", {
        params
      });
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors de la recherche des sermons :",
        error.message
      );
      throw error;
    }
  },

  // 🟣 Récupérer les sermons par série
  async getSermonsBySeries(series: string): Promise<Sermon[]> {
    try {
      const response = await apiClient.get<Sermon[]>(`/sermons/series/${series}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `Erreur lors du chargement des sermons de la série ${series} :`,
        error.message
      );
      throw error;
    }
  },

  // 🟢 Récupérer les sermons par pasteur
  async getSermonsByPastor(pastorName: string): Promise<Sermon[]> {
    try {
      const response = await apiClient.get<Sermon[]>(`/sermons/pastor/${pastorName}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `Erreur lors du chargement des sermons du pasteur ${pastorName} :`,
        error.message
      );
      throw error;
    }
  },

  // 🟡 Récupérer les dernières sermons
  async getRecentSermons(limit: number = 10): Promise<Sermon[]> {
    try {
      const response = await apiClient.get<Sermon[]>(`/sermons/recent?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors du chargement des sermons récents :",
        error.message
      );
      throw error;
    }
  },
};