import apiClient from './client';

// ========== ALERT MANAGEMENT ==========

export interface Alert {
  id: string;
  alert_name: string;
  severity: string;
  status: string;
  processing_status: string;
  summary: string;
  description: string;
  starts_at: string;
  ends_at?: string;
  fingerprint: string;
  labels: Record<string, string>;
  contact_points_processed_at?: string;
  created_at: string;
  updated_at: string;
}

export const alertsService = {
  listAlerts: (limit = 50, offset = 0, filters?: Record<string, string>) =>
    apiClient.get<{ status: string; total: number; data: Alert[] }>('/alerts', {
      params: { limit, offset, ...filters },
    }),

  getAlert: (id: string) =>
    apiClient.get<{ status: string; data: Alert }>(`/alerts/${id}`),

  getStats: () =>
    apiClient.get<any>('/alerts/stats'),
};

// ========== CONTACT POINTS ==========

export interface LabelMapping {
  key: string;
  operator?: string;
  value?: string;
}

export interface ContactPoint {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  match_logic: string;
  label_mappings: LabelMapping[];
  ignore_matchers: LabelMapping[];
  group_name?: string;
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactPointCreate {
  name: string;
  type: string;
  config: Record<string, any>;
  match_logic?: string;
  label_mappings?: LabelMapping[];
  ignore_matchers?: LabelMapping[];
  group_name?: string;
  priority?: number;
  enabled?: boolean;
}

export const contactPointsService = {
  create: (data: ContactPointCreate) =>
    apiClient.post<ContactPoint>('/api/contact-points', data),

  list: (enabledOnly = false) =>
    apiClient.get<ContactPoint[]>('/api/contact-points', {
      params: { enabled_only: enabledOnly },
    }),

  get: (id: string) =>
    apiClient.get<ContactPoint>(`/api/contact-points/${id}`),

  getByName: (name: string) =>
    apiClient.get<ContactPoint>(`/api/contact-points/name/${name}`),

  update: (id: string, data: Partial<ContactPoint>) =>
    apiClient.put<ContactPoint>(`/api/contact-points/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/contact-points/${id}`),

  enable: (id: string) =>
    apiClient.post<ContactPoint>(`/api/contact-points/${id}/enable`),

  disable: (id: string) =>
    apiClient.post<ContactPoint>(`/api/contact-points/${id}/disable`),
};

// ========== VM MAPPINGS ==========

export interface VMMapping {
  id: string;
  vm_id?: string;
  vm_name?: string;
  vm_private_ip?: string;
  owner?: string;
  created_at: string;
  updated_at: string;
}

export const vmMappingsService = {
  create: (data: VMMapping) =>
    apiClient.post<VMMapping>('/api/vm-mappings', data),

  list: () =>
    apiClient.get<VMMapping[]>('/api/vm-mappings'),

  get: (id: string) =>
    apiClient.get<VMMapping>(`/api/vm-mappings/${id}`),

  update: (id: string, data: Partial<VMMapping>) =>
    apiClient.put<VMMapping>(`/api/vm-mappings/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/vm-mappings/${id}`),
};

// ========== ESCALATION MAPPINGS ==========

export interface EscalationMapping {
  id: string;
  business_line: string;
  l1?: string;
  l2?: string;
  created_at: string;
  updated_at: string;
}

export const escalationMappingsService = {
  create: (data: EscalationMapping) =>
    apiClient.post<EscalationMapping>('/api/escalation-mappings', data),

  list: () =>
    apiClient.get<EscalationMapping[]>('/api/escalation-mappings'),

  get: (id: string) =>
    apiClient.get<EscalationMapping>(`/api/escalation-mappings/${id}`),

  update: (id: string, data: Partial<EscalationMapping>) =>
    apiClient.put<EscalationMapping>(`/api/escalation-mappings/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/escalation-mappings/${id}`),
};

// ========== EXTRACTION RULES ==========

export interface ExtractionRule {
  id: string;
  name: string;
  label_key: string;
  regex_pattern: string;
  output_key: string;
  description?: string;
  enabled: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export const extractionRulesService = {
  create: (data: ExtractionRule) =>
    apiClient.post<ExtractionRule>('/api/extraction-rules', data),

  list: (enabledOnly = false) =>
    apiClient.get<ExtractionRule[]>('/api/extraction-rules', {
      params: { enabled_only: enabledOnly },
    }),

  get: (id: string) =>
    apiClient.get<ExtractionRule>(`/api/extraction-rules/${id}`),

  update: (id: string, data: Partial<ExtractionRule>) =>
    apiClient.put<ExtractionRule>(`/api/extraction-rules/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/extraction-rules/${id}`),
};
