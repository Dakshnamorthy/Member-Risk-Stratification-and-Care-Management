export function formatAlertTime(timestamp) {
  if (!timestamp) return '—';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getSeverityClass(severity) {
  const severityMap = {
    critical: 'alert-severity--critical',
    high: 'alert-severity--high',
    medium: 'alert-severity--medium',
    low: 'alert-severity--low',
  };
  return severityMap[severity] || 'alert-severity--medium';
}

export function getSeverityLabel(severity) {
  const labelMap = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return labelMap[severity] || 'Unknown';
}

export function getAlertTypeIcon(type) {
  const iconMap = {
    'Risk increased': '⚠️',
    'New high-risk member': '🚨',
    'Follow-up overdue': '⏰',
    'Intervention due': '📋',
    'Intervention completed': '✅',
    'Risk tier changed': '📊',
  };
  return iconMap[type] || '📌';
}

export function filterAlertsByStatus(alerts, status) {
  if (status === 'all') return alerts;
  return alerts.filter((alert) => alert.status === status);
}

export function filterAlertsBySeverity(alerts, severity) {
  if (severity === 'all') return alerts;

  const severityOrder = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  if (severity === 'critical') {
    return alerts.filter((alert) => alert.severity === 'critical');
  }

  return alerts.filter((alert) => severityOrder[alert.severity] >= severityOrder[severity]);
}

export function getSortedAlerts(alerts, sortBy = 'timestamp-desc') {
  const sorted = [...alerts];

  if (sortBy === 'timestamp-desc') {
    sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } else if (sortBy === 'severity-desc') {
    const order = { critical: 4, high: 3, medium: 2, low: 1 };
    sorted.sort((a, b) => order[b.severity] - order[a.severity]);
  }

  return sorted;
}

export function getAlertStats(alerts) {
  return {
    total: alerts.length,
    unresolved: alerts.filter((a) => a.status === 'unresolved').length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    medium: alerts.filter((a) => a.severity === 'medium').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
  };
}
