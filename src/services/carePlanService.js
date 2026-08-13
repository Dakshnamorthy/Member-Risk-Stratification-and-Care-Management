const STORAGE_KEY = 'careguard.carePlans';

const DEFAULT_CARE_PLANS = [
  {
    id: 'CP-1001',
    memberId: 'M-001',
    riskTier: 'High',
    riskScore: 29.7,
    recommendedIntervention: 'Outreach and medication review',
    careManager: 'Maya K.',
    status: 'Identified',
    dueDate: '2026-08-18',
    details: 'Member has chronic conditions with rising ED visits. Start care manager outreach and review medication adherence.',
  },
  {
    id: 'CP-1002',
    memberId: 'M-002',
    riskTier: 'Moderate',
    riskScore: 14.4,
    recommendedIntervention: 'Schedule follow-up call',
    careManager: 'Noah S.',
    status: 'Contacted',
    dueDate: '2026-08-20',
    details: 'A follow-up call is needed to confirm support services and care plan activation.',
  },
  {
    id: 'CP-1003',
    memberId: 'M-003',
    riskTier: 'Low',
    riskScore: 7.3,
    recommendedIntervention: 'Confirm preventive care plan',
    careManager: 'Avery L.',
    status: 'Intervention In Progress',
    dueDate: null,
    details: 'Member is stable, but preventive care should be confirmed to keep risk low.',
  },
  {
    id: 'CP-1004',
    memberId: 'M-004',
    riskTier: 'High',
    riskScore: 31.5,
    recommendedIntervention: 'Coordinate inpatient discharge support',
    careManager: 'Sam R.',
    status: 'Follow-up',
    dueDate: '2026-08-13',
    details: 'Member requires discharge planning and home support to avoid readmission.',
  },
  {
    id: 'CP-1005',
    memberId: 'M-005',
    riskTier: 'Moderate',
    riskScore: 19.8,
    recommendedIntervention: 'Review care plan goals',
    careManager: 'Dana T.',
    status: 'Completed',
    dueDate: null,
    details: 'Care plan actions were completed; validate member has follow-up resources in place.',
  },
];

function getStoredPlans() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function persistPlans(plans) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export async function fetchCarePlans() {
  const storedPlans = getStoredPlans();
  if (storedPlans) {
    return Promise.resolve(storedPlans);
  }

  persistPlans(DEFAULT_CARE_PLANS);
  return Promise.resolve(DEFAULT_CARE_PLANS);
}

export async function saveCarePlans(plans) {
  persistPlans(plans);
  return Promise.resolve(plans);
}

export async function patchCarePlan(planId, patch) {
  const plans = await fetchCarePlans();
  const updated = plans.map((plan) => {
    if (plan.id !== planId) return plan;
    return { ...plan, ...patch };
  });
  await saveCarePlans(updated);
  return updated.find((plan) => plan.id === planId) || null;
}

export async function createCarePlan(plan) {
  const plans = await fetchCarePlans();
  const nextPlan = { ...plan, id: `CP-${Date.now()}` };
  const updated = [...plans, nextPlan];
  await saveCarePlans(updated);
  return nextPlan;
}
