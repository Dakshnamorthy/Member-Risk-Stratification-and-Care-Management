import { getRiskTierClass } from '../utils/formatters.js';

const AGE_GROUP_DEFINITIONS = [
  { label: 'Under 45', min: 0, max: 44 },
  { label: '45-54', min: 45, max: 54 },
  { label: '55-64', min: 55, max: 64 },
  { label: '65-74', min: 65, max: 74 },
  { label: '75+', min: 75, max: Number.POSITIVE_INFINITY },
];

const RISK_WINDOWS = ['30D', '60D', '90D'];
const TIER_ORDER = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];

export function getAgeGroup(age) {
  if (age === null || age === undefined || Number.isNaN(Number(age))) {
    return 'Unknown';
  }

  const numericAge = Number(age);
  const bucket = AGE_GROUP_DEFINITIONS.find((group) => numericAge >= group.min && numericAge <= group.max);
  return bucket ? bucket.label : 'Unknown';
}

export function getMemberFilterOptions(members) {
  const riskTierSet = new Set();
  const conditionSet = new Set();
  const ageGroupSet = new Set();

  members.forEach((member) => {
    if (member?.risk?.tier) {
      riskTierSet.add(member.risk.tier);
    }

    const ageGroup = getAgeGroup(member.age);
    if (ageGroup !== 'Unknown') {
      ageGroupSet.add(ageGroup);
    }

    if (Array.isArray(member.conditions)) {
      member.conditions.forEach((condition) => {
        if (condition) {
          conditionSet.add(condition);
        }
      });
    }
  });

  const riskTiers = TIER_ORDER.filter((tier) => riskTierSet.has(tier));
  const ageGroups = AGE_GROUP_DEFINITIONS.map((group) => group.label).filter((label) => ageGroupSet.has(label));
  const conditions = Array.from(conditionSet).sort((a, b) => a.localeCompare(b));

  return {
    riskTiers,
    ageGroups,
    conditions,
    riskWindows: RISK_WINDOWS,
  };
}

export function applyMemberFilters(members, filters) {
  if (!Array.isArray(members)) return [];

  const normalizedSearch = String(filters.search || '').trim().toLowerCase();

  return members
    .filter((member) => {
      if (normalizedSearch) {
        const id = String(member.id || '').toLowerCase();
        if (!id.includes(normalizedSearch)) {
          return false;
        }
      }

      if (filters.riskTier && filters.riskTier !== 'All') {
        if (member.risk?.tier !== filters.riskTier) return false;
      }

      if (filters.ageGroup && filters.ageGroup !== 'All') {
        if (getAgeGroup(member.age) !== filters.ageGroup) return false;
      }

      if (filters.condition && filters.condition !== 'All') {
        if (!Array.isArray(member.conditions) || !member.conditions.includes(filters.condition)) {
          return false;
        }
      }

      if (filters.riskWindow && filters.riskWindow !== 'All') {
        const scoreKey = filters.riskWindow === '30D' ? 'score30d' : filters.riskWindow === '60D' ? 'score60d' : 'score90d';
        const score = member.risk?.[scoreKey];
        if (score === null || score === undefined || Number.isNaN(Number(score))) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const tierA = TIER_ORDER.indexOf(a.risk?.tier) ?? TIER_ORDER.length;
      const tierB = TIER_ORDER.indexOf(b.risk?.tier) ?? TIER_ORDER.length;
      if (tierA !== tierB) return tierA - tierB;
      return String(a.id || '').localeCompare(String(b.id || ''));
    });
}

export function paginate(items, pageSize, currentPage) {
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10;
  const safeCurrentPage = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
  const startIndex = (safeCurrentPage - 1) * safePageSize;
  return items.slice(startIndex, startIndex + safePageSize);
}

export function getPaginationMetadata(items, pageSize) {
  const total = Array.isArray(items) ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { total, totalPages };
}
