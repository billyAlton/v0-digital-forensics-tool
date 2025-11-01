// services/blogPost.service.ts
import apiClient from "@/lib/apiCaller";

export interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  status: "draft" | "published" | "archived";
  tags: string[];
  author_id: string;
  published_at: string | null;
  views: number;
  reading_time: number;
  createdAt?: string;
  updatedAt?: string;
}

export const BlogPostService = {
  // 🟢 Récupérer tous les articles
  async getAllBlogPosts(params?: {
    status?: string;
    author?: string;
    tag?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ data: BlogPost[]; pagination: any }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: BlogPost[];
        pagination: any;
      }>("/blogs/blog/posts", { params });
      return response.data;
    } catch (error: any) {
      console.error("Erreur chargement articles:", error.message);
      throw error;
    }
  },

  // 🟣 Récupérer un article par ID
  async getBlogPostById(id: string): Promise<BlogPost> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: BlogPost;
      }>(`/blogs/blog/posts/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur chargement article ${id}:`, error.message);
      throw error;
    }
  },

  // 🟣 Récupérer un article par slug
  async getBlogPostBySlug(slug: string): Promise<BlogPost> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: BlogPost;
      }>(`/blogs/blog/posts/slug/${slug}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur chargement article ${slug}:`, error.message);
      throw error;
    }
  },

  // 🟡 Créer un nouvel article
  /* async createBlogPost(data: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: BlogPost;
        message: string;
      }>("/blogs/blog/posts", data);
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur création article:", error.message);
      throw error;
    }
  },

  // 🟠 Mettre à jour un article
  async updateBlogPost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        data: BlogPost;
        message: string;
      }>(`/blogs/blog/posts/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur mise à jour article ${id}:`, error.message);
      throw error;
    }
  }, */

  async createBlogPost(data: Partial<BlogPost>): Promise<BlogPost> {
    try {
      console.log("=== Données avant envoi ===");
      console.log("Tags:", data.tags);
      console.log("Type des tags:", typeof data.tags);

      // Convertir les tags en string si c'est un tableau
      const requestData = {
        ...data,
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags,
      };

      console.log("Tags après conversion:", requestData.tags);

      const response = await apiClient.post<{
        success: boolean;
        data: BlogPost;
        message: string;
      }>("/blogs/blog/posts", requestData);

      return response.data.data;
    } catch (error: any) {
      console.error("=== ERREUR COMPLÈTE ===");
      console.error("Message:", error.message);
      console.error("Response data:", error.response?.data);
      console.error("Status:", error.response?.status);
      throw error;
    }
  },

  // 🟠 Mettre à jour un article
  async updateBlogPost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    try {
      // Convertir les tags en string si c'est un tableau
      const requestData = {
        ...data,
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags,
      };

      const response = await apiClient.put<{
        success: boolean;
        data: BlogPost;
        message: string;
      }>(`/blogs/blog/posts/${id}`, requestData);

      return response.data.data;
    } catch (error: any) {
      console.error(`Erreur mise à jour article ${id}:`, error.message);
      console.error("Response data:", error.response?.data);
      throw error;
    }
  },
  // 🔴 Supprimer un article
  async deleteBlogPost(id: string): Promise<void> {
    try {
      await apiClient.delete(`/blogs/blog/posts/${id}`);
    } catch (error: any) {
      console.error(`Erreur suppression article ${id}:`, error.message);
      throw error;
    }
  },

  // 🟣 Récupérer les articles publiés
  async getPublishedBlogPosts(params?: {
    tag?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ data: BlogPost[]; pagination: any }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: BlogPost[];
        pagination: any;
      }>("/blogs/blog/posts/published", { params });
      return response.data;
    } catch (error: any) {
      console.error("Erreur chargement articles publiés:", error.message);
      throw error;
    }
  },

  // 🔵 Vérifier la disponibilité d'un slug
  async checkSlugAvailability(
    slug: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const params: any = { slug };
      if (excludeId) params.excludeId = excludeId;

      const response = await apiClient.get<{
        success: boolean;
        available: boolean;
      }>("/blogs/blog/posts/check-slug", { params });

      return response.data.available;
    } catch (error: any) {
      console.error("Erreur vérification slug:", error.message);
      throw error;
    }
  },
};
