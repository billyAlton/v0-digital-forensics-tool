// src/services/project.service.ts
import apiClient from "@/lib/apiCaller";

export interface ProjectStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  order: number;
}

export interface DonationExample {
  amount: number;
  description: string;
}

export interface Project {
  _id?: string;
  title: string;
  description: string;
  short_description?: string;
  category: 'construction' | 'humanitarian' | 'education' | 'health' | 'spiritual' | 'other';
  image_url?: string;
  goal_amount: number;
  current_amount: number;
  progress: number;
  status: 'planning' | 'in_progress' | 'completed' | 'paused';
  steps?: ProjectStep[];
  impact_points?: string[];
  donation_examples?: DonationExample[];
  is_featured: boolean;
  is_published: boolean;
  published_at?: string;
  start_date?: string;
  estimated_end_date?: string;
  tags?: string[];
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectsResponse {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProjectStats {
  byCategory: Array<{
    _id: string;
    count: number;
    published: number;
    totalGoal: number;
    totalCurrent: number;
  }>;
  total: number;
  totalPublished: number;
  totalGoal: number;
  totalCurrent: number;
}

export const ProjectService = {
  //  Récupérer les projets publiés (public)
  async getPublishedProjects(params?: {
    category?: string;
    featured?: boolean;
    limit?: number;
    page?: number;
  }): Promise<ProjectsResponse> {
    try {
      const response = await apiClient.get<ProjectsResponse>("/projects/public", { params });
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors du chargement des projets :", error.message);
      throw error;
    }
  },

  //  Récupérer un projet par ID (public)
  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await apiClient.get<{ data: Project }>(`/projects/public/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur lors du chargement du projet ${id} :`, error.message);
      throw error;
    }
  },

  // === ADMIN METHODS ===

  //  Récupérer tous les projets (admin)
  async getAllProjects(params?: {
    category?: string;
    published?: boolean;
    featured?: boolean;
    limit?: number;
    page?: number;
  }): Promise<ProjectsResponse> {
    try {
      const response = await apiClient.get<ProjectsResponse>("/projects/admin", { params });
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors du chargement des projets admin :", error.message);
      throw error;
    }
  },

  //  Créer un projet (admin)
  async createProject(data: Partial<Project>): Promise<Project> {
    try {
      const response = await apiClient.post<{ data: Project }>("/projects/admin", data);
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur lors de la création du projet :", error.message);
      throw error;
    }
  },

  //  Mettre à jour un projet (admin)
  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    try {
      const response = await apiClient.put<{ data: Project }>(`/projects/admin/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour du projet ${id} :`, error.message);
      throw error;
    }
  },

  //  Supprimer un projet (admin)
  async deleteProject(id: string): Promise<void> {
    try {
      await apiClient.delete(`/projects/admin/${id}`);
    } catch (error: any) {
      console.error(`Erreur lors de la suppression du projet ${id} :`, error.message);
      throw error;
    }
  },

  //  Récupérer les statistiques (admin)
  async getProjectStats(): Promise<ProjectStats> {
    try {
      const response = await apiClient.get<{ data: ProjectStats }>("/projects/admin/stats");
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur lors du chargement des statistiques :", error.message);
      throw error;
    }
  }
};