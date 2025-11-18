# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-18

### Added

- Initial release of All-in-One Grafana Monitoring Plugin
- **Frontend (React/TypeScript)**
  - Alert Management page with filtering, pagination, and detail view
  - Contact Points management with CRUD operations
  - Data Enrichment page with VM Mappings, Escalation Mappings, and Extraction Rules
  - Dashboard home page with navigation
  - Settings page for API configuration
  - Custom components for metrics, health status, and alerts display
  - Full Grafana UI integration

- **Backend (Go)**
  - REST API for alert management
  - In-memory storage with thread-safe operations
  - Contact points routing configuration
  - Data enrichment rules (VM mappings, escalation, extraction)
  - Health check and ping endpoints
  - Comprehensive error handling and logging
  - CORS support for frontend communication

- **DevOps**
  - Docker & Docker Compose setup
  - Multi-stage Dockerfile for optimized builds
  - Proper plugin structure following Grafana standards
  - GitHub Actions CI/CD pipeline (basic)

### Changed

- Updated dependencies to latest stable versions
  - Grafana 11.0.0
  - React 18.3.1
  - TypeScript 5.6.2
  - Go 1.21

### Fixed

- Go backend compilation issues
- Removed Prometheus dependency conflicts
- Fixed duplicate model definitions
- Proper Docker mounting of plugin files

## [0.9.0] - 2024-11-17

### Added

- Backend API endpoints implementation
- Frontend UI pages for 3 main features
- Webpack configuration for frontend bundling
- TypeScript API client for backend communication

### Changed

- Refactored to Grafana official template structure
- Removed unnecessary AlertManager service from docker-compose

## [0.8.0] - 2024-11-16

### Added

- Initial project setup
- Go backend with basic structure
- React frontend with page framework
- Docker support

### Removed

- Removed Prometheus (unnecessary for requirements)
- Removed separate backend folder (integrated at root per Grafana standard)
