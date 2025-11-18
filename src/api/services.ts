import apiClient from './client';

/**
 * Services generated from Swagger API
 * Add your API service methods here after importing Swagger definitions
 */

export interface MetricData {
  timestamp: number;
  value: number;
  label?: string;
}

export interface ServiceHealth {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  lastCheck: number;
}

export interface DashboardData {
  metrics: MetricData[];
  services: Record<string, ServiceHealth>;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
  resolved: boolean;
}

/**
 * Metrics Service
 * TODO: Add specific endpoints after importing Swagger
 */
export const metricsService = {
  /**
   * Get metrics for a specific service
   */
  async getMetrics(serviceId: string, timeRange?: { from: number; to: number }): Promise<MetricData[]> {
    try {
      // Update this endpoint based on your Swagger definition
      const response = await apiClient.get<MetricData[]>(
        `/api/metrics/${serviceId}`,
        { params: timeRange }
      );
      return response;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  },

  /**
   * Get all available metrics
   */
  async getAvailableMetrics(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/api/metrics');
      return response;
    } catch (error) {
      console.error('Error fetching available metrics:', error);
      throw error;
    }
  }
};

/**
 * Services Health Check
 * TODO: Add specific endpoints after importing Swagger
 */
export const healthService = {
  /**
   * Get health status of all services
   */
  async getAllServicesHealth(): Promise<Record<string, ServiceHealth>> {
    try {
      const response = await apiClient.get<Record<string, ServiceHealth>>('/api/health');
      return response;
    } catch (error) {
      console.error('Error fetching services health:', error);
      throw error;
    }
  },

  /**
   * Get specific service health
   */
  async getServiceHealth(serviceId: string): Promise<ServiceHealth> {
    try {
      const response = await apiClient.get<ServiceHealth>(`/api/health/${serviceId}`);
      return response;
    } catch (error) {
      console.error('Error fetching service health:', error);
      throw error;
    }
  }
};

/**
 * Alerts Service
 * TODO: Add specific endpoints after importing Swagger
 */
export const alertsService = {
  /**
   * Get all active alerts
   */
  async getAlerts(filters?: { severity?: string; resolved?: boolean }): Promise<Alert[]> {
    try {
      const response = await apiClient.get<Alert[]>('/api/alerts', { params: filters });
      return response;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<Alert> {
    try {
      const response = await apiClient.post<Alert>(`/api/alerts/${alertId}/acknowledge`);
      return response;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }
};

/**
 * Dashboard Service
 * Get complete dashboard data in one call
 */
export const dashboardService = {
  /**
   * Get complete dashboard data
   */
  async getDashboardData(timeRange?: { from: number; to: number }): Promise<DashboardData> {
    try {
      const [metrics, services, alerts] = await Promise.all([
        metricsService.getMetrics('all', timeRange),
        healthService.getAllServicesHealth(),
        alertsService.getAlerts()
      ]);

      return {
        metrics,
        services,
        alerts
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};
