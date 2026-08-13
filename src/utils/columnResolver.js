/**
 * CareGuard AI – Column Resolver / Alias System
 *
 * Maps normalized field names to possible CSV column names.
 * The resolver tries each alias in order and returns the first match.
 * This decouples UI components from raw data column names.
 */

const COLUMN_ALIASES = {
  id: ['member_id', 'MemberId', 'MEMBER_ID', 'id', 'ID', 'memberNumber', 'memberId'],
  age: ['age', 'Age', 'AGE', 'member_age', 'memberAge'],
  gender: ['gender', 'Gender', 'GENDER', 'sex', 'Sex'],
  diabetes: ['diabetes', 'Diabetes', 'DIABETES', 'diabetes_flag', 'DIABETES_FLAG'],
  chf: ['chf', 'CHF', 'chf_flag', 'CHF_FLAG', 'heart_failure'],
  ckd: ['ckd', 'CKD'],
  copd: ['copd', 'COPD', 'copd_flag', 'COPD_FLAG'],
  ischemic_heart_disease: ['ischemic_heart_disease', 'ihd'],
  stroke: ['stroke', 'Stroke'],
  cancer: ['cancer', 'Cancer'],
  depression: ['depression', 'Depression'],
  chronicConditions: ['chronic_conditions', 'ChronicConditions', 'conditions', 'diagnoses'],
  chronicConditionCount: ['chronic_condition_count', 'CHRONIC_CONDITION_COUNT', 'condition_count'],
  utilizationInpatient: ['inpatient_admissions', 'inpatientAdmissions', 'inpatient_admits', 'inpatient', 'inpatient_admissions_12m', 'inpatient_admissions_90d', 'inpatient_admissions_30d'],
  utilizationEd: ['ed_visits', 'edVisits', 'emergency_visits', 'ED_VISITS', 'er_visits_90d', 'er_visits_30d'],
  utilizationOutpatient: ['outpatient_visits', 'outpatientVisits', 'outpatient', 'outpatient_visits_90d', 'outpatient_visits_30d'],
  utilizationTotal: ['total_visits', 'totalVisits', 'visit_count', 'visits_total'],
  costsTotal: ['total_costs', 'totalCosts', 'total_cost', 'totalCost', 'total_healthcare_cost_90d'],
  costsMedical: ['medical_costs', 'medicalCosts', 'medical_cost'],
  costsPharmacy: ['pharmacy_costs', 'pharmacyCosts', 'pharmacy_cost'],
  pharmacyActiveMeds: ['active_medications', 'activeMeds', 'active_medications_count', 'prescription_count_90d', 'unique_drugs_90d'],
  pharmacyMonthlySupply: ['monthly_supply', 'monthlySupply', 'pharmacy_supply', 'total_days_supply_90d'],
  pharmacyCost: ['pharmacy_cost', 'pharmacyCost'],
  riskScore30: ['risk_score_30', 'risk_30_day', '30_day_risk', 'risk30'],
  riskScore60: ['risk_score_60', 'risk_60_day', '60_day_risk', 'risk60'],
  riskScore90: ['risk_score_90', 'risk_90_day', '90_day_risk', 'risk90'],
  riskTier: ['risk_tier', 'RiskTier', 'RISK_TIER', 'risk_level', 'risk_category'],
  hospitalization30d: ['hospitalization_30d'],
  hospitalization60d: ['hospitalization_60d'],
  hospitalization90d: ['hospitalization_90d'],
  insurancePlan: ['insurance_plan', 'InsurancePlan', 'plan', 'Plan', 'health_plan'],
  pcp: ['pcp', 'PCP', 'primary_care_physician', 'primary_doctor'],
  lastVisit: ['last_visit', 'LastVisit', 'last_visit_date', 'most_recent_visit'],
  careManager: ['care_manager', 'CareManager', 'assigned_cm', 'case_manager'],
  status: ['status', 'Status', 'STATUS', 'member_status'],
  enrollmentDate: ['enrollment_date', 'EnrollmentDate', 'enrolled_date', 'enrollment', 'prediction_date'],
  source: ['source', 'dataSource', 'data_source'],
};

function normalizeKey(key) {
  if (typeof key !== 'string') return key;
  return key.trim().toLowerCase();
}

function getColumnNameAliases() {
  const normalized = new Map();
  for (const [normalizedKey, aliases] of Object.entries(COLUMN_ALIASES)) {
    normalized.set(normalizedKey, aliases.map(normalizeKey));
  }
  return normalized;
}

const NORMALIZED_ALIAS_MAP = getColumnNameAliases();

function findMatchingKey(rowKey, aliases) {
  return aliases.find((entry) => normalizeKey(rowKey) === entry);
}

function getAliasValue(row, aliases) {
  if (!row || !aliases) return undefined;
  for (const key of Object.keys(row)) {
    const normalizedRowKey = normalizeKey(key);
    if (aliases.includes(normalizedRowKey)) {
      return row[key];
    }
  }
  return undefined;
}

/**
 * Resolves a normalized field name from a raw data row.
 * @param {Object} row - Raw data row from CSV or API
 * @param {string} normalizedKey - Normalized field name (e.g. 'memberId')
 * @param {*} defaultValue - Fallback value if field is missing
 * @returns {*} Resolved value or default
 */
export function findColumn(row, normalizedKey) {
  if (!row || !normalizedKey) return undefined;
  const aliases = NORMALIZED_ALIAS_MAP[normalizedKey] || [normalizeKey(normalizedKey)];
  return getAliasValue(row, aliases);
}

export function getValue(row, normalizedKey, defaultValue = null) {
  const value = findColumn(row, normalizedKey);
  return value !== undefined && value !== null && value !== '' ? value : defaultValue;
}

export function getNumericValue(row, normalizedKey, defaultValue = null) {
  const value = getValue(row, normalizedKey, defaultValue);
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = Number(String(value).replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(num) ? num : defaultValue;
}

export function getBooleanValue(row, normalizedKey, defaultValue = false) {
  const value = findColumn(row, normalizedKey);
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  return ['true', '1', 'yes', 'y', 'on'].includes(normalized) || defaultValue;
}

export function getFirstAvailableValue(row, normalizedKeys, defaultValue = null) {
  if (!Array.isArray(normalizedKeys)) return defaultValue;
  for (const key of normalizedKeys) {
    const value = getValue(row, key, undefined);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return defaultValue;
}

/**
 * Returns the full alias map for external inspection/config.
 */
export function getColumnAliases() {
  return JSON.parse(JSON.stringify(COLUMN_ALIASES));
}

/**
 * Registers additional aliases for a normalized key.
 * @param {string} normalizedKey
 * @param {string[]} newAliases
 */
export function registerAliases(normalizedKey, newAliases) {
  if (!COLUMN_ALIASES[normalizedKey]) {
    COLUMN_ALIASES[normalizedKey] = [];
  }
  COLUMN_ALIASES[normalizedKey] = [
    ...new Set([...COLUMN_ALIASES[normalizedKey], ...newAliases]),
  ];
}
