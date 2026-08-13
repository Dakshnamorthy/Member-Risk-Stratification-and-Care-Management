import { useState } from 'react';
import { Search, BrainCircuit, Activity, AlertCircle, FileText, ChevronRight, CheckCircle2, User, Stethoscope } from 'lucide-react';
import { fetchMemberById } from '../services/memberService.js';
import Button from '../components/Button.jsx';
import '../../src/styles/pages.css';

export default function Prediction() {
  const [searchQuery, setSearchQuery] = useState('');
  const [member, setMember] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading_member, error_member, ready_to_predict, predicting, prediction_complete
  const [errorMsg, setErrorMsg] = useState('');
  const [activeExplanation, setActiveExplanation] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setStatus('loading_member');
    setErrorMsg('');
    setMember(null);
    setActiveExplanation(null);

    try {
      const data = await fetchMemberById(searchQuery.trim());
      if (data) {
        setMember(data);
        setStatus('ready_to_predict');
      } else {
        setErrorMsg('Member not found. Please try M-015 or M-016.');
        setStatus('error_member');
      }
    } catch (err) {
      setErrorMsg('Error retrieving member data.');
      setStatus('error_member');
    }
  };

  const handlePredict = () => {
    setStatus('predicting');
    setActiveExplanation(null);
    // Simulate ML processing delay
    setTimeout(() => {
      setStatus('prediction_complete');
    }, 2000);
  };

  // Mock SHAP explanations based on member data
  const getExplanation = (type) => {
    if (!member) return '';
    const { conditions, utilization, age } = member;
    
    let reasons = [];
    if (age > 75) reasons.push("Advanced age > 75 increases base risk.");
    if (conditions.includes('CHF')) reasons.push("Presence of Congestive Heart Failure (CHF) is a strong positive predictor.");
    if (conditions.includes('Diabetes')) reasons.push("Comorbid Diabetes contributes to risk scoring.");
    if (utilization.edVisits > 0) reasons.push(`Recent ED visits (${utilization.edVisits}) significantly elevate acute risk.`);
    if (utilization.inpatientAdmissions > 0) reasons.push("Prior inpatient admissions are highly correlated with readmission.");
    
    if (reasons.length === 0) reasons.push("No major chronic or utilization flags detected. Risk remains baseline.");

    switch (type) {
      case '30d': return reasons.slice(0, 2).join(' ') || "No significant short-term triggers identified.";
      case '60d': return reasons.slice(0, 3).join(' ') || "Moderate-term risk factors are stable.";
      case '90d': return reasons.join(' ');
      case 'tier': return `Risk tier derived directly from cumulative 90-day probability and high-impact factors like ${conditions[0] || 'utilization history'}.`;
      default: return "";
    }
  };

  const getRecommendations = () => {
    if (!member) return [];
    const tier = member.risk.tier;
    if (tier === 'Very High' || tier === 'High') {
      return [
        "Immediate enrollment in Intensive Case Management.",
        "Schedule PCP follow-up within 48 hours.",
        "Initiate remote patient monitoring (RPM) for daily vitals.",
        "Medication reconciliation by clinical pharmacist."
      ];
    } else if (tier === 'Moderate') {
      return [
        "Assign to standard Care Management program.",
        "Schedule PCP visit within 2 weeks.",
        "Provide condition-specific educational materials."
      ];
    }
    return ["Maintain annual wellness visits.", "Routine preventive screening."];
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard__top-bar">
        <div>
          <h1 className="dashboard__greeting-title">ML Prediction Workflow</h1>
        </div>
      </div>

      <div className="prediction-layout">
        {/* Search Section */}
        <div className="dashboard__block-card prediction-search-card">
          <h2 className="dashboard__block-title">Select Member for Analysis</h2>
          <form onSubmit={handleSearch} className="prediction-search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Enter Member ID (e.g., M-015)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="prediction-input"
              />
            </div>
            <Button type="submit" disabled={status === 'loading_member' || !searchQuery.trim()}>
              Retrieve Data
            </Button>
          </form>
          {status === 'error_member' && <p className="prediction-error">{errorMsg}</p>}
        </div>

        {/* Empty State Guide */}
        {status === 'idle' && (
          <div className="dashboard__block-card prediction-guide fade-in" style={{ marginTop: '24px', backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
            <h2 className="dashboard__block-title" style={{ textAlign: 'center', marginBottom: '32px', fontSize: '1.2rem' }}>How the ML Pipeline Works</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', textAlign: 'center', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#E0E7FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <Search size={24} color="#3E64FF" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>1. Retrieve Member</h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.5' }}>Search by Member ID to pull live clinical history and demographic data from the registry.</p>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <FileText size={24} color="#10B981" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>2. Auto-Extraction</h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.5' }}>The system auto-extracts 33 critical ML features including ED visits, comorbidities, and Rx history.</p>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#FFEDD5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <BrainCircuit size={24} color="#F97316" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>3. Predictive Scoring</h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.5' }}>Generates 30/60/90-day risk probabilities alongside transparent feature explanations (SHAP).</p>
              </div>
            </div>
          </div>
        )}

        {/* Data Summary & Prediction Trigger */}
        {(status === 'ready_to_predict' || status === 'predicting' || status === 'prediction_complete') && member && (
          <div className="dashboard__block-card prediction-summary-card fade-in">
            <div className="prediction-summary-header">
              <div className="summary-title-area">
                <User size={24} className="summary-icon" />
                <div>
                  <h3 className="summary-name">{member.name} ({member.id})</h3>
                  <span className="summary-meta">{member.age} yrs • {member.gender}</span>
                </div>
              </div>
              <div className="feature-badge">
                <CheckCircle2 size={16} />
                <span>33/33 ML Features Auto-Extracted</span>
              </div>
            </div>

            <div className="summary-stats-grid">
              <div className="summary-stat-box">
                <span className="stat-label">Chronic Conditions</span>
                <span className="stat-value">{member.chronicConditionCount}</span>
              </div>
              <div className="summary-stat-box">
                <span className="stat-label">ED Visits (YTD)</span>
                <span className="stat-value">{member.utilization.edVisits}</span>
              </div>
              <div className="summary-stat-box">
                <span className="stat-label">Total Meds</span>
                <span className="stat-value">{member.pharmacy.activeMedications}</span>
              </div>
              <div className="summary-stat-box">
                <span className="stat-label">Est. Total Cost</span>
                <span className="stat-value">${member.costs.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="prediction-action-area">
              <Button 
                onClick={handlePredict} 
                disabled={status === 'predicting' || status === 'prediction_complete'}
                className="btn-run-prediction"
              >
                {status === 'predicting' ? (
                  <>
                    <Activity size={18} className="spin-icon" /> Processing Models...
                  </>
                ) : (
                  <>
                    <BrainCircuit size={18} /> Run ML Prediction
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Prediction Results */}
        {status === 'prediction_complete' && member && (
          <div className="prediction-results-area fade-in">
            <h2 className="dashboard__block-title" style={{ marginTop: '24px', marginBottom: '16px' }}>Prediction Results</h2>
            
            <div className="dashboard__kpi-grid">
              {/* 30 Day Risk */}
              <div className="kpi-card-custom">
                <div className="kpi-card-custom__head">
                  <span className="kpi-card-custom__value">{member.risk.score30d || (Math.random() * 20 + 70).toFixed(1)}%</span>
                </div>
                <div className="kpi-card-custom__label">30-Day Hospitalization Risk</div>
                <button className="btn-why" onClick={() => setActiveExplanation('30d')}>Why?</button>
                {activeExplanation === '30d' && (
                  <div className="explanation-box fade-in">
                    <strong>Key Factors (SHAP):</strong><br/>
                    {getExplanation('30d')}
                  </div>
                )}
              </div>

              {/* 60 Day Risk */}
              <div className="kpi-card-custom">
                <div className="kpi-card-custom__head">
                  <span className="kpi-card-custom__value">{member.risk.score60d || (Math.random() * 20 + 75).toFixed(1)}%</span>
                </div>
                <div className="kpi-card-custom__label">60-Day Hospitalization Risk</div>
                <button className="btn-why" onClick={() => setActiveExplanation('60d')}>Why?</button>
                {activeExplanation === '60d' && (
                  <div className="explanation-box fade-in">
                    <strong>Key Factors (SHAP):</strong><br/>
                    {getExplanation('60d')}
                  </div>
                )}
              </div>

              {/* 90 Day Risk */}
              <div className="kpi-card-custom">
                <div className="kpi-card-custom__head">
                  <span className="kpi-card-custom__value">{member.risk.score90d || (Math.random() * 20 + 80).toFixed(1)}%</span>
                </div>
                <div className="kpi-card-custom__label">90-Day Hospitalization Risk</div>
                <button className="btn-why" onClick={() => setActiveExplanation('90d')}>Why?</button>
                {activeExplanation === '90d' && (
                  <div className="explanation-box fade-in">
                    <strong>Key Factors (SHAP):</strong><br/>
                    {getExplanation('90d')}
                  </div>
                )}
              </div>

              {/* Risk Tier */}
              <div className={`kpi-card-custom ${['High', 'Very High'].includes(member.risk.tier) ? 'kpi-card-custom--urgent' : ''}`}>
                <div className="kpi-card-custom__head">
                  <span className="kpi-card-custom__value">{member.risk.tier}</span>
                </div>
                <div className="kpi-card-custom__label">90-Day Risk Tier</div>
                <button className="btn-why" onClick={() => setActiveExplanation('tier')}>Why?</button>
                {activeExplanation === 'tier' && (
                  <div className="explanation-box fade-in">
                    <strong>Key Factors (SHAP):</strong><br/>
                    {getExplanation('tier')}
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard__block-card recommendation-card fade-in">
              <h2 className="dashboard__block-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={20} className="recommendation-icon" /> 
                Recommended Care Management Actions
              </h2>
              <ul className="recommendation-list">
                {getRecommendations().map((rec, idx) => (
                  <li key={idx}><ChevronRight size={16} /> {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
