import { useMemo } from 'react';
import { ShieldAlert, Sparkles, TrendingUp, Activity } from 'lucide-react';
import RiskDrivers from './RiskDrivers.jsx';
import { formatRiskScore, formatRiskTier, formatNumber, safeDisplay } from '../utils/formatters.js';
import '../styles/pages.css';

function PredictionCard({ title, score }) {
  const isAvailable = score !== null && score !== undefined;
  const value = isAvailable ? formatRiskScore(score) : '—';
  return (
    <div className="prediction-card">
      <p className="prediction-card__title">{title}</p>
      <p className="prediction-card__score" style={{ color: isAvailable ? 'var(--color-primary-navy)' : 'var(--color-gray-400)' }}>{value}</p>
    </div>
  );
}

export default function AiRiskAnalysis({ member, explanation }) {
  // If no explanation is provided, generate a contextual mock one
  const computedExplanation = useMemo(() => {
    if (explanation) return explanation;
    
    if (!member) return null;

    const { risk, conditions, utilization } = member;

    const drivers = [];
    if (conditions && conditions.length > 0) {
      drivers.push({ feature: 'chronic_conditions', label: 'Chronic conditions count', contribution: 0.35, direction: 'up' });
    }
    if (utilization && utilization.edVisits > 0) {
      drivers.push({ feature: 'recent_ed_visits', label: 'Recent ED visits', contribution: 0.28, direction: 'up' });
    }
    if (member.age > 75) {
      drivers.push({ feature: 'age', label: 'Member age', contribution: 0.15, direction: 'up' });
    }
    if (member.pharmacy && member.pharmacy.activeMedications >= 5) {
       drivers.push({ feature: 'polypharmacy', label: 'High medication count', contribution: 0.12, direction: 'up' });
    }
    // Add a stabilizing driver
    drivers.push({ feature: 'medication_adherence', label: 'Medication adherence', contribution: -0.10, direction: 'down' });

    let humanText = "The member is assigned a predicted risk based on their clinical history.";
    if (conditions.length > 2 && utilization.edVisits > 0) {
      humanText = "The member is assigned a higher predicted risk because they have multiple chronic conditions and recent emergency department activity. Current medication adherence is helping to moderate the score, but continued care coordination and follow-up are advised.";
    } else if (conditions.length > 0) {
      humanText = "The member's risk is primarily driven by existing chronic conditions. Regular monitoring is recommended to prevent acute exacerbations.";
    } else {
      humanText = "The member exhibits a stable risk profile with minimal recent acute utilization. Routine preventative care should be maintained.";
    }

    return {
      score30d: risk.score30d,
      score60d: risk.score60d,
      score90d: risk.score90d,
      tier: risk.tier,
      drivers,
      humanText,
      isMock: true
    };
  }, [member, explanation]);

  if (!computedExplanation) return null;

  const riskTier = formatRiskTier(computedExplanation.tier);
  const isUrgent = ['High', 'Very High'].includes(computedExplanation.tier);

  return (
    <div className="risk-analysis-page" style={{ margin: 0, padding: 0, minHeight: 'auto' }}>
      <header className="risk-analysis-page__header" style={{ marginBottom: '16px' }}>
        <div>
          <p className="risk-analysis-page__eyebrow">AI Risk Analysis</p>
          <h2 style={{ fontSize: '1.25rem', marginTop: '4px' }}>Why this member received the predicted risk</h2>
        </div>
        <div className="risk-analysis-page__status">
          <ShieldAlert size={18} />
          <span>{computedExplanation.isMock ? 'Model explanation preview (Demo)' : 'Actual model explanation'}</span>
        </div>
      </header>

      <div className="risk-analysis-grid">
        <section className="risk-analysis-card risk-analysis-card--summary">
          <div className="risk-analysis-card__header">
            <p className="risk-analysis-card__eyebrow">Overall risk score (30-Day)</p>
            <Sparkles size={20} />
          </div>
          <div className="risk-analysis-card__body">
            <p className="risk-analysis-card__score">{formatRiskScore(computedExplanation.score30d)}</p>
            <p className="risk-analysis-card__description">
              The model uses 30-day predicted risk as the primary operating score for early outreach prioritization.
            </p>
          </div>
        </section>

        <section className="risk-analysis-card risk-analysis-card--predictions">
          <p className="risk-analysis-card__eyebrow">30/60/90-day prediction</p>
          <div className="prediction-grid">
            <PredictionCard title="30-Day" score={computedExplanation.score30d} />
            <PredictionCard title="60-Day" score={computedExplanation.score60d} />
            <PredictionCard title="90-Day" score={computedExplanation.score90d} />
          </div>
        </section>

        <section className="risk-analysis-card risk-analysis-card--tier">
          <div className="risk-analysis-card__header">
            <p className="risk-analysis-card__eyebrow">Risk tier</p>
            <TrendingUp size={20} />
          </div>
          <div className="risk-analysis-card__body">
            <p className="risk-analysis-card__tier">{riskTier}</p>
            <p className="risk-analysis-card__description">
              This tier summarizes the overall concern level for a care manager and helps prioritize next actions.
            </p>
          </div>
        </section>

        <section className="risk-analysis-card risk-analysis-card--drivers">
          <RiskDrivers drivers={computedExplanation.drivers} />
        </section>

        <section className="risk-analysis-card risk-analysis-card--visualization">
          <div className="risk-analysis-card__header">
            <p className="risk-analysis-card__eyebrow">Feature contribution visualization</p>
            <Activity size={20} />
          </div>
          {Array.isArray(computedExplanation.drivers) && computedExplanation.drivers.length > 0 ? (
            <div className="feature-chart">
              {computedExplanation.drivers.map((driver) => {
                const magnitude = Math.min(Math.abs(driver.contribution) * 100, 100);
                const directionClass = driver.direction === 'down' ? 'feature-chart__bar--down' : 'feature-chart__bar--up';
                return (
                  <div className="feature-chart__row" key={driver.feature}>
                    <span className="feature-chart__label">{driver.label}</span>
                    <div className="feature-chart__progress">
                      <div className={`feature-chart__bar ${directionClass}`} style={{ width: `${magnitude}%` }} />
                      <span className="feature-chart__value">{formatNumber(driver.contribution)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="risk-analysis-card__empty">Feature contributions are not available for this member.</p>
          )}
        </section>

        <section className="risk-analysis-card risk-analysis-card--explanation">
          <div className="risk-analysis-card__header">
            <p className="risk-analysis-card__eyebrow">Human-readable explanation</p>
            <Sparkles size={20} />
          </div>
          <p className="risk-analysis-card__text">
            {computedExplanation.humanText || "No detailed explanation available for this profile."}
          </p>
          <p className="risk-analysis-card__footnote">
            Note: This explanation is based on sample feature contributions and is intended for care manager review.
          </p>
        </section>

        <section className="risk-analysis-card risk-analysis-card--attention">
          <div className="risk-analysis-card__header">
            <p className="risk-analysis-card__eyebrow">Recommended attention level</p>
            <ShieldAlert size={20} />
          </div>
          <div className={`attention-pill ${isUrgent ? 'attention-pill--high' : 'attention-pill--moderate'}`}>
            <span>{isUrgent ? 'High attention' : 'Standard monitoring'}</span>
          </div>
          <ul className="attention-list">
            {isUrgent ? (
              <>
                <li>Confirm outreach plan with the member’s care manager.</li>
                <li>Review recent ED and inpatient utilization for care gaps.</li>
                <li>Update the member’s care plan within the next 7 days.</li>
              </>
            ) : (
              <>
                <li>Maintain routine outreach schedule.</li>
                <li>Ensure annual wellness visit is completed.</li>
                <li>Monitor for new acute events.</li>
              </>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
