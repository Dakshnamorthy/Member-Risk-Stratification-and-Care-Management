/**
 * CareGuard AI – Route Configuration
 *
 * Maps route paths to page components.
 * Pages are lazy-loaded for code splitting.
 */

import { lazy } from 'react';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Members = lazy(() => import('../pages/Members'));
const MemberDetail = lazy(() => import('../pages/MemberDetail'));
const RiskStratification = lazy(() => import('../pages/RiskStratification'));
const Alerts = lazy(() => import('../pages/Alerts'));
const CarePlans = lazy(() => import('../pages/CarePlans'));
const Interventions = lazy(() => import('../pages/Interventions'));
const Analytics = lazy(() => import('../pages/Analytics'));
const ROI = lazy(() => import('../pages/ROI'));
const Reports = lazy(() => import('../pages/Reports'));
const Compliance = lazy(() => import('../pages/Compliance'));
const SettingsPage = lazy(() => import('../pages/Settings'));
const Help = lazy(() => import('../pages/Help'));
const Prediction = lazy(() => import('../pages/Prediction'));

export const routes = [
  { path: '/', element: Dashboard, title: 'Dashboard', breadcrumb: 'Overview' },
  { path: '/members', element: Members, title: 'Member Registry', breadcrumb: 'Members' },
  { path: '/members/:memberId', element: MemberDetail, title: 'Member Details', breadcrumb: 'Members' },
  { path: '/risk-stratification', element: RiskStratification, title: 'Risk Stratification', breadcrumb: 'Risk' },
  { path: '/prediction', element: Prediction, title: 'ML Prediction', breadcrumb: 'Analytics' },
  { path: '/alerts', element: Alerts, title: 'Alert Center', breadcrumb: 'Operations' },
  { path: '/care-plans', element: CarePlans, title: 'Care Plans', breadcrumb: 'Care Management' },
  { path: '/interventions', element: Interventions, title: 'Interventions', breadcrumb: 'Care Management' },
  { path: '/analytics', element: Analytics, title: 'Risk Analytics', breadcrumb: 'Analytics' },
  { path: '/roi', element: ROI, title: 'ROI Dashboard', breadcrumb: 'Analytics' },
  { path: '/reports', element: Reports, title: 'Reports', breadcrumb: 'Analytics' },
  { path: '/compliance', element: Compliance, title: 'Compliance', breadcrumb: 'System' },
  { path: '/settings', element: SettingsPage, title: 'Settings', breadcrumb: 'System' },
  { path: '/help', element: Help, title: 'Help & Support', breadcrumb: 'System' },
];
