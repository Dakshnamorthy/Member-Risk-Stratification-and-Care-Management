const STORAGE_KEY = 'careguard.interventionAssignments';

const INTERVENTIONS = [
  {
    id: 'I-001',
    name: 'Nurse Care Management',
    description: 'Dedicated nurse-led coordination for high-risk members requiring close oversight.',
    targetRiskLevel: 'High',
    applicableConditions: ['CHF', 'COPD', 'Diabetes'],
    status: 'Available',
    estimatedCost: 750,
    successRate: 82,
    memberCount: 24,
  },
  {
    id: 'I-002',
    name: 'Medication Review',
    description: 'Comprehensive medication reconciliation and optimization for polypharmacy risk.',
    targetRiskLevel: 'Moderate',
    applicableConditions: ['Diabetes', 'Medication adherence', 'Chronic conditions'],
    status: 'Available',
    estimatedCost: 420,
    successRate: 75,
    memberCount: 38,
  },
  {
    id: 'I-003',
    name: 'PCP Follow-up',
    description: 'Primary care follow-up to close care gaps and reinforce preventative services.',
    targetRiskLevel: 'Low to Moderate',
    applicableConditions: ['Preventive care', 'Risk monitoring'],
    status: 'Available',
    estimatedCost: 310,
    successRate: 68,
    memberCount: 52,
  },
  {
    id: 'I-004',
    name: 'Post-Discharge Follow-up',
    description: 'Timely outreach after discharge to reduce readmission risk and coordinate support.',
    targetRiskLevel: 'High',
    applicableConditions: ['Post-discharge', 'Home support'],
    status: 'Available',
    estimatedCost: 560,
    successRate: 79,
    memberCount: 17,
  },
  {
    id: 'I-005',
    name: 'Disease Management',
    description: 'Structured condition management for members with chronic disease burden.',
    targetRiskLevel: 'Moderate to High',
    applicableConditions: ['Diabetes', 'CHF', 'COPD'],
    status: 'Available',
    estimatedCost: 680,
    successRate: 81,
    memberCount: 29,
  },
  {
    id: 'I-006',
    name: 'Specialist Referral',
    description: 'Referral coordination for specialty care and advanced clinical evaluation.',
    targetRiskLevel: 'Moderate',
    applicableConditions: ['Cardiology', 'Pulmonology', 'Endocrinology'],
    status: 'Available',
    estimatedCost: 940,
    successRate: 70,
    memberCount: 14,
  },
  {
    id: 'I-007',
    name: 'Behavioral Health Referral',
    description: 'Behavioral health access and coordination for members with psychosocial needs.',
    targetRiskLevel: 'Moderate',
    applicableConditions: ['Behavioral health', 'Mental wellness'],
    status: 'Available',
    estimatedCost: 510,
    successRate: 74,
    memberCount: 21,
  },
  {
    id: 'I-008',
    name: 'Care Coordination',
    description: 'Cross-team coordination to align care, referrals, and member outreach workflows.',
    targetRiskLevel: 'All',
    applicableConditions: ['Care plan management', 'Multi-disciplinary support'],
    status: 'Available',
    estimatedCost: 385,
    successRate: 77,
    memberCount: 44,
  },
];

function getStoredAssignments() {
  if (typeof window === 'undefined' || !window.localStorage) return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAssignments(assignments) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
}

export async function fetchInterventions() {
  return Promise.resolve(INTERVENTIONS);
}

export async function fetchInterventionAssignments() {
  return Promise.resolve(getStoredAssignments());
}

export async function assignInterventionToMember(memberId, interventionId) {
  const assignments = getStoredAssignments();
  const existing = assignments.find((assignment) => assignment.memberId === memberId && assignment.interventionId === interventionId);
  if (existing) {
    return Promise.resolve(assignments);
  }

  const nextAssignment = {
    id: `A-${Date.now()}`,
    memberId,
    interventionId,
    assignedAt: new Date().toISOString(),
  };

  const updated = [...assignments, nextAssignment];
  saveAssignments(updated);
  return Promise.resolve(updated);
}

export async function fetchInterventionsWithAssignmentCounts() {
  const assignments = getStoredAssignments();
  return INTERVENTIONS.map((intervention) => {
    const assignedCount = assignments.filter((assignment) => assignment.interventionId === intervention.id).length;
    return {
      ...intervention,
      memberCount: intervention.memberCount + assignedCount,
    };
  });
}
