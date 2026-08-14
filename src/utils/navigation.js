/**
 * CareGuard AI – Navigation Configuration
 *
 * Centralised navigation items for the sidebar.
 * Each item maps to a route and an icon name from Lucide.
 */

import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Bell,
  ClipboardList,
  TrendingUp,
  FileText,
  Settings,
  HelpCircle,
  Activity,
  Target,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

export const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
      },
      {
        id: 'members',
        label: 'Member Registry',
        path: '/members',
        icon: Users,
      },
      {
        id: 'risk-stratification',
        label: 'Risk Stratification',
        path: '/risk-stratification',
        icon: AlertTriangle,
        badge: 'ML',
      },
      {
        id: 'alerts',
        label: 'Alert Center',
        path: '/alerts',
        icon: Bell,
        badge: 'Ops',
      },
    ],
  },
  {
    label: 'Care Management',
    items: [
      {
        id: 'care-plans',
        label: 'Care Plans',
        path: '/care-plans',
        icon: ClipboardList,
      },
      {
        id: 'interventions',
        label: 'Interventions',
        path: '/interventions',
        icon: Target,
      },
    ],
  },
  {
    label: 'Analytics',
    items: [
      {
        id: 'analytics',
        label: 'Risk Analytics',
        path: '/analytics',
        icon: BarChart3,
      },
      {
        id: 'roi',
        label: 'ROI Dashboard',
        path: '/roi',
        icon: TrendingUp,
      },
      {
        id: 'reports',
        label: 'Reports',
        path: '/reports',
        icon: FileText,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        id: 'compliance',
        label: 'Compliance',
        path: '/compliance',
        icon: ShieldCheck,
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: Settings,
      },
      {
        id: 'help',
        label: 'Help & Support',
        path: '/help',
        icon: HelpCircle,
      },
    ],
  },
];
