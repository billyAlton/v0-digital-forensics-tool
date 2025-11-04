import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
// Base URL for the API
export const BASE_URL = "http://localhost:8002/api";
import { createClient } from "@/lib/supabase/client";

// export const BASE_URL = 'https://codux.kababeats.com/api';

// Create an Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

const getSupabaseToken = async (): Promise<string | null> => {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error("Erreur récupération token Supabase:", error);
    return null;
  }
};

// Request Interceptor: Attach JWT token to every request
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Récupérer le token depuis Supabase
      const token = await getSupabaseToken();

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Token ajouté à la requête");
      } else {
        console.warn("Aucun token Supabase trouvé");
      }

      // Gérer FormData
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      return config;
    } catch (error) {
      console.error("Erreur interceptor request:", error);
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle expired token (401 Unauthorized)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      console.warn("Token expiré ou non valide - Déconnexion...");

      // Déconnecter l'utilisateur via Supabase
      try {
        const supabase = createClient();
        await supabase.auth.signOut();

        // Redirection vers la page de login
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      } catch (logoutError) {
        console.error("Erreur lors de la déconnexion:", logoutError);
      }
    }

    return Promise.reject(error);
  }
);

// Generic GET request
export const get = async <T>(
  url: string,
  params: Record<string, any> = {}
): Promise<T> => {
  try {
    const response = await apiClient.get<T>(url, { params });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Generic POST request
/* export const post = async <T>(
  url: string,
  data: Record<string, any> | FormData = {}
): Promise<T> => {
  try {
    const response = await apiClient.post<T>(url, data, {
      headers:
        data instanceof FormData ? {} : { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
}; */

export const post = async <T>(
  url: string,
  data: Record<string, any> | FormData = {}
): Promise<T> => {
  try {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Generic PUT request
export const put = async <T>(
  url: string,
  data: Record<string, any> | FormData = {}
): Promise<T> => {
  try {
    const response = await apiClient.put<T>(url, data, {
      headers:
        data instanceof FormData ? {} : { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Generic DELETE request
export const remove = async (url: string): Promise<void> => {
  try {
    const response = await apiClient.delete(url);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export default apiClient;
