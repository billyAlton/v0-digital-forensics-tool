// services/prayerRequest.service.ts
import apiClient from "@/lib/apiCaller";

export interface PrayerRequest {
  _id?: string;
  title: string;
  description: string;
  requester_name: string | null;
  requester_id: string;
  status: string;
  is_anonymous: boolean;
  is_public: boolean;
  prayer_count: number;
  createdAt?: string;
  updatedAt?: string;
}

export const PrayerRequestService = {
  //  Récupérer toutes les demandes de prière
  async getAllPrayerRequests(params?: {
    status?: string;
    is_public?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: PrayerRequest[]; pagination: any }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: PrayerRequest[];
        pagination: any;
      }>("/prayers/prayer-requests", { params });
      return response.data;
    } catch (error: any) {
      console.error("Erreur chargement demandes de prière:", error.message);
      throw error;
    }
  },

  // 🟣 Récupérer une demande de prière par ID
  async getPrayerRequestById(id: string): Promise<PrayerRequest> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: PrayerRequest;
      }>(`/prayers/prayer-requests/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur chargement demande ${id}:`, error.message);
      throw error;
    }
  },

  // 🟡 Créer une nouvelle demande de prière
  async createPrayerRequest(data: Partial<PrayerRequest>): Promise<PrayerRequest> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: PrayerRequest;
        message: string;
      }>("/prayers/prayer-requests", data);
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur création demande:", error.message);
      throw error;
    }
  },

  // 🟠 Mettre à jour une demande de prière
  async updatePrayerRequest(id: string, data: Partial<PrayerRequest>): Promise<PrayerRequest> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        data: PrayerRequest;
        message: string;
      }>(`/prayers/prayer-requests/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur mise à jour demande ${id}:`, error.message);
      throw error;
    }
  },

  // 🔴 Supprimer une demande de prière
  async deletePrayerRequest(id: string): Promise<void> {
    try {
      await apiClient.delete(`/prayers/prayer-requests/${id}`);
    } catch (error: any) {
      console.error(`Erreur suppression demande ${id}:`, error.message);
      throw error;
    }
  },

  // 🔵 Incrémenter le compteur de prières
  async incrementPrayerCount(id: any): Promise<PrayerRequest> {
    try {
      const response = await apiClient.patch<{
        success: boolean;
        data: PrayerRequest;
        message: string;
      }>(`/prayers/prayer-requests/${id}/pray`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur incrémentation compteur ${id}:`, error.message);
      throw error;
    }
  },

  // 🟣 Récupérer les demandes publiques
  async getPublicPrayerRequests(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: PrayerRequest[]; pagination: any }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: PrayerRequest[];
        pagination: any;
      }>("/prayer-requests/public", { params });
      return response.data;
    } catch (error: any) {
      console.error("Erreur chargement demandes publiques:", error.message);
      throw error;
    }
  },
};