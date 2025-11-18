package models

import (
	"time"
)

// Alert represents a single alert
type Alert struct {
	ID        string            `json:"id"`
	Status    string            `json:"status"` // firing, resolved
	Labels    map[string]string `json:"labels"`
	Annotations map[string]string `json:"annotations"`
	StartsAt  time.Time         `json:"startsAt"`
	EndsAt    time.Time         `json:"endsAt"`
	UpdatedAt time.Time         `json:"updatedAt"`
	Fingerprint string          `json:"fingerprint"`
}

// AlertSummary is the response model for alert list API
type AlertSummary struct {
	ID        string                 `json:"id"`
	Status    string                 `json:"status"`
	Severity  string                 `json:"severity"`
	Group     string                 `json:"group"`
	Summary   string                 `json:"summary"`
	Description string               `json:"description"`
	Labels    map[string]string      `json:"labels"`
	StartsAt  time.Time              `json:"startsAt"`
	UpdatedAt time.Time              `json:"updatedAt"`
}

// AlertFilter is used for filtering alerts
type AlertFilter struct {
	Status      string   `query:"status"`      // firing, resolved, all
	Severity    string   `query:"severity"`    // critical, warning, info
	Group       string   `query:"group"`       // filter by group/label
	SearchTerm  string   `query:"search"`      // search in summary/description
	Limit       int      `query:"limit"`       // max results
	Offset      int      `query:"offset"`      // pagination
}

// AlertListResponse is the API response for list alerts
type AlertListResponse struct {
	Total   int            `json:"total"`
	Count   int            `json:"count"`
	Alerts  []AlertSummary `json:"alerts"`
	Error   string         `json:"error,omitempty"`
}

// AlertGroupsResponse shows alerts grouped by label
type AlertGroupsResponse struct {
	Groups map[string][]AlertSummary `json:"groups"`
	Total  int                        `json:"total"`
}

// AcknowledgeRequest is the request body for acknowledging alerts
type AcknowledgeRequest struct {
	AlertID string `json:"alertId"`
	Message string `json:"message"`
}

// AcknowledgeResponse is the response for acknowledge operation
type AcknowledgeResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	AlertID string `json:"alertId"`
}

// HealthResponse shows AlertManager health status
type HealthResponse struct {
	AlertManagerURL string `json:"alertManagerUrl"`
	Status          string `json:"status"` // healthy, unreachable
	Message         string `json:"message"`
	LastCheck       time.Time `json:"lastCheck"`
}
