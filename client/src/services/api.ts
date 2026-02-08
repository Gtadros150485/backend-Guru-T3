import axios, { AxiosInstance, AxiosError } from 'axios';

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

const apiAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class ApiService {
  private isRefreshing = false;
  private refreshQueue: Array<() => void> = [];

  constructor() {
    apiAxios.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && config.headers && !config.url?.includes('/auth/refresh')) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    apiAxios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest?._retry &&
          !originalRequest?.url?.includes('/auth/refresh')
        ) {
          originalRequest._retry = true;

          try {
            await this.handleTokenRefresh();
            return apiAxios(originalRequest);
          } catch {
            this.clearTokens();
            window.location.href = '/login';
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

  private setTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private async handleTokenRefresh(): Promise<void> {
    if (this.isRefreshing) {
      await new Promise<void>((resolve) => this.refreshQueue.push(resolve));
      return;
    }

    this.isRefreshing = true;

    try {
      await this.refreshAccessToken();
      this.refreshQueue.forEach((cb) => cb());
      this.refreshQueue = [];
    } finally {
      this.isRefreshing = false;
    }
  }

  private async refreshAccessToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const response = await refreshAxios.post<LoginResponse>(
      '/auth/refresh',
      { refresh_token: refreshToken }
    );

    this.setTokens(response.data.access_token, response.data.refresh_token);
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiAxios.post<LoginResponse>(
      '/auth/login',
      credentials
    );

    this.setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiAxios.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<UserData> {
    const response = await apiAxios.get<UserData>('/auth/me');
    return response.data;
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }): Promise<UserData> {
    const response = await apiAxios.post<UserData>(
      '/auth/register',
      userData
    );
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  async getProducts(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const response = await apiAxios.get(`/products/?${queryParams.toString()}`);
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
    const response = await apiAxios.post('/products', product);
    return response.data;
  }

  async createProduct(productData: any): Promise<any> {
    const response = await apiAxios.post('/products/', productData);
    return response.data;
  }

  async getProduct(id: number): Promise<any> {
    const response = await apiAxios.get(`/products/${id}`);
    return response.data;
  }

  async updateProduct(id: number, productData: any): Promise<any> {
    const response = await apiAxios.put(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: number): Promise<any> {
    const response = await apiAxios.delete(`/products/${id}`);
    return response.data;
  }

  async createOrder(orderData: { product_id: number; quantity: number }): Promise<any> {
    const response = await apiAxios.post('/products/orders', orderData);
    return response.data;
  }

  async getOrders(params?: { skip?: number; limit?: number }): Promise<any> {
    const response = await apiAxios.get('/products/orders/', { params });
    return response.data;
  }
}

export const apiService = new ApiService();
