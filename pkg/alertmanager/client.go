package alertmanager

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/NamVH1996/grafana-alert-plugin/pkg/models"
	log "github.com/sirupsen/logrus"
	amAlert "github.com/prometheus/alertmanager/api/v2/models"
)

// Client is an AlertManager API client
type Client struct {
	baseURL string
	client  *http.Client
}

// NewClient creates a new AlertManager client
func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: baseURL,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// GetAlerts fetches alerts from AlertManager with optional filter
func (c *Client) GetAlerts(filter *models.AlertFilter) (*models.AlertListResponse, error) {
	endpoint := fmt.Sprintf("%s/api/v2/alerts", c.baseURL)

	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		log.WithError(err).Error("Failed to create request")
		return nil, err
	}

	// Add query parameters
	q := req.URL.Query()
	if filter.Status != "" && filter.Status != "all" {
		q.Add("filter", fmt.Sprintf("status=%s", filter.Status))
	}
	if filter.Group != "" {
		q.Add("filter", fmt.Sprintf("group=%s", filter.Group))
	}
	req.URL.RawQuery = q.Encode()

	resp, err := c.client.Do(req)
	if err != nil {
		log.WithError(err).Error("Failed to fetch alerts from AlertManager")
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.WithFields(log.Fields{
			"status": resp.StatusCode,
			"body":   string(body),
		}).Error("AlertManager returned non-200 status")
		return nil, fmt.Errorf("AlertManager error: %d", resp.StatusCode)
	}

	var amAlerts []*amAlert.GettableAlert
	if err := json.NewDecoder(resp.Body).Decode(&amAlerts); err != nil {
		log.WithError(err).Error("Failed to decode AlertManager response")
		return nil, err
	}

	// Convert to our model and apply client-side filtering
	alerts := c.convertAlerts(amAlerts, filter)

	response := &models.AlertListResponse{
		Total:  len(alerts),
		Count:  len(alerts),
		Alerts: alerts,
	}

	return response, nil
}

// GetAlertStats returns alert statistics
func (c *Client) GetAlertStats() (*models.AlertStatsResponse, error) {
	alerts, err := c.GetAlerts(&models.AlertFilter{Status: "all"})
	if err != nil {
		return nil, err
	}

	stats := &models.AlertStatsResponse{
		Total: len(alerts.Alerts),
	}

	for _, alert := range alerts.Alerts {
		if alert.Status == "firing" {
			stats.Firing++
		} else if alert.Status == "resolved" {
			stats.Resolved++
		}

		severity := alert.Labels["severity"]
		switch severity {
		case "critical":
			stats.Critical++
		case "warning":
			stats.Warning++
		case "info":
			stats.Info++
		}
	}

	return stats, nil
}

// GetAlertsByGroup returns alerts grouped by a specific label
func (c *Client) GetAlertsByGroup(groupLabel string) (*models.AlertGroupsResponse, error) {
	alerts, err := c.GetAlerts(&models.AlertFilter{Status: "all"})
	if err != nil {
		return nil, err
	}

	groups := make(map[string][]models.AlertSummary)

	for _, alert := range alerts.Alerts {
		groupKey := alert.Labels[groupLabel]
		if groupKey == "" {
			groupKey = "ungrouped"
		}
		groups[groupKey] = append(groups[groupKey], alert)
	}

	return &models.AlertGroupsResponse{
		Groups: groups,
		Total:  len(alerts.Alerts),
	}, nil
}

// Health checks if AlertManager is reachable
func (c *Client) Health() (*models.HealthResponse, error) {
	endpoint := fmt.Sprintf("%s/api/v2/alerts", c.baseURL)

	resp, err := c.client.Get(endpoint)
	if err != nil {
		return &models.HealthResponse{
			AlertManagerURL: c.baseURL,
			Status:          "unreachable",
			Message:         err.Error(),
			LastCheck:       time.Now(),
		}, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		return &models.HealthResponse{
			AlertManagerURL: c.baseURL,
			Status:          "healthy",
			Message:         "AlertManager is healthy",
			LastCheck:       time.Now(),
		}, nil
	}

	return &models.HealthResponse{
		AlertManagerURL: c.baseURL,
		Status:          "unreachable",
		Message:         fmt.Sprintf("AlertManager returned status %d", resp.StatusCode),
		LastCheck:       time.Now(),
	}, nil
}

// convertAlerts converts AlertManager alerts to our model and applies filtering
func (c *Client) convertAlerts(amAlerts []*amAlert.GettableAlert, filter *models.AlertFilter) []models.AlertSummary {
	var results []models.AlertSummary

	for _, alert := range amAlerts {
		// Filter by status
		status := string(alert.Status)
		if filter.Status != "" && filter.Status != "all" && status != filter.Status {
			continue
		}

		// Filter by severity
		severity := ""
		if sev, exists := alert.Labels["severity"]; exists {
			severity = sev
		}
		if filter.Severity != "" && severity != filter.Severity {
			continue
		}

		// Filter by group
		if filter.Group != "" {
			if groupVal, exists := alert.Labels["group"]; !exists || groupVal != filter.Group {
				continue
			}
		}

		// Filter by search term
		if filter.SearchTerm != "" {
			summary := alert.Annotations["summary"]
			desc := alert.Annotations["description"]
			if summary+desc == "" || !contains(summary+desc, filter.SearchTerm) {
				continue
			}
		}

		// Build summary
		summary := models.AlertSummary{
			ID:          alert.Fingerprint,
			Status:      status,
			Severity:    severity,
			Summary:     alert.Annotations["summary"],
			Description: alert.Annotations["description"],
			Labels:      alert.Labels,
			StartsAt:    time.Time(*alert.StartsAt),
			UpdatedAt:   time.Now(),
		}

		// Extract group
		if groupVal, exists := alert.Labels["group"]; exists {
			summary.Group = groupVal
		}

		results = append(results, summary)
	}

	// Apply limit and offset
	if filter.Limit <= 0 {
		filter.Limit = 100
	}
	start := filter.Offset
	end := start + filter.Limit
	if end > len(results) {
		end = len(results)
	}
	if start > len(results) {
		return []models.AlertSummary{}
	}

	return results[start:end]
}

// Helper function for search
func contains(s, substr string) bool {
	return len(s) > 0 && len(substr) > 0 && (s == substr || (len(s) > len(substr) && s[:len(substr)] == substr))
}
