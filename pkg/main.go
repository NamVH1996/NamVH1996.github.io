package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/NamVH1996/grafana-alert-plugin/pkg/alertmanager"
	"github.com/NamVH1996/grafana-alert-plugin/pkg/api"
	"github.com/NamVH1996/grafana-alert-plugin/pkg/config"
	"github.com/NamVH1996/grafana-alert-plugin/pkg/storage"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
)

func main() {
	// Load configuration
	cfg := config.Load()
	cfg.LogConfiguration()

	// Setup logging
	initLogging(cfg.LogLevel)

	log.Info("Starting Grafana Alert Plugin backend...")

	// Create AlertManager client
	amClient := alertmanager.NewClient(cfg.AlertManagerURL)

	// Check AlertManager health
	health, err := amClient.Health()
	if err != nil {
		log.WithError(err).Warn("Failed to check AlertManager health")
	} else {
		log.WithFields(log.Fields{
			"status":  health.Status,
			"message": health.Message,
		}).Info("AlertManager health check")
	}

	// Setup HTTP server
	router := mux.NewRouter()

	// Apply middlewares
	router.Use(api.LoggingMiddleware)
	router.Use(api.CORSMiddleware)
	router.Use(api.RecoveryMiddleware)

	// Setup storage
	store := storage.NewInMemoryStorage()

	// Setup API handlers
	handler := api.NewHandler(amClient)
	handler.RegisterRoutes(router)

	// Setup Swagger handlers
	swaggerHandler := api.NewSwaggerHandler(store)
	swaggerHandler.RegisterSwaggerRoutes(router)

	// Start server
	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	server := &http.Server{
		Addr:           addr,
		Handler:        router,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	// Start server in a goroutine
	go func() {
		log.WithField("address", addr).Info("Server starting")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.WithError(err).Fatal("Server error")
		}
	}()

	// Wait for interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	log.Info("Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.WithError(err).Error("Server shutdown error")
	}

	log.Info("Server stopped")
}

// initLogging initializes the logger
func initLogging(level string) {
	log.SetFormatter(&log.JSONFormatter{
		TimestampFormat: time.RFC3339,
	})

	logLevel, err := log.ParseLevel(level)
	if err != nil {
		logLevel = log.InfoLevel
	}
	log.SetLevel(logLevel)
	log.SetOutput(os.Stdout)

	log.WithField("level", logLevel).Info("Logging initialized")
}
