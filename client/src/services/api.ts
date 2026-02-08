import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserData {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
  remember_me: boolean;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshAccessToken();
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.axiosInstance.post<LoginResponse>(
      '/auth/login',
      credentials
    );

    this.setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.axiosInstance.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.axiosInstance.post<LoginResponse>(
      '/auth/refresh',
      { refresh_token: refreshToken }
    );

    this.setTokens(response.data.access_token, response.data.refresh_token);
  }

  async getCurrentUser(): Promise<UserData> {
    const response = await this.axiosInstance.get<UserData>('/auth/me');
    return response.data;
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }): Promise<UserData> {
    const response = await this.axiosInstance.post<UserData>(
      '/auth/register',
      userData
    );
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Products API
  async getProducts(filters?: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sort_by', filters.sortBy);
    if (filters?.sortOrder) params.append('sort_order', filters.sortOrder);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('page_size', filters.pageSize.toString());

    const response = await this.axiosInstance.get(
      `/products?${params.toString()}`
    );
    return response.data;
  }

  async addProduct(product: {
    name: string;
    vendor: string;
    article: string;
    price: number;
    rating?: number;
    category?: string;
  }): Promise<any> {
    const response = await this.axiosInstance.post('/products', product);
    return response.data;
  }
}

export const apiService = new ApiService();