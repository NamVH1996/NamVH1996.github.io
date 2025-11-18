import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * API Client for All-in-One Monitoring Plugin
 * Automatically uses Grafana's plugin bridge in production
 * Falls back to direct backend URL in development
 */
export class APIClient {
  private client: AxiosInstance;
  private baseURL: string;
  private apiKey: string = '';

  constructor(baseURL: string = '', apiKey: string = '') {
    // Auto-detect environment
    if (!baseURL) {
      // In Grafana plugin environment, use plugin bridge
      if (typeof window !== 'undefined') {
        baseURL = '/api/plugins/all-in-one-app/resources';
      } else {
        // In Node environment (testing), use direct backend URL
        baseURL = 'http://localhost:8080';
      }
    }

    this.baseURL = baseURL;
    this.apiKey = apiKey;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      }
    });

    // Add request interceptor
    this.client.interceptors.request.use(
      config => {
        if (this.apiKey && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${this.apiKey}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set API base URL and key
   */
  setConfig(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.client.defaults.baseURL = baseURL;
    if (apiKey) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data, config);
    return response.data;
  }
}

export default new APIClient();
