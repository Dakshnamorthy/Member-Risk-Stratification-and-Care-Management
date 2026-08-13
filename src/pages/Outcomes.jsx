import { useEffect, useState } from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { fetchOutcomesSummary, fetchOutcomeMeasures } from '../services/roiService.js';
import BarChart from '../components/BarChart.jsx';
import '../styles/pages.css';

export default function Outcomes() {
  const [summary, setSummary] = useState([]);
  const [measures, setMeasures] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchOutcomesSummary(), fetchOutcomeMeasures()])
      .then(([summaryData, measuresData]) => {
        setSummary(summaryData);
        setMeasures(measuresData);
      })
      .catch(() => setError('Unable to load outcome analytics.'));
  }, []);

  return (
    <div className="outcomes-page">
      <header className="roi-page__header">
        <div>
          <p className="roi-page__eyebrow">Care Quality</p>
          <h1 className="roi-page__title">Outcomes Tracker</h1>
          <p className="roi-page__description">
            Monitor patient outcomes, intervention effectiveness, and care program performance.
          </p>
        </div>
        <div className="roi-page__badge">
          <Activity size={24} />
          Demo data only
        </div>
      </header>

      {error ? (
        <div className="roi-page__state roi-page__state--error">{error}</div>
      ) : (
        <>
          <section className="outcomes-summary-grid">
            {summary.map((item) => (
              <div className="outcomes-card" key={item.label}>
                <span className="outcomes-card__label">{item.label}</span>
                <strong className="outcomes-card__value">
                  {item.value}
                  {item.unit}
                </strong>
                <p className="outcomes-card__detail">{item.detail}</p>
              </div>
            ))}
          </section>

          <section className="roi-page__section">
            <div className="roi-page__section-header">
              <div>
                <h2 className="roi-page__section-title">Outcome measure performance</h2>
                <p className="roi-page__section-copy">Review the latest care management outcome indicators.</p>
              </div>
            </div>
            <div className="roi-page__measure-layout">
              <div className="outcome-chart-card">
                <BarChart
                  valueKey="normalizedValue"
                  data={summary.map((item) => {
                    let normalizedValue = item.value;
                    if (item.label.includes('Members engaged')) normalizedValue = (item.value / 200) * 100;
                    else if (item.label.includes('improvement')) normalizedValue = (item.value / 10) * 100;
                    return {
                      label: item.label,
                      normalizedValue: Number(normalizedValue) || 0,
                      valueLabel: `${item.value}${item.unit}`,
                    };
                  })}
                />
              </div>
              <div className="data-table__wrapper">
                <table className="data-table outcome-table" style={{ border: 'none', boxShadow: 'none' }}>
                  <thead>
                    <tr>
                      <th style={{ backgroundColor: 'transparent', color: '#6B7280', fontSize: '11px', letterSpacing: '0.05em' }}>MEASURE</th>
                      <th style={{ backgroundColor: 'transparent', color: '#6B7280', fontSize: '11px', letterSpacing: '0.05em' }}>CURRENT</th>
                      <th style={{ backgroundColor: 'transparent', color: '#6B7280', fontSize: '11px', letterSpacing: '0.05em' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measures.map((item) => (
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
          </section>
        </>
      )}
    </div>
  );
}
