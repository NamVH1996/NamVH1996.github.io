# All-in-One Grafana Monitoring Plugin

> **Unified monitoring dashboard** - Consolidate all your services, metrics, and alerts into a single Grafana plugin

## 🎯 What This Project Does

This is a complete **Grafana App Plugin** that provides:
- **Unified Dashboard** - Monitor all services in one place
- **Real-time Health Status** - Track service health at a glance
- **Alert Management** - View and acknowledge alerts
- **Metrics Visualization** - Display time-series metrics data
- **Customizable Dashboards** - Create multiple dashboard views
- **API Integration Ready** - Pre-configured for Swagger/OpenAPI integration

## ✨ Why Use This Instead of Multiple Systems?

Instead of managing multiple monitoring tools (Prometheus, Datadog, New Relic, etc.), this plugin provides an **all-in-one solution** directly in Grafana, eliminating context switching and system complexity.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build the plugin
npm run build

# 3. Copy to Grafana plugins directory
cp -r dist /var/lib/grafana/plugins/all-in-one-app

# 4. Restart Grafana and enable the plugin
sudo systemctl restart grafana-server
```

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## 📦 Ready for Swagger Integration

This plugin is fully prepared for Swagger/OpenAPI integration. When you're ready to integrate your API:

1. Place your Swagger/OpenAPI file in the project
2. Update `src/api/services.ts` with your endpoints
3. Configure API settings in the plugin UI
4. Your data will be immediately available in the dashboard

See [SETUP.md](./SETUP.md) for detailed Swagger integration guide.

## 📋 Project Structure

- **src/api/** - API client and service definitions
- **src/pages/** - Dashboard pages (Main, Dashboards, Settings)
- **src/components/** - Reusable UI components
- **src/plugin.json** - Grafana plugin manifest
- **webpack.config.js** - Build configuration

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Complete setup and integration guide
- [Grafana Plugin Docs](https://grafana.com/docs/grafana/latest/developers/plugins/)