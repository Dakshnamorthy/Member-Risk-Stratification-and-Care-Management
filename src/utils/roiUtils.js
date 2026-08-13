export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }

  const sign = value < 0 ? '−' : '';
  return `${sign}${Math.abs(value).toFixed(0)}%`;
}

export function calculateNetSavings(costAvoided, interventionCost) {
  const avoided = Number(costAvoided) || 0;
  const cost = Number(interventionCost) || 0;
  return avoided - cost;
}

export function calculateRoi(costAvoided, interventionCost) {
  const netSavings = calculateNetSavings(costAvoided, interventionCost);
  const cost = Number(interventionCost) || 0;
  if (cost === 0) {
    return null;
  }

  return (netSavings / cost) * 100;
}

export function roiStatus(percentage) {
  if (percentage === null || percentage === undefined || Number.isNaN(percentage)) {
    return 'Unavailable';
  }

  if (percentage >= 20) {
    return 'Strong';
  }

  if (percentage >= 0) {
    return 'Moderate';
  }

  return 'Negative';
}
