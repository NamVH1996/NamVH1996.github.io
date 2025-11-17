import { AppPlugin } from '@grafana/data';
import { AppPage } from './pages/AppPage';
import { DashboardsPage } from './pages/DashboardsPage';
import { SettingsPage } from './pages/SettingsPage';

export const plugin = new AppPlugin<{}>()
  .addPage({
    path: '/a/all-in-one-app',
    title: 'All-in-One Dashboard',
    component: AppPage
  })
  .addPage({
    path: '/a/all-in-one-app/dashboards',
    title: 'Dashboards',
    component: DashboardsPage
  })
  .addPage({
    path: '/a/all-in-one-app/settings',
    title: 'Settings',
    component: SettingsPage
  });
