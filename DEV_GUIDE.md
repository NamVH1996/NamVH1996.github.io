# Development Guide

Complete guide for developing and testing the All-in-One Grafana Plugin locally.

## 📋 Prerequisites

- **Node.js 18+** (use `nvm use 18` or check `.nvmrc`)
- **Go 1.21+**
- **Docker** (optional, for full stack testing)
- **Git**

## 🚀 Quick Dev Setup

### 1. Install Dependencies

```bash
# Install Node packages
nvm use 18  # or specific version in .nvmrc
npm install --legacy-peer-deps
```

### 2. Build Frontend (First Time)

```bash
npm run build
```

### 3. Start Backend

```bash
# Terminal 1: Start Go backend
go run ./pkg/main.go
```

Backend will run on: **http://localhost:8080**

### 4. Start Frontend (Watch Mode)

```bash
# Terminal 2: Watch frontend changes
npm run dev
```

This will rebuild on any file changes in `src/`

### 5. Launch Grafana with Plugin

```bash
# Terminal 3: Docker Compose
docker-compose up -d
```

Or if you have local Grafana:

```bash
# Copy dist folder to Grafana plugins
cp -r dist /var/lib/grafana/plugins/all-in-one-app

# Restart Grafana
docker restart grafana  # if Docker
# or
sudo systemctl restart grafana-server  # if local
```

### 6. Access Grafana

```
http://localhost:3000
```

**Default credentials:**
- Username: `admin`
- Password: `admin`

### 7. Enable Plugin

1. Click **Gear icon** (Admin)
2. Go to **Plugins** → **All-in-One Monitoring App**
3. Click **Enable**
4. Go to **Administration** → **All-in-One Monitoring App**

## 🛠️ Development Workflow

### Terminal Setup (Recommended)

```bash
# Terminal 1: Frontend watcher
npm run dev

# Terminal 2: Backend
go run ./pkg/main.go

# Terminal 3: Docker (if using)
docker-compose up

# Terminal 4: Editor/IDE
code .  # or your editor
```

### Making Changes

#### Frontend Changes

1. Edit files in `src/pages/`, `src/components/`, or `src/api/`
2. Changes auto-compile via webpack watcher
3. Hard-refresh browser (Ctrl+Shift+R) to see changes

#### Backend Changes

1. Edit files in `pkg/`
2. Backend will hot-reload (if using `go run`)
3. Or restart: `go run ./pkg/main.go`

#### Adding New API Endpoints

1. **Backend**: Add handler in `pkg/api/`
2. **Frontend**: Add service in `src/api/swagger.ts`
3. **Components**: Use service in React pages
4. **Test**: Check browser console for API calls

## 📚 Available Commands

### Frontend

```bash
npm run dev              # Watch and rebuild (development)
npm run build           # Production build
npm run build:watch     # Same as dev
npm run test            # Run tests
npm run test:watch      # Watch test mode
npm run lint            # Check code quality
npm run lint:fix        # Auto-fix lint issues
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
npm run typecheck       # TypeScript type checking
npm run plugin:dev      # Plugin development mode
npm run plugin:build    # Production plugin build
```

### Backend

```bash
go run ./pkg            # Run with hot reload
go build ./pkg          # Build binary
go test ./pkg/...       # Run tests
```

### Docker

```bash
docker-compose up -d    # Start all services
docker-compose down     # Stop all services
docker-compose logs     # View logs
docker-compose ps       # View running services
```

## 🔍 Debugging

### Browser Developer Tools

1. Open **F12** in Grafana
2. Go to **Console** tab
3. Check for API errors
4. Network tab shows API calls to backend

### Backend Logs

```bash
# Terminal running backend
# Logs display in terminal

# Or check Docker logs
docker logs plugin-backend
```

### API Testing

```bash
# Test backend health
curl http://localhost:8080/api/health

# Test frontend build
curl http://localhost:3000
```

## 🐛 Troubleshooting

### Plugin not showing in Grafana

1. Check if dist folder built:
   ```bash
   ls -la dist/
   ```

2. Rebuild:
   ```bash
   npm run build
   ```

3. Copy to Grafana (if local):
   ```bash
   cp -r dist /var/lib/grafana/plugins/all-in-one-app
   docker restart grafana
   ```

4. Check Grafana logs:
   ```bash
   docker logs grafana
   ```

### Backend API not responding

1. Check if running:
   ```bash
   curl http://localhost:8080/api/health
   ```

2. Check logs for errors

3. Restart backend:
   ```bash
   # Kill current process
   # Run again: go run ./pkg
   ```

### Frontend build failing

1. Clean and rebuild:
   ```bash
   rm -rf node_modules dist
   npm install --legacy-peer-deps
   npm run build
   ```

2. Check Node version:
   ```bash
   node --version  # Should be 18+
   ```

### Docker issues

1. Check running services:
   ```bash
   docker-compose ps
   ```

2. View logs:
   ```bash
   docker-compose logs -f
   ```

3. Rebuild images:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

## 📝 Code Style

### Format Code

```bash
npm run format
```

### Check Lint

```bash
npm run lint
npm run lint:fix  # Auto-fix
```

### Type Check

```bash
npm run typecheck
```

## 🧪 Testing

### Run Frontend Tests

```bash
npm test
npm test:watch  # Watch mode
```

### Run Backend Tests

```bash
go test ./pkg/... -v
```

## 📦 Building for Production

### Frontend

```bash
npm run build
```

Output in `dist/` folder

### Backend

```bash
go build -o plugin ./pkg
```

Binary created as `plugin`

### Docker

```bash
docker-compose build
docker-compose up -d
```

## 🔗 Useful Links

- **Grafana Docs**: https://grafana.com/docs/
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Go Docs**: https://golang.org/doc

## 💡 Tips

1. **Use nvm for Node version management**
   ```bash
   nvm install 18
   nvm use 18
   ```

2. **Clean install when dependencies break**
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

3. **Check Grafana logs for plugin issues**
   ```bash
   docker logs grafana | grep -i error
   ```

4. **Use VS Code extension for Prettier**
   - Install: "Prettier - Code formatter"
   - Format on save: `"editor.formatOnSave": true`

5. **Debug frontend in Chrome DevTools**
   - Open DevTools (F12)
   - Check Network tab for API calls
   - Use Console for errors

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes with proper formatting
3. Run tests: `npm test`
4. Commit with clear message: `git commit -m "Add your feature"`
5. Push and create PR

## 📋 Checklist Before Committing

- [ ] Code formatted: `npm run format`
- [ ] No lint errors: `npm run lint`
- [ ] Type checks pass: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] Backend builds: `go build ./pkg`
- [ ] Tests pass (if applicable)
- [ ] Commit message is clear
