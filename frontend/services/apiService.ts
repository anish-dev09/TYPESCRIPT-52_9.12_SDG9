import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          
          if (status === 401) {
            // Unauthorized - clear token and redirect to login
            this.clearToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
            toast.error('Session expired. Please login again.');
          } else if (status === 403) {
            toast.error('Access denied');
          } else if (status >= 500) {
            toast.error('Server error. Please try again later.');
          } else if (data?.message) {
            toast.error(data.message);
          }
        } else if (error.request) {
          toast.error('Network error. Please check your connection.');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Token management
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
  }

  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
  }

  // Authentication endpoints
  async login(walletAddress: string, signature: string) {
    const response = await this.api.post('/auth/login', {
      walletAddress,
      signature,
    });
    return response.data;
  }

  async register(userData: {
    walletAddress: string;
    email: string;
    name: string;
    signature: string;
  }) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data: { name?: string; email?: string }) {
    const response = await this.api.put('/auth/profile', data);
    return response.data;
  }

  // User endpoints
  async getUserPortfolio() {
    const response = await this.api.get('/users/portfolio');
    return response.data;
  }

  async updateKYC(status: 'pending' | 'verified' | 'rejected') {
    const response = await this.api.put('/users/kyc', { kycStatus: status });
    return response.data;
  }

  // Project endpoints
  async getProjects(params?: {
    category?: string;
    status?: string;
    search?: string;
  }) {
    const response = await this.api.get('/projects', { params });
    return response.data;
  }

  async getProjectById(id: string) {
    const response = await this.api.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(projectData: any) {
    const response = await this.api.post('/projects', projectData);
    return response.data;
  }

  async updateProject(id: string, projectData: any) {
    const response = await this.api.put(`/projects/${id}`, projectData);
    return response.data;
  }

  // Investment endpoints
  async getInvestments(userId?: string) {
    const response = await this.api.get('/investments', {
      params: userId ? { userId } : {},
    });
    return response.data;
  }

  async createInvestment(investmentData: {
    projectId: number;
    amount: number;
    transactionHash: string;
    tokensMinted: number;
  }) {
    const response = await this.api.post('/investments', investmentData);
    return response.data;
  }

  async getInvestmentById(id: string) {
    const response = await this.api.get(`/investments/${id}`);
    return response.data;
  }

  // Milestone endpoints
  async getMilestones(projectId: string) {
    const response = await this.api.get(`/projects/${projectId}/milestones`);
    return response.data;
  }

  async completeMilestone(milestoneId: string) {
    const response = await this.api.post(`/milestones/${milestoneId}/complete`);
    return response.data;
  }

  // Transaction endpoints
  async getTransactions(params?: {
    userId?: string;
    type?: string;
    limit?: number;
  }) {
    const response = await this.api.get('/transactions', { params });
    return response.data;
  }

  // Interest endpoints
  async calculateInterest(userId: string) {
    const response = await this.api.post('/interest/calculate', { userId });
    return response.data;
  }

  async getUserInterests(userId: string) {
    const response = await this.api.get(`/interest/user/${userId}`);
    return response.data;
  }

  // Transparency endpoints
  async getTransparencyData(projectId?: string) {
    const endpoint = projectId
      ? `/transparency/project/${projectId}`
      : '/transparency';
    const response = await this.api.get(endpoint);
    return response.data;
  }

  // Generic methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete(url, config);
    return response.data;
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
