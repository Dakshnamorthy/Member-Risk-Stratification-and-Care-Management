const MOCK_ALERTS = [
  {
    id: 'alert-001',
    type: 'Risk increased',
    severity: 'critical',
    memberId: 'M-0048',
    memberName: 'James Rodriguez',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    description: 'Member risk score increased by 28 points in the last 7 days. Recent hospitalization may indicate acute condition.',
    status: 'unresolved',
    actionUrl: '/members/M-0048',
    actionLabel: 'Review Member',
  },
  {
    id: 'alert-002',
    type: 'Follow-up overdue',
    severity: 'high',
    memberId: 'M-0091',
    memberName: 'Sarah Chen',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
    description: 'Scheduled follow-up call was missed 2 days ago. Member needs care plan check-in.',
    status: 'unresolved',
    actionUrl: '/members/M-0091',
    actionLabel: 'Review Member',
  },
  {
    id: 'alert-003',
    type: 'Intervention due',
    severity: 'high',
    memberId: 'M-0075',
    memberName: 'Michael Thompson',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    description: 'Chronic condition coaching intervention is due today. Member has not yet engaged.',
    status: 'unresolved',
    actionUrl: '/members/M-0075',
    actionLabel: 'Assign Intervention',
  },
  {
    id: 'alert-004',
    type: 'Risk tier changed',
    severity: 'medium',
    memberId: 'M-0112',
    memberName: 'Patricia Williams',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    description: 'Member risk tier changed from medium to high based on recent care patterns and risk model update.',
    status: 'unresolved',
    actionUrl: '/members/M-0112',
    actionLabel: 'View Changes',
  },
  {
    id: 'alert-005',
    type: 'Intervention completed',
    severity: 'low',
    memberId: 'M-0062',
    memberName: 'David Martinez',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    description: 'Transitions of care intervention completed successfully. Member engagement was high.',
    status: 'resolved',
    actionUrl: '/members/M-0062',
    actionLabel: 'View Outcomes',
  },
  {
    id: 'alert-006',
    type: 'New high-risk member',
    severity: 'critical',
    memberId: 'M-0156',
    memberName: 'Linda Brown',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    description: 'New member flagged as high-risk during intake screening. Immediate care plan initiation recommended.',
    status: 'unresolved',
    actionUrl: '/members/M-0156',
    actionLabel: 'Create Care Plan',
  },
  {
    id: 'alert-007',
    type: 'Follow-up overdue',
    severity: 'medium',
    memberId: 'M-0089',
    memberName: 'Robert Garcia',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    description: 'Preventive care screening follow-up is overdue by 1 day. Schedule next appointment.',
    status: 'resolved',
    actionUrl: '/members/M-0089',
    actionLabel: 'View Schedule',
  },
  {
    id: 'alert-008',
    type: 'Risk increased',
    severity: 'high',
    memberId: 'M-0103',
    memberName: 'Jennifer Lee',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    description: 'Risk indicator score increased due to medication non-adherence patterns detected in recent claims.',
    status: 'unresolved',
    actionUrl: '/members/M-0103',
    actionLabel: 'Review Member',
  },
];

export async function fetchAlerts(filterStatus = 'all') {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = MOCK_ALERTS;
      if (filterStatus !== 'all') {
        filtered = filtered.filter((alert) => alert.status === filterStatus);
      }
      resolve(filtered);
    }, 100);
  });
}

export async function fetchAlertsBySeverity(severity) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = MOCK_ALERTS.filter((alert) => alert.severity === severity);
      resolve(filtered);
    }, 100);
  });
}

export async function updateAlertStatus(alertId, newStatus) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const alert = MOCK_ALERTS.find((a) => a.id === alertId);
      if (alert) {
        alert.status = newStatus;
      }
      resolve(alert);
    }, 100);
  });
}

export async function dismissAlert(alertId) {
  return updateAlertStatus(alertId, 'resolved');
}
