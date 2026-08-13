/**
 * CareGuard AI – Member Data Adapter
 *
 * Transforms raw data rows (CSV or API) into normalized Member objects.
 * Components should only consume the normalized shape, never raw rows.
 */

import {
  getValue,
  getNumericValue,
  getBooleanValue,
  getFirstAvailableValue,
} from '../utils/columnResolver.js';

const MEMBER_DEFAULTS = {
  id: '',
  name: '',
  age: null,
  gender: '',
  chronicConditionCount: 0,
  conditions: [],
  utilization: {
    inpatientAdmissions: 0,
    edVisits: 0,
    outpatientVisits: 0,
    totalVisits: 0,
  },
  costs: {
    total: 0,
    medical: 0,
    pharmacy: 0,
  },
  pharmacy: {
    activeMedications: 0,
    monthlySupply: 0,
    cost: 0,
  },
  risk: {
    score30d: null,
    score60d: null,
    score90d: null,
    tier: 'Unknown',
  },
  targets: {
    hospitalization30d: 0,
    hospitalization60d: 0,
    hospitalization90d: 0,
  },
  metadata: {
    plan: '',
    pcp: '',
    lastVisit: null,
    careManager: '',
    status: '',
    enrollmentDate: null,
    source: '',
  },
  clinical: {
    room: '',
    condition: '',
    vitals: {
      hr: null,
      spo2: null,
      temp: null,
      bp: '',
    },
    status: 'Stable',
  },
};

function cloneDefaults() {
  return JSON.parse(JSON.stringify(MEMBER_DEFAULTS));
}

// Generate a deterministic mock name from ID so the UI is not empty
const firstNames = ['John', 'Mary', 'Robert', 'Patricia', 'Michael', 'Jennifer', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

function generateNameFromId(idStr) {
  if (!idStr) return 'Unknown Patient';
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const fIndex = Math.abs(hash) % firstNames.length;
  const lIndex = Math.abs(hash >> 3) % lastNames.length;
  return `${firstNames[fIndex]} ${lastNames[lIndex]}`;
}

function normalizeConditions(rawRow) {
  const explicitConditions = getFirstAvailableValue(rawRow, ['conditions', 'chronicConditions', 'diagnoses'], '');
  const conditions = [];

  if (typeof explicitConditions === 'string' && explicitConditions.trim()) {
    conditions.push(
      ...explicitConditions
        .split(/[;,|]/)
        .map((item) => item.trim())
        .filter(Boolean),
    );
  } else if (Array.isArray(explicitConditions)) {
    conditions.push(...explicitConditions.filter(Boolean));
  }

  if (getBooleanValue(rawRow, 'diabetes')) conditions.push('Diabetes');
  if (getBooleanValue(rawRow, 'chf')) conditions.push('CHF');
  if (getBooleanValue(rawRow, 'copd')) conditions.push('COPD');
  if (getBooleanValue(rawRow, 'ckd')) conditions.push('CKD');
  if (getBooleanValue(rawRow, 'ischemic_heart_disease')) conditions.push('Ischemic Heart Disease');
  if (getBooleanValue(rawRow, 'stroke')) conditions.push('Stroke');
  if (getBooleanValue(rawRow, 'cancer')) conditions.push('Cancer');
  if (getBooleanValue(rawRow, 'depression')) conditions.push('Depression');

  return [...new Set(conditions.map((condition) => String(condition).trim()).filter(Boolean))];
}

function parseUtilization(rawRow) {
  const inpatientAdmissions = getNumericValue(rawRow, 'utilizationInpatient', 0);
  const edVisits = getNumericValue(rawRow, 'utilizationEd', 0);
  const outpatientVisits = getNumericValue(rawRow, 'utilizationOutpatient', 0);
  const totalVisits = getNumericValue(rawRow, 'utilizationTotal', inpatientAdmissions + edVisits + outpatientVisits);

  return {
    inpatientAdmissions,
    edVisits,
    outpatientVisits,
    totalVisits,
  };
}

function parseCosts(rawRow) {
  return {
    total: getNumericValue(rawRow, 'costsTotal', 0),
    medical: getNumericValue(rawRow, 'costsMedical', 0),
    pharmacy: getNumericValue(rawRow, 'costsPharmacy', 0),
  };
}

function parsePharmacy(rawRow) {
  return {
    activeMedications: getNumericValue(rawRow, 'pharmacyActiveMeds', 0),
    monthlySupply: getNumericValue(rawRow, 'pharmacyMonthlySupply', 0),
    cost: getNumericValue(rawRow, 'pharmacyCost', 0),
  };
}

function deriveRiskTier(rawRow, conditionsCount, utilization) {
  // Check if there is an explicit tier
  const explicitTier = getFirstAvailableValue(rawRow, ['risk_tier', 'riskTier', 'riskTierLabel'], null);
  if (explicitTier) return explicitTier;

  // Otherwise, derive a realistic mock tier based on features (e.g. for ML targets demo)
  const hosp90 = getNumericValue(rawRow, 'hospitalization90d', 0);
  const edVisits = utilization.edVisits || 0;
  
  if (hosp90 === 1 || edVisits >= 3) {
    return 'Very High';
  } else if (conditionsCount >= 4 || edVisits >= 1) {
    return 'High';
  } else if (conditionsCount >= 2) {
    return 'Moderate';
  } else if (conditionsCount === 1) {
    return 'Low';
  }
  return 'Very Low';
}

function parseRisk(rawRow, conditionsCount, utilization) {
  return {
    score30d: getNumericValue(rawRow, 'risk_score_30', getNumericValue(rawRow, 'riskScore30', null)),
    score60d: getNumericValue(rawRow, 'risk_score_60', getNumericValue(rawRow, 'riskScore60', null)),
    score90d: getNumericValue(rawRow, 'risk_score_90', getNumericValue(rawRow, 'riskScore90', null)),
    tier: deriveRiskTier(rawRow, conditionsCount, utilization),
  };
}

function parseTargets(rawRow) {
  return {
    hospitalization30d: getNumericValue(rawRow, 'hospitalization30d', 0),
    hospitalization60d: getNumericValue(rawRow, 'hospitalization60d', 0),
    hospitalization90d: getNumericValue(rawRow, 'hospitalization90d', 0),
  };
}

function parseMetadata(rawRow, id) {
  return {
    plan: getFirstAvailableValue(rawRow, ['insurance_plan', 'insurancePlan', 'plan', 'healthPlan'], 'Medicare Advantage'),
    pcp: getFirstAvailableValue(rawRow, ['pcp', 'primaryCarePhysician'], 'Dr. Roberts'),
    lastVisit: getFirstAvailableValue(rawRow, ['last_visit', 'lastVisit', 'mostRecentVisit'], null),
    careManager: getFirstAvailableValue(rawRow, ['care_manager', 'careManager', 'assignedCM', 'caseManager'], 'Maya K.'),
    status: getFirstAvailableValue(rawRow, ['status', 'memberStatus'], 'Active'),
    enrollmentDate: getFirstAvailableValue(rawRow, ['enrollment_date', 'enrollmentDate', 'memberSince'], null),
    source: getFirstAvailableValue(rawRow, ['source', 'dataSource'], 'CSV'),
  };
}

function parseClinical(rawRow, targets) {
  // If no explicit status, generate one based on hospitalization risk for queue UI
  let status = getFirstAvailableValue(rawRow, ['clinical_status', 'clinicalStatus'], '');
  let hr = getNumericValue(rawRow, 'hr', null);
  let spo2 = getNumericValue(rawRow, 'spo2', null);

  if (!status) {
    if (targets.hospitalization30d === 1) {
      status = 'Critical';
      hr = hr || 110;
      spo2 = spo2 || 91;
    } else if (targets.hospitalization60d === 1) {
      status = 'Watch';
      hr = hr || 95;
      spo2 = spo2 || 94;
    } else {
      status = 'Stable';
      hr = hr || 72;
      spo2 = spo2 || 98;
    }
  }

  return {
    room: getFirstAvailableValue(rawRow, ['room'], ''),
    condition: getFirstAvailableValue(rawRow, ['condition'], ''),
    vitals: {
      hr,
      spo2,
      temp: getNumericValue(rawRow, 'temp', 98.6),
      bp: getFirstAvailableValue(rawRow, ['bp'], '120/80'),
    },
    status,
  };
}

/**
 * Adapts a single raw data row into a normalized Member object.
 * @param {Object} rawRow - A single row from CSV or API.
 * @returns {Object} Normalized member.
 */
export function adaptMember(rawRow) {
  if (!rawRow || typeof rawRow !== 'object') {
    return cloneDefaults();
  }

  const conditions = normalizeConditions(rawRow);
  const chronicConditionCount = Math.max(
    0,
    getNumericValue(rawRow, 'chronicConditionCount', conditions.length),
  );

  const id = getFirstAvailableValue(rawRow, ['memberId', 'id', 'member_id'], '');
  let name = getFirstAvailableValue(rawRow, ['name'], '');
  if (!name && id) name = generateNameFromId(id);

  const utilization = parseUtilization(rawRow);
  const targets = parseTargets(rawRow);

  return {
    id,
    name,
    age: getNumericValue(rawRow, 'age', null),
    gender: getFirstAvailableValue(rawRow, ['gender', 'sex'], ''),
    chronicConditionCount,
    conditions,
    utilization,
    costs: parseCosts(rawRow),
    pharmacy: parsePharmacy(rawRow),
    risk: parseRisk(rawRow, chronicConditionCount, utilization),
    targets,
    metadata: parseMetadata(rawRow, id),
    clinical: parseClinical(rawRow, targets),
  };
}

/**
 * Adapts an array of raw data rows into normalized Members.
 * @param {Object[]} rawRows - Array of raw data rows.
 * @returns {Object[]} Array of normalized members.
 */
export function adaptMembers(rawRows) {
  if (!Array.isArray(rawRows)) return [];
  return rawRows.map(adaptMember);
}

/**
 * Returns the default member shape for reference/type checking.
 */
export function getMemberDefaults() {
  return cloneDefaults();
}
