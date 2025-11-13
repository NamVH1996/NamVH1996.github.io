import { apiService } from './api'
import { API_ENDPOINTS } from '@/config/api'
import {
  Alert,
  AlertFilter,
  AlertStats,
  CreateAlertRequest,
  UpdateAlertRequest,
  PaginatedResponse,
} from '@/types'

export class AlertService {
  /**
   * Get paginated list of alerts with optional filters
   */
  async getAlerts(
    page: number = 1,
    pageSize: number = 10,
    filters?: AlertFilter
  ): Promise<PaginatedResponse<Alert>> {
    const params = {
      page,
      pageSize,
      ...filters,
    }
    return apiService.get<PaginatedResponse<Alert>>(API_ENDPOINTS.alerts, params)
  }

  /**
   * Get alert by ID
   */
  async getAlertById(id: string): Promise<Alert> {
    return apiService.get<Alert>(API_ENDPOINTS.alertById(id))
  }

  /**
   * Create new alert
   */
  async createAlert(data: CreateAlertRequest): Promise<Alert> {
    return apiService.post<Alert>(API_ENDPOINTS.alerts, data)
  }

  /**
   * Update existing alert
   */
  async updateAlert(id: string, data: UpdateAlertRequest): Promise<Alert> {
    return apiService.put<Alert>(API_ENDPOINTS.alertById(id), data)
  }

  /**
   * Delete alert
   */
  async deleteAlert(id: string): Promise<void> {
    return apiService.delete<void>(API_ENDPOINTS.alertById(id))
  }

  /**
   * Get alert statistics
   */
  async getAlertStats(): Promise<AlertStats> {
    return apiService.get<AlertStats>(API_ENDPOINTS.alertStats)
  }

  /**
   * Bulk update alerts
   */
  async bulkUpdateAlerts(
    ids: string[],
    data: UpdateAlertRequest
  ): Promise<Alert[]> {
    return apiService.post<Alert[]>(`${API_ENDPOINTS.alerts}/bulk-update`, {
      ids,
      ...data,
    })
  }

  /**
   * Bulk delete alerts
   */
  async bulkDeleteAlerts(ids: string[]): Promise<void> {
    return apiService.post<void>(`${API_ENDPOINTS.alerts}/bulk-delete`, { ids })
  }
}

export const alertService = new AlertService()
export default alertService
