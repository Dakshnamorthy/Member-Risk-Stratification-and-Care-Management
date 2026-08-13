import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronRight, Activity, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchMembers } from '../services/dataService.js';
import DataTable from '../components/DataTable.jsx';
import DonutChart from '../components/DonutChart.jsx';
import Button from '../components/Button.jsx';
import { formatRiskTier, formatRiskScore, getRiskTierClass } from '../utils/formatters.js';
import '../styles/pages.css';

export default function RiskStratification() {
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    setStatus('loading');
    setError(null);
    try {
      const data = await fetchMembers();
      // Sort members by 30-day risk score descending by default
      data.sort((a, b) => (b.risk.score30d || 0) - (a.risk.score30d || 0));
      setMembers(data);
      setStatus('ready');
    } catch (err) {
      setError('Unable to load risk stratification data. Please try again.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tierDistribution = useMemo(() => {
    const dist = { Critical: 0, 'Very High': 0, High: 0, Moderate: 0, Low: 0 };
    members.forEach((m) => {
      const tier = formatRiskTier(m.risk.tier);
      if (dist[tier] !== undefined) dist[tier]++;
    });
    return dist;
  }, [members]);

  const donutData = [
    tierDistribution.Critical,
    tierDistribution['Very High'],
    tierDistribution.High,
    tierDistribution.Moderate,
    tierDistribution.Low,
  ];
  
  const donutLabels = ['Critical', 'Very High', 'High', 'Moderate', 'Low'];

  // Calculate some KPIs
  const highRiskCount = tierDistribution.Critical + tierDistribution['Very High'] + tierDistribution.High;
  const criticalCount = tierDistribution.Critical;
  
  // Format for the DataTable
  const tableData = members.map(m => ({
    id: m.id,
    name: m.name,
    score30: m.risk.score30d,
    score60: m.risk.score60d,
    score90: m.risk.score90d,
    tier: m.risk.tier,
    rawMember: m,
  }));

  return (
    <div className="risk-stratification-page">
      <header className="risk-stratification-page__header">
        <div>
          <p className="risk-stratification-page__eyebrow">Population Health</p>
          <h1>Risk Stratification Platform</h1>
          <p className="risk-stratification-page__description">
            Predictive AI models risk-score the population across 30, 60, and 90-day windows to drive targeted interventions.
          </p>
        </div>
        <div className="risk-stratification-page__badge">
          <AlertTriangle size={18} />
          <span>ML Predictions Active</span>
        </div>
      </header>

      {status === 'loading' ? (
        <div className="dashboard__state dashboard__state--loading">Analyzing population risk...</div>
      ) : status === 'error' ? (
        <div className="dashboard__state dashboard__state--error">
          <p>{error}</p>
          <Button onClick={loadData}>Retry</Button>
        </div>
      ) : (
        <>
          <section className="risk-stratification-grid">
            <div className="risk-summary-card">
              <div className="risk-summary-card__header">
                <h2>Tier Distribution</h2>
              </div>
              <div style={{ height: '250px', padding: '1rem' }}>
                <DonutChart data={donutData} labels={donutLabels} />
              </div>
            </div>

            <div className="risk-kpi-container">
              <div className="kpi-card kpi-card--primary">
                <div className="kpi-card__head">
                  <span className="kpi-card__label">High Risk & Above</span>
                  <Activity size={16} />
                </div>
                <div className="kpi-card__value">{highRiskCount}</div>
                <p className="kpi-card__subtitle">Members requiring care management.</p>
              </div>

              <div className="kpi-card kpi-card--danger">
                <div className="kpi-card__head">
                  <span className="kpi-card__label">Critical Risk</span>
                  <Target size={16} />
                </div>
                <div className="kpi-card__value">{criticalCount}</div>
                <p className="kpi-card__subtitle">Immediate intervention recommended.</p>
              </div>
            </div>
          </section>

          <section className="risk-table-section">
            <div className="risk-table-header">
              <h2>Population Risk Registry</h2>
            </div>
            
            <div className="risk-table-wrapper data-table__wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Current Tier</th>
                    <th>30-Day Risk</th>
                    <th>60-Day Risk</th>
                    <th>90-Day Risk</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="table-member-info">
                          <span className="table-member-name">{row.name || 'Unknown'}</span>
                          <span className="table-member-id">{row.id}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`risk-badge risk-badge--${getRiskTierClass(row.tier)}`}>
                          {formatRiskTier(row.tier)}
                        </span>
                      </td>
                      <td>{formatRiskScore(row.score30)}</td>
                      <td>{formatRiskScore(row.score60)}</td>
                      <td>{formatRiskScore(row.score90)}</td>
                      <td>
                        <Button variant="secondary" onClick={() => navigate(`/members/${row.id}`)}>
                          Manage <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
