# All-in-One Grafana Plugin - Setup Guide

## 📋 Project Overview

This is a **Grafana Plugin App** designed for unified monitoring and visualization of all your services and metrics in a single platform, eliminating the need for multiple monitoring systems.

### Key Features:
- ✅ **All-in-One Dashboard** - Centralized monitoring for all services
- ✅ **Health Status Monitoring** - Real-time service health checks
- ✅ **Alerts Management** - Active alerts display and acknowledgment
- ✅ **Metrics Visualization** - Time-series metrics display
- ✅ **Custom Dashboards** - Create and manage multiple dashboards
- ✅ **API Integration Ready** - Pre-built API client structure for Swagger integration

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Plugin

```bash
npm run build
```

### 3. Development Mode

Watch for changes and rebuild automatically:

```bash
npm run dev
```

### 4. Install in Grafana

1. Copy the `dist` folder to your Grafana plugins directory:
   ```bash
   cp -r dist /var/lib/grafana/plugins/all-in-one-app
   ```

2. Restart Grafana:
   ```bash
   sudo systemctl restart grafana-server
   ```

3. Enable the plugin in Grafana:
   - Go to **Configuration → Plugins**
   - Find "All-in-One Monitoring App"
   - Click "Enable"

## 🔌 API Integration (Swagger)

When you have your Swagger file ready:

### 1. Import Your Swagger Definition

Update the API service files in `src/api/services.ts`:

```typescript
// Example: Add your API endpoints based on Swagger definition
export const yourNewService = {
  async getYourData(): Promise<YourDataType> {
    return apiClient.get<YourDataType>('/api/your-endpoint');
  }
};
```

### 2. Configure API Settings

1. Open the plugin in Grafana
2. Go to **Settings** tab
3. Enter your API endpoint URL
4. Enter your API Key
5. Click **Save Settings**

### 3. Update Dashboard Components

Modify the components in `src/components/` to use your new API endpoints:

- `MetricsPanel.tsx` - Display your metrics
- `HealthStatusPanel.tsx` - Show service health
- `AlertsPanel.tsx` - Display alerts

## 📁 Project Structure

```
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios-based API client
│   │   └── services.ts        # Service definitions (Update here with Swagger)
│   ├── pages/
│   │   ├── AppPage.tsx        # Main dashboard page
│   │   ├── DashboardsPage.tsx # Dashboards management
│   │   └── SettingsPage.tsx   # Configuration page
│   ├── components/
│   │   ├── MetricsPanel.tsx   # Metrics display
│   │   ├── HealthStatusPanel.tsx # Service health
│   │   └── AlertsPanel.tsx    # Alerts display
│   ├── module.ts              # Plugin entry point
│   └── plugin.json            # Plugin manifest
├── package.json               # Dependencies
├── tsconfig.json             # TypeScript config
├── webpack.config.js         # Build config
└── dist/                      # Built plugin (generated)
```

## 🛠️ Development Workflow

### 1. Run Development Server
```bash
npm run dev
```

### 2. Make Changes
- Edit your React components in `src/`
- Changes are automatically recompiled

### 3. Format & Lint
```bash
npm run format
npm run lint
```

### 4. Build for Production
```bash
npm run build
```

## 🔗 Next Steps

1. **Get your Swagger file** - Prepare your API definition
2. **Update services.ts** - Add your API endpoints based on Swagger
3. **Configure settings** - Add your API URL and key in the plugin settings
4. **Customize components** - Modify dashboard components to match your data
5. **Test integration** - Verify API calls and data display

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch and rebuild on changes |
| `npm run build` | Build for production |
| `npm run test` | Run tests |
| `npm run lint` | Check code style |
| `npm run format` | Format code with Prettier |
| `npm run sign` | Sign plugin for Grafana registry |

## 🔐 Environment Variables

Create a `.env` file for sensitive configuration:

```
API_URL=https://api.example.com
API_KEY=your-api-key-here
GRAFANA_URL=http://localhost:3000
```

## 📚 Grafana Plugin Documentation

- [Grafana Plugin Development](https://grafana.com/docs/grafana/latest/developers/plugins/)
- [Grafana App Plugins](https://grafana.com/docs/grafana/latest/developers/plugins/apps/)
- [Grafana UI Components](https://grafana.com/docs/grafana/latest/packages_api/ui/)

## 🐛 Troubleshooting

### Plugin not appearing in Grafana
- Ensure dist folder is in the correct plugins directory
- Check Grafana logs: `journalctl -u grafana-server -f`

### API connection errors
- Verify API URL and key in Settings
- Check CORS settings on your API server
- Check browser console for detailed error messages

### Build errors
- Delete `node_modules` and `dist` folders
- Run `npm install` again
- Clear webpack cache: `rm -rf .webpack`

## 📦 Ready for Swagger Integration

This plugin is fully prepared for Swagger/OpenAPI integration. Once you have your Swagger file:

1. Review the API structure in `src/api/services.ts`
2. Add your endpoints based on Swagger definitions
3. Update component data binding
4. Test with your actual API

---

**Let's build the ultimate monitoring dashboard! 🚀**
