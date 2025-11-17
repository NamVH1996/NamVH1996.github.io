package config

import (
	"os"
	"strconv"

	log "github.com/sirupsen/logrus"
)

// Config holds the application configuration
type Config struct {
	// Server configuration
	Port              int
	Host              string
	GrafanaURL        string

	// AlertManager configuration
	AlertManagerURL   string

	// Logging configuration
	LogLevel          string

	// Plugin configuration
	PluginID          string
	PluginVersion     string
}

// Load loads configuration from environment variables
func Load() *Config {
	cfg := &Config{
		Port:              getIntEnv("PORT", 8080),
		Host:              getStringEnv("HOST", "0.0.0.0"),
		GrafanaURL:        getStringEnv("GRAFANA_URL", "http://localhost:3000"),
		AlertManagerURL:   getStringEnv("ALERTMANAGER_URL", "http://localhost:9093"),
		LogLevel:          getStringEnv("LOG_LEVEL", "info"),
		PluginID:          "all-in-one-app",
		PluginVersion:     "1.0.0",
	}

	return cfg
}

// Helper functions to read environment variables

func getStringEnv(key, defaultVal string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	return val
}

func getIntEnv(key string, defaultVal int) int {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}

	intVal, err := strconv.Atoi(val)
	if err != nil {
		log.WithField("key", key).Warnf("Invalid integer value for %s, using default %d", key, defaultVal)
		return defaultVal
	}

	return intVal
}

// Validate validates the configuration
func (c *Config) Validate() error {
	if c.AlertManagerURL == "" {
		log.Warn("AlertManagerURL is not set, alerts will not be available")
	}

	return nil
}

// LogConfiguration logs the current configuration
func (c *Config) LogConfiguration() {
	log.WithFields(log.Fields{
		"port":                 c.Port,
		"host":                 c.Host,
		"grafana_url":          c.GrafanaURL,
		"alertmanager_url":     c.AlertManagerURL,
		"log_level":            c.LogLevel,
		"plugin_id":            c.PluginID,
		"plugin_version":       c.PluginVersion,
	}).Info("Configuration loaded")
}
