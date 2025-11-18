.PHONY: help build run test clean docker-build docker-push fmt lint

# Variables
BINARY_NAME=grafana-all-in-one-plugin-app
VERSION=$(shell git describe --tags --always --dirty)
BUILD_TIME=$(shell date -u '+%Y-%m-%d_%H:%M:%S')
GIT_COMMIT=$(shell git rev-parse --short HEAD)
LDFLAGS=-ldflags "-X main.Version=$(VERSION) -X main.BuildTime=$(BUILD_TIME) -X main.GitCommit=$(GIT_COMMIT)"

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod

# Directories
ROOT_DIR=$(shell pwd)
BIN_DIR=$(ROOT_DIR)/bin

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

deps: ## Download dependencies
	$(GOMOD) download
	$(GOMOD) tidy

build: ## Build the plugin backend
	mkdir -p $(BIN_DIR)
	$(GOBUILD) -o $(BIN_DIR)/$(BINARY_NAME) $(LDFLAGS) -v ./pkg

run: build ## Build and run the plugin backend
	./$(BIN_DIR)/$(BINARY_NAME)

dev: ## Run in development mode with hot reload
	@command -v air >/dev/null 2>&1 || (echo "Installing air..." && go install github.com/cosmtrek/air@latest)
	air

test: ## Run tests
	$(GOTEST) -v -race -coverprofile=coverage.out ./...
	$(GOTEST) -html=coverage.out -o coverage.html ./...

test-coverage: test ## Run tests and display coverage
	go tool cover -html=coverage.out

lint: ## Run golangci-lint
	@command -v golangci-lint >/dev/null 2>&1 || (echo "Installing golangci-lint..." && go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest)
	golangci-lint run ./...

fmt: ## Format code
	$(GOCMD) fmt ./...
	@command -v goimports >/dev/null 2>&1 || (echo "Installing goimports..." && go install golang.org/x/tools/cmd/goimports@latest)
	goimports -w .

vet: ## Run go vet
	$(GOCMD) vet ./...

clean: ## Clean build artifacts
	$(GOCLEAN)
	rm -rf $(BIN_DIR)
	rm -f coverage.out coverage.html

docker-build: ## Build Docker image
	docker build -t grafana-alert-plugin:$(VERSION) -f Dockerfile .
	docker tag grafana-alert-plugin:$(VERSION) grafana-alert-plugin:latest

docker-run: docker-build ## Build and run Docker container
	docker run -p 8080:8080 \
		-e ALERTMANAGER_URL=http://localhost:9093 \
		-e GRAFANA_URL=http://localhost:3000 \
		-e LOG_LEVEL=info \
		grafana-alert-plugin:$(VERSION)

docker-push: docker-build ## Push Docker image to registry
	docker push grafana-alert-plugin:$(VERSION)
	docker push grafana-alert-plugin:latest

all: clean deps lint test build ## Clean, download deps, lint, test, and build

.DEFAULT_GOAL := help
