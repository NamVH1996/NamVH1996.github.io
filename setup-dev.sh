#!/bin/bash

# All-in-One Grafana Plugin - Development Setup Script
# This script sets up everything needed to develop the plugin locally

set -e

echo "🚀 All-in-One Grafana Plugin - Dev Setup"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node version
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js not found. Please install Node.js 18+${NC}"
    echo "   Visit: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}❌ npm not found${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"

# Check Go
if ! command -v go &> /dev/null; then
    echo -e "${YELLOW}⚠️  Go not found. Backend won't run (optional)${NC}"
else
    GO_VERSION=$(go version | awk '{print $3}')
    echo -e "${GREEN}✓ Go ${GO_VERSION}${NC}"
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Can't use docker-compose (optional)${NC}"
else
    echo -e "${GREEN}✓ Docker installed${NC}"
fi

echo ""
echo -e "${BLUE}Step 1: Installing dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo -e "${BLUE}Step 2: Building frontend...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

echo ""
echo -e "${BLUE}Step 3: Verifying Go backend...${NC}"
go build -o ./plugin ./pkg 2>/dev/null && echo -e "${GREEN}✓ Backend compiles${NC}" || echo -e "${YELLOW}⚠️  Backend build skipped${NC}"

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. ${YELLOW}Start the backend:${NC}"
echo "   go run ./pkg/main.go"
echo ""
echo "2. ${YELLOW}Watch frontend (new terminal):${NC}"
echo "   npm run dev"
echo ""
echo "3. ${YELLOW}Start Grafana (new terminal):${NC}"
echo "   docker-compose up -d"
echo ""
echo "4. ${YELLOW}Open Grafana:${NC}"
echo "   http://localhost:3000"
echo "   (admin / admin)"
echo ""
echo "5. ${YELLOW}Enable plugin:${NC}"
echo "   Admin → Plugins → All-in-One → Enable"
echo ""
echo "📖 For detailed guide:"
echo "   cat DEV_GUIDE.md"
echo ""
