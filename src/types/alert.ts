export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface Alert {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  source: string
  tags?: string[]
  assignee?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  metadata?: Record<string, any>
}

export interface AlertFilter {
  severity?: AlertSeverity[]
  status?: AlertStatus[]
  search?: string
  startDate?: string
  endDate?: string
  assignee?: string
  tags?: string[]
}

export interface AlertStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  bySeverity: {
    low: number
    medium: number
    high: number
    critical: number
  }
}

export interface CreateAlertRequest {
  title: string
  description: string
  severity: AlertSeverity
  source: string
  tags?: string[]
  assignee?: string
  metadata?: Record<string, any>
}

export interface UpdateAlertRequest {
  title?: string
  description?: string
  severity?: AlertSeverity
  status?: AlertStatus
  assignee?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
