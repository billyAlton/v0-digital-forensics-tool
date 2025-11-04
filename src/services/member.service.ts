// services/member.service.ts
import apiClient from "@/lib/apiCaller";

export interface EmergencyContact {
  name: string;
  phone: string | null;
  relationship: string | null;
}

export interface Member {
  _id?: string;
  email: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  membership_status: 'active' | 'inactive' | 'pending' | 'suspended';
  role: 'admin' | 'pastor' | 'leader' | 'member' | 'volunteer';
  date_of_birth: string | null;
  baptism_date: string | null;
  join_date: string;
  emergency_contact: EmergencyContact | null;
  spiritual_gifts: string[];
  ministries: string[];
  notes: string | null;
  avatar_url: string | null;
  is_email_verified: boolean;
  last_activity: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberStats {
  total: number;
  active: number;
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
}

export const MemberService = {
  // 🟢 Créer un nouveau membre
  async createMember(data: Partial<Member>): Promise<Member> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: Member;
        message: string;
      }>("/members", data);
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur création membre:", error.message);
      throw error;
    }
  },

  // 🟣 Récupérer tous les membres
  async getAllMembers(params?: {
    membership_status?: string;
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ data: Member[]; pagination: any }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Member[];
        pagination: any;
      }>("/members", { params });
      return response.data;
    } catch (error: any) {
      console.error("Erreur chargement membres:", error.message);
      throw error;
    }
  },

  // 🟣 Récupérer un membre par ID
  async getMemberById(id: string): Promise<Member> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Member;
      }>(`/members/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur chargement membre ${id}:`, error.message);
      throw error;
    }
  },

  // 🟣 Récupérer un membre par email
  async getMemberByEmail(email: string): Promise<Member> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Member;
      }>(`/members/email/${email}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur chargement membre ${email}:`, error.message);
      throw error;
    }
  },

  // 🟠 Mettre à jour un membre
  async updateMember(id: string, data: Partial<Member>): Promise<Member> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        data: Member;
        message: string;
      }>(`/members/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur mise à jour membre ${id}:`, error.message);
      throw error;
    }
  },

  // 🔴 Supprimer un membre
  async deleteMember(id: string): Promise<void> {
    try {
      await apiClient.delete(`/members/${id}`);
    } catch (error: any) {
      console.error(`Erreur suppression membre ${id}:`, error.message);
      throw error;
    }
  },

  // 📊 Récupérer les statistiques des membres
  async getMemberStats(): Promise<MemberStats> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: MemberStats;
      }>("/members/stats");
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur chargement statistiques:", error.message);
      throw error;
    }
  },

  // 🔵 Mettre à jour la dernière activité
  async updateLastActivity(id: string): Promise<Member> {
    try {
      const response = await apiClient.patch<{
        success: boolean;
        data: Member;
        message: string;
      }>(`/members/${id}/activity`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur mise à jour activité ${id}:`, error.message);
      throw error;
    }
  },

  // 🔵 Vérifier la disponibilité d'un email
  async checkEmailAvailability(email: string, excludeId?: string): Promise<boolean> {
    try {
      const params: any = { email };
      if (excludeId) params.excludeId = excludeId;
      
      // Cette route devra être créée dans le contrôleur
      const response = await apiClient.get<{
        success: boolean;
        available: boolean;
      }>("/members/check-email", { params });
      
      return response.data.available;
    } catch (error: any) {
      // Si l'email existe, l'API retournera une erreur 400
      if (error.response?.status === 400) {
        return false;
      }
      console.error("Erreur vérification email:", error.message);
      throw error;
    }
  }
};