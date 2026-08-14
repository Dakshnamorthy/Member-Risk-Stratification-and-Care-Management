import { useEffect, useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { fetchRoiOverview, fetchRoiTrend, fetchInterventionPerformance, fetchOutcomesSummary, fetchOutcomeMeasures } from '../services/roiService.js';
import { fetchMembers } from '../services/memberService.js';
import { calculateNetSavings, calculateRoi, formatCurrency, formatPercent, roiStatus } from '../utils/roiUtils.js';
import LineChart from '../components/LineChart.jsx';
import BarChart from '../components/BarChart.jsx';
import '../styles/pages.css';

export default function ROI() {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [outcomesSummary, setOutcomesSummary] = useState([]);
  const [outcomeMeasures, setOutcomeMeasures] = useState([]);
  const [members, setMembers] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchRoiOverview(),
      fetchRoiTrend(),
      fetchInterventionPerformance(),
      fetchOutcomesSummary(),
      fetchOutcomeMeasures(),
      fetchMembers(),
    ])
      .then(([overviewData, trendData, perfData, summaryData, measuresData, membersData]) => {
        setOverview(overviewData);
        setTrend(trendData);
        setPerformance(perfData);
        setOutcomesSummary(summaryData);
        setOutcomeMeasures(measuresData);
        // Only take the top 10 members for the prediction view
        setMembers(membersData.slice(0, 10));
      })
      .catch(() => setError('Unable to load ROI and outcomes analytics.'));
  }, []);

  const handlePredictROI = (member) => {
    setPredictions((prev) => ({ ...prev, [member.id]: { status: 'loading' } }));
    
    // Simulate backend ML model delay
    setTimeout(() => {
      const actualCost = member.costs.total;
      // High-risk patients yield higher savings (~25%), others ~15%
      const savingsPercent = (member.risk.tier === 'High' || member.risk.tier === 'Very High') ? 0.25 : 0.15;
      const predictedCost = actualCost * (1 - savingsPercent);
      const savings = actualCost - predictedCost;
      
      setPredictions((prev) => ({
        ...prev,
        [member.id]: {
          status: 'complete',
          actualCost,
          predictedCost,
          savings
        }
      }));
    }, 1500);
  };

  const netSavings = overview ? calculateNetSavings(overview.estimatedCostAvoided, overview.interventionCost) : null;
  const roi = overview ? calculateRoi(overview.estimatedCostAvoided, overview.interventionCost) : null;

  return (
    <div className="roi-page">
      <header className="roi-page__header">
        <div>
          <p className="roi-page__eyebrow">Financial Impact</p>
          <h1 className="roi-page__title">ROI & Outcomes</h1>
          <p className="roi-page__description">
            Visualize care management value with cost comparisons, ROI trends, and outcomes performance.
          </p>
        </div>
        <div className="roi-page__badge">
          <TrendingUp size={24} />
          Demo data only
        </div>
      </header>

      {error ? (
        <div className="roi-page__state roi-page__state--error">{error}</div>
      ) : (
        <>
          <section className="roi-kpi-grid">
            <div className="kpi-card kpi-card--primary">
              <div className="kpi-card__head">
                <span className="kpi-card__label">Intervention Cost</span>
                <ArrowDownRight size={16} />
              </div>
              <div className="kpi-card__value">{formatCurrency(overview?.interventionCost)}</div>
              <p className="kpi-card__subtitle">Total program investment in care interventions.</p>
            </div>
            <div className="kpi-card kpi-card--secondary">
              <div className="kpi-card__head">
                <span className="kpi-card__label">Estimated Cost Avoided</span>
                <ArrowUpRight size={16} />
              </div>
              <div className="kpi-card__value">{formatCurrency(overview?.estimatedCostAvoided)}</div>
              <p className="kpi-card__subtitle">Projected cost reductions from the care portfolio.</p>
            </div>
            <div className="kpi-card kpi-card--warning">
              <div className="kpi-card__head">
                <span className="kpi-card__label">Net Savings</span>
              </div>
              <div className="kpi-card__value">{formatCurrency(netSavings)}</div>
              <p className="kpi-card__subtitle">Avoided cost minus intervention spend.</p>
            </div>
            <div className="kpi-card kpi-card--danger">
              <div className="kpi-card__head">
                <span className="kpi-card__label">ROI</span>
              </div>
              <div className="kpi-card__value">{roi === null ? '—' : formatPercent(roi)}</div>
              <p className="kpi-card__subtitle">Return on investment for the care portfolio.</p>
            </div>
          </section>

          <div className="roi-page__section">
            <div className="roi-page__section-header">
              <div>
                <h2 className="roi-page__section-title">Patient ROI Prediction</h2>
                <p className="roi-page__section-copy">Simulate AI-driven ROI predictions for individual members based on recommended interventions.</p>
              </div>
            </div>
            <div className="data-table__wrapper" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member ID</th>
                    <th>Risk Tier</th>
                    <th>Actual Cost (YTD)</th>
                    <th>Predicted Cost (Post-Intervention)</th>
                    <th>Est. Savings (ROI)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const pred = predictions[member.id];
                    return (
                      <tr key={member.id}>
                        <td style={{ fontWeight: '500' }}>{member.id}</td>
                        <td>
                          <span className={`risk-badge risk-badge--${member.risk.tier.replace(/\s+/g, '-').toLowerCase()}`}>
                            {member.risk.tier}
                          </span>
                        </td>
                        <td>{pred?.status === 'complete' ? formatCurrency(pred.actualCost) : formatCurrency(member.costs.total)}</td>
                        <td>
                          {pred?.status === 'complete' ? (
                            <span style={{ color: '#10B981', fontWeight: '500' }}>{formatCurrency(pred.predictedCost)}</span>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>--</span>
                          )}
                        </td>
                        <td>
                          {pred?.status === 'complete' ? (
                            <span style={{ color: '#10B981', fontWeight: '600' }}>+{formatCurrency(pred.savings)}</span>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>--</span>
                          )}
                        </td>
                        <td>
                          {pred?.status === 'loading' ? (
                            <button disabled style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: '#E2E8F0', color: '#64748B', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontSize: '13px' }}>
                              <Loader2 size={14} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                              Predicting...
                            </button>
                          ) : pred?.status === 'complete' ? (
                            <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: '4px', fontSize: '13px', fontWeight: '500' }}>
                              Predicted
                            </span>
                          ) : (
                            <button 
                              onClick={() => handlePredictROI(member)}
                              style={{ padding: '6px 12px', backgroundColor: '#3E64FF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'background 0.2s' }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#254EE0'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3E64FF'}
                            >
                              Predict ROI
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <section className="roi-page__section">
            <div className="roi-page__section-header">
              <div>
                <h2 className="roi-page__section-title">ROI trend</h2>
                <p className="roi-page__section-copy">Monthly intervention cost against estimated avoided cost.</p>
              </div>
              <div className="roi-page__badge-small">{overview?.demoNotice}</div>
            </div>
            <div className="roi-page__chart-card">
              {trend.length > 0 ? (
                <LineChart
                  labels={trend.map((item) => item.month)}
                  series={[
                    { name: 'Cost Avoided', data: trend.map((item) => item.costAvoided) },
                    { name: 'Intervention Cost', data: trend.map((item) => item.interventionCost) },
                  ]}
                />
              ) : (
                <div className="roi-page__state">ROI trend data not available.</div>
              )}
            </div>
          </section>

          <section className="roi-page__section roi-page__two-column">
            <div className="roi-page__panel">
              <div className="roi-page__panel-header">
                <h2 className="roi-page__section-title">Intervention performance</h2>
                <p className="roi-page__section-copy">Program returns, cost avoidance, and member reach.</p>
              </div>
              <div className="data-table__wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Cost</th>
                      <th>Cost Avoided</th>
                      <th>ROI</th>
                      <th>Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance.map((item) => {
                      const score = calculateRoi(item.costAvoided, item.interventionCost);
                      return (
                        <tr key={item.name}>
                          <td>{item.name}</td>
                          <td>{formatCurrency(item.interventionCost)}</td>
                          <td>{formatCurrency(item.costAvoided)}</td>
                          <td>{score === null ? '—' : formatPercent(score)}</td>
                          <td>{item.membersServed}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="roi-page__panel roi-page__panel--summary">
              <div className="roi-page__panel-header">
                <h2 className="roi-page__section-title">Cost comparison</h2>
                <p className="roi-page__section-copy">A quick view of investment versus avoided expense.</p>
              </div>
              <div className="roi-summary-grid">
                <div className="roi-summary-card">
                  <span className="roi-summary-card__label">Total cost avoided</span>
                  <strong>{formatCurrency(overview?.estimatedCostAvoided)}</strong>
                </div>
                <div className="roi-summary-card">
                  <span className="roi-summary-card__label">Total investment</span>
                  <strong>{formatCurrency(overview?.interventionCost)}</strong>
                </div>
                <div className="roi-summary-card">
                  <span className="roi-summary-card__label">Net savings</span>
                  <strong>{formatCurrency(netSavings)}</strong>
                </div>
                <div className="roi-summary-card">
                  <span className="roi-summary-card__label">ROI band</span>
                  <strong>{roiStatus(roi)}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="roi-page__section">
            <div className="roi-page__section-header">
              <div>
                <h2 className="roi-page__section-title">Outcomes summary</h2>
                <p className="roi-page__section-copy">Demonstrates business and care quality outcomes tied to interventions.</p>
              </div>
            </div>
            <div className="outcomes-summary-grid">
              {outcomesSummary.map((item) => (
                <div className="outcomes-card" key={item.label}>
                  <span className="outcomes-card__label">{item.label}</span>
                  <strong className="outcomes-card__value">
                    {item.value}
                    {item.unit}
                  </strong>
                  <p className="outcomes-card__detail">{item.detail}</p>
                </div>
              ))}
            </div>
            <div className="roi-page__section">
              <h3 className="roi-page__subheading">Outcome measure performance</h3>
              <div className="roi-page__measure-layout">
                <div className="outcome-chart-card">
                  <BarChart
                    data={outcomesSummary.map((item) => ({
                      label: item.label,
                      value: Number(item.value) || 0,
                      valueLabel: `${item.value}${item.unit}`,
                    }))}
                  />
                </div>
                <div className="data-table__wrapper">
                  <table className="data-table outcome-table">
                    <thead>
                      <tr>
                        <th>Measure</th>
                        <th>Current</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outcomeMeasures.map((item) => (
                        <tr key={item.id}>
                          <td>{item.measure}</td>
                          <td>{item.value}</td>
                          <td>{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </section>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
