import { AppPlugin } from '@grafana/data';
import { AppPage } from './pages/AppPage';
import { DashboardsPage } from './pages/DashboardsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AlertsManagementPage } from './pages/AlertsManagementPage';
import { ContactPointsPage } from './pages/ContactPointsPage';
import { DataEnrichmentPage } from './pages/DataEnrichmentPage';

export const plugin = new AppPlugin<{}>()
  .addPage({
    path: '/a/all-in-one-app',
    title: 'All-in-One Dashboard',
    component: AppPage
  })
  .addPage({
    path: '/a/all-in-one-app/alerts',
    title: 'Alert Management',
    component: AlertsManagementPage
  })
  .addPage({
    path: '/a/all-in-one-app/contact-points',
    title: 'Contact Points',
    component: ContactPointsPage
  })
  .addPage({
    path: '/a/all-in-one-app/data-enrichment',
    title: 'Data Enrichment',
    component: DataEnrichmentPage
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
