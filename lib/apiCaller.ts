import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
// Base URL for the API
export const BASE_URL = "http://localhost:8000/api";

// export const BASE_URL = 'https://codux.kababeats.com/api';

// Create an Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000, // 10 seconds
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Request Interceptor: Attach JWT token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token"); // Get token from local storage
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle expired token (401 Unauthorized)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      console.warn("Token expiré ou non valide");

      // Option 1 : Déconnecter l'utilisateur
      localStorage.removeItem("token");
      // window.location.href = '/login';
      // redirection vers la page de login
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
export const post = async <T>(
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
