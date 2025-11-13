import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config/api'
import { ApiError } from '@/types'

class ApiService {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        const token = localStorage.getItem('token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message,
          code: error.code,
          details: error.response?.data,
        }

        // Handle specific error cases
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login or refresh token
          localStorage.removeItem('token')
          window.location.href = '/login'
        }

        return Promise.reject(apiError)
      }
    )
  }

  public getAxiosInstance(): AxiosInstance {
    return this.instance
  }

  // Generic HTTP methods
  public async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.instance.get<T>(url, { params })
    return response.data
  }

  public async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.instance.post<T>(url, data)
    return response.data
  }

  public async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.instance.put<T>(url, data)
    return response.data
  }

  public async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.instance.patch<T>(url, data)
    return response.data
  }

  public async delete<T>(url: string): Promise<T> {
    const response = await this.instance.delete<T>(url)
    return response.data
  }
}

export const apiService = new ApiService()
export default apiService
