// src/services/testimony.service.ts
import apiClient from "@/lib/apiCaller";

export interface Testimony {
  _id?: string;
  title: string;
  content: string;
  author_name: string;
  author_email: string;
  author_location?: string;
  category: string;
  status: 'pending' | 'approved' | 'scheduled' | 'archived' | 'rejected';
  scheduled_date?: string;
  images?: string[];
  is_featured: boolean;
  likes: number;
  approved_by?: string;
  approved_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestimonyFormData {
  title: string;
  content: string;
  author_name: string;
  author_email: string;
  author_location?: string;
  category: string;
  images?: File[];
}

export interface TestimonyStats {
  byStatus: Array<{ _id: string; count: number }>;
  total: number;
  featured: number;
}

export interface TestimoniesResponse {
  data: Testimony[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const TestimonyService = {
  // 🟢 Soumettre un témoignage (public)
  async submitTestimony(data: TestimonyFormData | FormData): Promise<{ success: boolean; message: string; data: any }> {
    try {
      console.log("=== Soumission du témoignage ===");
      console.log("Type:", data instanceof FormData ? "FormData" : "Object");
      
      if (data instanceof FormData) {
        console.log("Contenu du FormData:");
        for (let [key, value] of data.entries()) {
          console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
        }
      } else {
        console.log("Données JSON:", data);
      }
      
      const response = await apiClient.post<{ success: boolean; message: string; data: any }>(
        "/testimonies/submit", 
        data
      );
      console.log("Réponse:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("=== ERREUR SOUmission TÉMOIGNAGE ===");
      console.error("Message:", error.message);
      console.error("Response:", error.response?.data);
      console.error("Status:", error.response?.status);
      throw error;
    }
  },

  // 🟢 Récupérer les témoignages approuvés (public)
  async getApprovedTestimonies(params?: {
    category?: string;
    featured?: boolean;
    limit?: number;
    page?: number;
  }): Promise<TestimoniesResponse> {
    try {
      const response = await apiClient.get<TestimoniesResponse>("/testimonies/public", { params });
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors du chargement des témoignages :",
        error.message
      );
      throw error;
    }
  },

  // 🟣 Récupérer un témoignage par ID (admin)
  async getTestimonyById(id: string): Promise<Testimony> {
    try {
      const response = await apiClient.get<any>(`/testimonies/admin/${id}`);
      console.log("===== ", response.data)
      return response.data.data;
    } catch (error: any) {
      console.error(
        `Erreur lors du chargement du témoignage ${id} :`,
        error.message
      );
      throw error;
    }
  },

  // 🟡 Créer un témoignage (admin - alternative)
  async createTestimony(data: Testimony | FormData): Promise<Testimony> {
    try {
      console.log("=== Création du témoignage (admin) ===");
      
      const response = await apiClient.post<Testimony>("/testimonies/admin/create", data);
      console.log("Réponse:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("=== ERREUR CRÉATION TÉMOIGNAGE ===");
      console.error("Message:", error.message);
      console.error("Response:", error.response?.data);
      console.error("Status:", error.response?.status);
      throw error;
    }
  },

  // 🟠 Mettre à jour le statut d'un témoignage (admin)
  async updateTestimonyStatus(
    id: string, 
    data: { 
      status: string; 
      scheduled_date?: string; 
      is_featured?: boolean;
    }
  ): Promise<Testimony> {
    try {
      const response = await apiClient.put<Testimony>(
        `/testimonies/admin/${id}/status`, 
        data
      );
      return response.data;
    } catch (error: any) {
      console.error(
        `Erreur lors de la mise à jour du témoignage ${id} :`,
        error.message
      );
      throw error;
    }
  },

  // 🔴 Supprimer un témoignage (admin)
  async deleteTestimony(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/testimonies/admin/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `Erreur lors de la suppression du témoignage ${id} :`,
        error.message
      );
      throw error;
    }
  },

  // 📊 Récupérer les statistiques (admin)
  async getTestimonyStats(): Promise<TestimonyStats> {
    try {
      const response = await apiClient.get<TestimonyStats>("/testimonies/admin/stats");
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors du chargement des statistiques :",
        error.message
      );
      throw error;
    }
  },

  // 📝 Récupérer tous les témoignages (admin avec filtres)
  async getAllTestimonies(params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<TestimoniesResponse> {
    try {
      const response = await apiClient.get<TestimoniesResponse>("/testimonies/admin", { params });
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors du chargement des témoignages admin :",
        error.message
      );
      throw error;
    }
  },

  // ❤️ Ajouter/retirer un like (public)
  async toggleLike(testimonyId: string): Promise<{ success: boolean; likes: number }> {
    try {
      const response = await apiClient.post<{ success: boolean; likes: number }>(
        `/testimonies/${testimonyId}/like`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        `Erreur lors du like du témoignage ${testimonyId} :`,
        error.message
      );
      throw error;
    }
  },

  // 🔍 Rechercher des témoignages (public)
  async searchTestimonies(query: string, params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<TestimoniesResponse> {
    try {
      const response = await apiClient.get<TestimoniesResponse>("/testimonies/search", {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors de la recherche des témoignages :",
        error.message
      );
      throw error;
    }
  }
};