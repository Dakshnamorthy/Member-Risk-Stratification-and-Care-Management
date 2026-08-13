const ROI_OVERVIEW = {
  interventionCost: 540000,
  estimatedCostAvoided: 720000,
  demoNotice: 'Demo estimates only; not actual patient savings.',
};

const ROI_TREND = [
  { month: 'Jan', interventionCost: 78000, costAvoided: 103000 },
  { month: 'Feb', interventionCost: 71000, costAvoided: 91000 },
  { month: 'Mar', interventionCost: 63000, costAvoided: 86000 },
  { month: 'Apr', interventionCost: 68000, costAvoided: 98000 },
  { month: 'May', interventionCost: 72000, costAvoided: 104000 },
  { month: 'Jun', interventionCost: 75000, costAvoided: 108000 },
];

const INTERVENTION_PERFORMANCE = [
  {
    name: 'Transitions of care',
    interventionCost: 122000,
    costAvoided: 167000,
    membersServed: 68,
    notes: 'Higher return from reduced readmissions and outpatient follow-up support.',
  },
  {
    name: 'Chronic condition coaching',
    interventionCost: 96000,
    costAvoided: 119000,
    membersServed: 52,
    notes: 'Improved medication adherence and condition control drive savings.',
  },
  {
    name: 'High-risk care management',
    interventionCost: 104000,
    costAvoided: 115000,
    membersServed: 44,
    notes: 'Moderate savings with high engagement in care coordination.',
  },
  {
    name: 'Preventive care outreach',
    interventionCost: 118000,
    costAvoided: 127000,
    membersServed: 80,
    notes: 'Preventive screening and outreach reduced expensive escalations.',
  },
];

const OUTCOMES_SUMMARY = [
  {
    label: 'Care plan adherence',
    value: 78,
    unit: '%',
    detail: 'Members completing at least 75% of recommended actions.',
  },
  {
    label: 'Readmission risk reduction',
    value: 18,
    unit: '%',
    detail: 'Estimated decline in 30-day readmission risk for enrolled members.',
  },
  {
    label: 'Average risk improvement',
    value: 6.4,
    unit: 'pts',
    detail: 'Average reduction in normalized risk scores after intervention.',
  },
  {
    label: 'Members engaged',
    value: 192,
    unit: '',
    detail: 'Members actively participating in care management pathways.',
  },
];

const OUTCOMES_MEASURES = [
  {
    id: 'oc-01',
    measure: 'Care plan adherence',
    value: '78%',
    status: 'Improving',
  },
  {
    id: 'oc-02',
    measure: '30-day readmission risk',
    value: '−18%',
    status: 'Reduced',
  },
  {
    id: 'oc-03',
    measure: 'Average engagement',
    value: '4.2 visits/mo',
    status: 'Stable',
  },
  {
    id: 'oc-04',
    measure: 'Behavioral health outreach',
    value: '92% reached',
    status: 'On track',
  },
];

export async function fetchRoiOverview() {
  return Promise.resolve(ROI_OVERVIEW);
}

export async function fetchRoiTrend() {
  return Promise.resolve(ROI_TREND);
}

export async function fetchInterventionPerformance() {
  return Promise.resolve(INTERVENTION_PERFORMANCE);
}

export async function fetchOutcomesSummary() {
  return Promise.resolve(OUTCOMES_SUMMARY);
}

export async function fetchOutcomeMeasures() {
  return Promise.resolve(OUTCOMES_MEASURES);
}
