// services/donation.service.ts
import apiClient from "@/lib/apiCaller";

export interface Donation {
  _id?: string;
  donor_name: string | null;
  donor_email: string | null;
  donor_id: string | null;
  amount: number;
  currency: string;
  donation_type: 'tithe' | 'offering' | 'mission' | 'building' | 'other';
  payment_method: 'card' | 'bank' | 'cash' | 'check' | 'mobile';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_id: string;
  notes: string | null;
  is_recurring: boolean;
  recurrence_frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
  next_recurrence_date: string | null;
  is_anonymous: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DonationStats {
  totalAmount: number;
  totalDonations: number;
  averageAmount: number;
  maxAmount: number;
  minAmount: number;
  byType: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
}

export const DonationService = {
  // 🟢 Créer un nouveau don
  async createDonation(data: Partial<Donation>): Promise<Donation> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: Donation;
        message: string;
      }>("/donations", data);
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur création don:", error.message);
      throw error;
    }
  },

  // 🟣 Récupérer tous les dons
  async getAllDonations(params?: {
    payment_status?: string;
    donation_type?: string;
    payment_method?: string;
    is_recurring?: boolean;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Donation[]; pagination: any }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Donation[];
        pagination: any;
      }>("/donations", { params });
      return response.data;
    } catch (error: any) {
      console.error("Erreur chargement dons:", error.message);
      throw error;
    }
  },

  // 🟣 Récupérer un don par ID
  async getDonationById(id: string): Promise<Donation> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Donation;
      }>(`/donations/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur chargement don ${id}:`, error.message);
      throw error;
    }
  },

  // 🟠 Mettre à jour un don
  async updateDonation(id: string, data: Partial<Donation>): Promise<Donation> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        data: Donation;
        message: string;
      }>(`/donations/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur mise à jour don ${id}:`, error.message);
      throw error;
    }
  },

  // 🔴 Supprimer un don
  async deleteDonation(id: string): Promise<void> {
    try {
      await apiClient.delete(`/donations/${id}`);
    } catch (error: any) {
      console.error(`Erreur suppression don ${id}:`, error.message);
      throw error;
    }
  },

  // 📊 Récupérer les statistiques des dons
  async getDonationStats(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<DonationStats> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: DonationStats;
      }>("/donations/stats", { params });
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur chargement statistiques:", error.message);
      throw error;
    }
  },

  // 🔵 Récupérer les dons d'un utilisateur
  async getUserDonations(userId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Donation[]; pagination: any }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Donation[];
        pagination: any;
      }>(`/donations/user/${userId}`, { params });
      return response.data;
    } catch (error: any) {
      console.error(`Erreur chargement dons utilisateur ${userId}:`, error.message);
      throw error;
    }
  },
};