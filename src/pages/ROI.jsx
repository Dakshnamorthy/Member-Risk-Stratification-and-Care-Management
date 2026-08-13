import { useEffect, useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { fetchRoiOverview, fetchRoiTrend, fetchInterventionPerformance, fetchOutcomesSummary, fetchOutcomeMeasures } from '../services/roiService.js';
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
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchRoiOverview(),
      fetchRoiTrend(),
      fetchInterventionPerformance(),
      fetchOutcomesSummary(),
      fetchOutcomeMeasures(),
    ])
      .then(([overviewData, trendData, perfData, summaryData, measuresData]) => {
        setOverview(overviewData);
        setTrend(trendData);
        setPerformance(perfData);
        setOutcomesSummary(summaryData);
        setOutcomeMeasures(measuresData);
      })
      .catch(() => setError('Unable to load ROI and outcomes analytics.'));
  }, []);

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
        </>
      )}
    </div>
  );
}
