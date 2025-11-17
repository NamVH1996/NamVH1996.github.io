package models

import "time"

// ========== ALERT MANAGEMENT ==========

// AlertPayload is the incoming alert from Grafana webhook
type AlertPayload struct {
	Status string         `json:"status"`
	Alerts []AlertDetail  `json:"alerts"`
}

// AlertDetail represents a single alert from Grafana
type AlertDetail struct {
	Status      string            `json:"status"`
	Labels      map[string]string `json:"labels"`
	Annotations map[string]string `json:"annotations"`
	StartsAt    time.Time         `json:"starts_at"`
	EndsAt      time.Time         `json:"ends_at"`
	Fingerprint string            `json:"fingerprint"`
}

// AlertLog represents stored alert in database
type AlertLog struct {
	ID                      string                 `json:"id"`
	AlertName               string                 `json:"alert_name"`
	Severity                string                 `json:"severity"`
	Status                  string                 `json:"status"` // firing, resolved
	ProcessingStatus        string                 `json:"processing_status"` // pending, sent, failed
	Summary                 string                 `json:"summary"`
	Description             string                 `json:"description"`
	StartsAt                time.Time              `json:"starts_at"`
	EndsAt                  *time.Time             `json:"ends_at"`
	Fingerprint             string                 `json:"fingerprint"`
	Labels                  map[string]string      `json:"labels"`
	ContactPointsProcessedAt *time.Time             `json:"contact_points_processed_at"`
	ErrorMessage            string                 `json:"error_message"`
	Retries                 int                    `json:"retries"`
	AlertJSON               string                 `json:"alert_json"`
	CreatedAt               time.Time              `json:"created_at"`
	UpdatedAt               time.Time              `json:"updated_at"`
}

// AlertStatsResponse is stats response
type AlertStatsResponse struct {
	Status            string `json:"status"`
	AlertLogs         map[string]int `json:"alert_logs"`
	ProcessingQueue   map[string]int `json:"processing_queue"`
	Timestamp         time.Time `json:"timestamp"`
}

// ========== CONTACT POINTS ==========

// LabelMapping is for routing alerts
type LabelMapping struct {
	Key       string `json:"key"`
	Operator  string `json:"operator"` // =, !=, =~, !~
	Value     string `json:"value"`
}

// ContactPointCreate is request to create contact point
type ContactPointCreate struct {
	Name           string          `json:"name"`
	Type           string          `json:"type"` // telegram, slack, webhook, email
	Config         map[string]interface{} `json:"config"`
	MatchLogic     string          `json:"match_logic"` // ALL, ANY
	LabelMappings  []LabelMapping  `json:"label_mappings"`
	IgnoreMatchers []LabelMapping  `json:"ignore_matchers"`
	GroupName      *string         `json:"group_name"`
	Priority       int             `json:"priority"`
	Enabled        bool            `json:"enabled"`
}

// ContactPoint represents a contact point in database
type ContactPoint struct {
	ID             string         `json:"id"`
	Name           string         `json:"name"`
	Type           string         `json:"type"`
	Config         map[string]interface{} `json:"config"`
	MatchLogic     string         `json:"match_logic"`
	LabelMappings  []LabelMapping `json:"label_mappings"`
	IgnoreMatchers []LabelMapping `json:"ignore_matchers"`
	GroupName      *string        `json:"group_name"`
	Priority       int            `json:"priority"`
	Enabled        bool           `json:"enabled"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
}

// ========== DATA ENRICHMENT ==========

// VMMapping for enriching alerts with VM info
type VMMapping struct {
	ID           string    `json:"id"`
	VMID         *string   `json:"vm_id"`
	VMName       *string   `json:"vm_name"`
	VMPrivateIP  *string   `json:"vm_private_ip"`
	Owner        *string   `json:"owner"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// EscalationMapping for L1/L2 support
type EscalationMapping struct {
	ID           string    `json:"id"`
	BusinessLine string    `json:"business_line"`
	L1           *string   `json:"l1"`
	L2           *string   `json:"l2"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// ExtractionRule for regex-based label extraction
type ExtractionRule struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	LabelKey     string    `json:"label_key"`
	RegexPattern string    `json:"regex_pattern"`
	OutputKey    string    `json:"output_key"`
	Description  *string   `json:"description"`
	Enabled      bool      `json:"enabled"`
	Priority     int       `json:"priority"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// ========== RESPONSE MODELS ==========

// WebhookResponse is response to webhook
type WebhookResponse struct {
	Status       string    `json:"status"`
	AlertsCount  int       `json:"alerts_count"`
	Timestamp    time.Time `json:"timestamp"`
}

// HealthCheckResponse is for health endpoint
type HealthCheckResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

// ErrorResponse is generic error response
type ErrorResponse struct {
	Status  string `json:"status"`
	Error   string `json:"error"`
	Message string `json:"message"`
}
