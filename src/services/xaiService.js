/**
 * Explainable AI (XAI) Service
 * 
 * Replace the mock logic with real API calls to your XAI backend.
 */

export const fetchExplanation = async (memberId, predictionType) => {
  // TODO: Replace with real API call
  // const response = await fetch(`YOUR_API_URL/explain?memberId=${memberId}&type=${predictionType}`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // if (!response.ok) throw new Error('Failed to fetch explanation');
  // return await response.json();

  // --- MOCK IMPLEMENTATION ---
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!memberId) {
        reject(new Error('Member ID is required.'));
        return;
      }

      // Generate mock SHAP values based on the prediction type
      let features = [];
      
      if (predictionType === '30d') {
        features = [
          { name: 'Recent ED Visits > 2', impact: 22.5, direction: 'positive' },
          { name: 'Medication Adherence < 80%', impact: 15.2, direction: 'positive' },
          { name: 'Recent Primary Care Visit', impact: 8.4, direction: 'negative' },
        ];
      } else if (predictionType === '60d') {
        features = [
          { name: 'Congestive Heart Failure (CHF)', impact: 18.1, direction: 'positive' },
          { name: 'HbA1c > 9.0', impact: 12.7, direction: 'positive' },
          { name: 'Age > 75', impact: 9.3, direction: 'positive' },
          { name: 'Stable Blood Pressure', impact: 5.1, direction: 'negative' },
        ];
      } else if (predictionType === '90d' || predictionType === 'tier') {
        features = [
          { name: 'Prior Inpatient Admissions', impact: 28.4, direction: 'positive' },
          { name: 'Multiple Chronic Conditions (MCC)', impact: 21.0, direction: 'positive' },
          { name: 'Social Determinants: Housing Instability', impact: 14.5, direction: 'positive' },
          { name: 'Enrolled in Care Management', impact: 12.0, direction: 'negative' },
          { name: 'Age > 75', impact: 8.2, direction: 'positive' },
        ];
      } else {
        features = [
          { name: 'Baseline Age Risk', impact: 10.0, direction: 'positive' }
        ];
      }

      resolve({
        memberId,
        predictionType,
        features: features.sort((a, b) => b.impact - a.impact) // Sort by highest impact first
      });
    }, 1200); // Simulate network delay
  });
};
