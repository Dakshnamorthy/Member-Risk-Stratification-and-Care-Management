/**
 * CareGuard AI – Data Formatting Utilities
 *
 * Pure functions for formatting values displayed in the UI.
 * Always safe to call with null/undefined — returns graceful fallbacks.
 */

/**
 * Formats a number as a risk score percentage.
 */
export function formatRiskScore(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(Number(value))) return '—';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Returns a risk tier label from a numeric tier or string.
 */
export function formatRiskTier(tier) {
  if (tier === null || tier === undefined || tier === '') return 'Unknown';

  const tierMap = {
    1: 'Low',
    2: 'Moderate',
    3: 'High',
    4: 'Very High',
    5: 'Critical',
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    'very high': 'Very High',
    critical: 'Critical',
  };

  const key = typeof tier === 'string' ? tier.toLowerCase() : tier;
  return tierMap[key] || String(tier);
}

/**
 * Returns a CSS class suffix for a risk tier.
 */
export function getRiskTierClass(tier) {
  if (tier === null || tier === undefined || tier === '') return 'unknown';

  const classMap = {
    1: 'low',
    2: 'moderate',
    3: 'high',
    4: 'very-high',
    5: 'critical',
    low: 'low',
    moderate: 'moderate',
    high: 'high',
    'very high': 'very-high',
    critical: 'critical',
  };

  const key = typeof tier === 'string' ? tier.toLowerCase() : tier;
  return classMap[key] || 'unknown';
}

/**
 * Safely formats a date string.
 */
export function formatDate(value, locale = 'en-US') {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Formats a phone number string.
 */
export function formatPhone(value) {
  if (!value) return '—';
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return String(value);
}

/**
 * Safely formats a number with locale separators.
 */
export function formatNumber(value, locale = 'en-US') {
  if (value === null || value === undefined || isNaN(Number(value))) return '—';
  return Number(value).toLocaleString(locale);
}

/**
 * Safely formats currency.
 */
export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
  if (value === null || value === undefined || isNaN(Number(value))) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

/**
 * Returns a safe display string — never undefined or NaN.
 */
export function safeDisplay(value, fallback = '—') {
  if (value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) {
    return fallback;
  }
  return String(value);
}
