import { useEffect, useState, useMemo } from 'react';
import { BarChart3, Users, Target, Activity, DollarSign, BrainCircuit, ShieldAlert } from 'lucide-react';
import { fetchMembers, fetchDashboardStats } from '../services/memberService.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import '../../src/styles/pages.css';

export default function Analytics() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [membersData, statsData] = await Promise.all([
          fetchMembers(),
          fetchDashboardStats()
        ]);
        setMembers(membersData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute specific metrics dynamically
  const { highRiskCount, highRiskPct, readmissionRate, conditionRiskData, cohortData } = useMemo(() => {
    if (!members.length || !stats) return { highRiskCount: 0, highRiskPct: 0, readmissionRate: 0, conditionRiskData: [], cohortData: [] };

    const hrCount = (stats.tierDistribution['High'] || 0) + (stats.tierDistribution['Very High'] || 0);
    const hrPct = ((hrCount / members.length) * 100).toFixed(1);
    const readmitRate = ((stats.hospitalization90dCount / members.length) * 100).toFixed(1);

    // Condition Average Risk Map
    const cStats = {
      'Diabetes': { count: 0, riskSum: 0 },
      'CHF': { count: 0, riskSum: 0 },
      'COPD': { count: 0, riskSum: 0 },
      'CKD': { count: 0, riskSum: 0 },
      'Ischemic Heart Disease': { count: 0, riskSum: 0 }
    };

    // Cohorts
    let edCohort = { count: 0, riskSum: 0, costSum: 0 };
    let chfHighRisk = { count: 0, riskSum: 0, costSum: 0 };
    let elderlyPoly = { count: 0, riskSum: 0, costSum: 0 };

    members.forEach(m => {
      const riskScore = m.risk.score90d || 0;
      const cost = m.costs.total || 0;

      // Map conditions
      m.conditions.forEach(c => {
        if (cStats[c]) {
          cStats[c].count++;
          cStats[c].riskSum += riskScore;
        }
      });

      // Map cohorts
      if (m.utilization.edVisits >= 3) {
        edCohort.count++;
        edCohort.riskSum += riskScore;
        edCohort.costSum += cost;
      }
      
      if ((m.risk.tier === 'High' || m.risk.tier === 'Very High') && m.conditions.includes('CHF')) {
        chfHighRisk.count++;
        chfHighRisk.riskSum += riskScore;
        chfHighRisk.costSum += cost;
      }

      if (m.age >= 75 && m.pharmacy.activeMedications >= 5) {
        elderlyPoly.count++;
        elderlyPoly.riskSum += riskScore;
        elderlyPoly.costSum += cost;
      }
    });

    const condData = Object.keys(cStats).map(c => ({
      condition: c === 'Ischemic Heart Disease' ? 'IHD' : c,
      avgRisk: cStats[c].count > 0 ? Number((cStats[c].riskSum / cStats[c].count).toFixed(1)) : 0
    }));

    const cohorts = [
      {
        name: "Frequent ED Utilizers (3+ visits)",
        count: edCohort.count,
        avgRisk: edCohort.count > 0 ? (edCohort.riskSum / edCohort.count).toFixed(1) : 0,
        avgCost: edCohort.count > 0 ? Math.round(edCohort.costSum / edCohort.count) : 0,
        topDriver: "Acute Exacerbation / ED History"
      },
      {
        name: "High-Risk CHF Cohort",
        count: chfHighRisk.count,
        avgRisk: chfHighRisk.count > 0 ? (chfHighRisk.riskSum / chfHighRisk.count).toFixed(1) : 0,
        avgCost: chfHighRisk.count > 0 ? Math.round(chfHighRisk.costSum / chfHighRisk.count) : 0,
        topDriver: "Heart Failure Progression"
      },
      {
        name: "Elderly Polypharmacy (Age 75+, 5+ meds)",
        count: elderlyPoly.count,
        avgRisk: elderlyPoly.count > 0 ? (elderlyPoly.riskSum / elderlyPoly.count).toFixed(1) : 0,
        avgCost: elderlyPoly.count > 0 ? Math.round(elderlyPoly.costSum / elderlyPoly.count) : 0,
        topDriver: "Medication Adherence / Frailty"
      }
    ];

    return { highRiskCount: hrCount, highRiskPct: hrPct, readmissionRate: readmitRate, conditionRiskData: condData, cohortData: cohorts };
  }, [members, stats]);

  // Static Mock Data for ML Feature Importance
  const featureImportanceData = [
    { feature: 'Prior Inpatient Admissions', importance: 0.18 },
    { feature: 'Emergency Dept Visits (LTM)', importance: 0.14 },
    { feature: 'Comorbid CHF', importance: 0.11 },
    { feature: 'Age > 75', importance: 0.08 },
    { feature: 'Polypharmacy (>5 meds)', importance: 0.06 },
  ];

  if (loading) {
    return <div className="page-placeholder"><div className="page-placeholder__title">Processing population analytics...</div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard__top-bar">
        <div>
          <h1 className="dashboard__greeting-title">Risk Analytics & Population Insights</h1>
        </div>
      </div>

      {/* Top KPIs */}
      <section className="dashboard__kpi-grid">
        <div className="kpi-card-custom">
          <div className="kpi-card-custom__head">
            <span className="kpi-card-custom__value">{members.length.toLocaleString()}</span>
            <span className="kpi-card-custom__icon-wrapper"><Users size={18} /></span>
          </div>
          <div className="kpi-card-custom__label">Total Population Analyzed</div>
        </div>

        <div className="kpi-card-custom">
          <div className="kpi-card-custom__head">
            <span className="kpi-card-custom__value">94.2%</span>
            <span className="kpi-card-custom__icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <BrainCircuit size={18} />
            </span>
          </div>
          <div className="kpi-card-custom__label">Global Model AUC-ROC</div>
          <div className="kpi-card-custom__sub-watchlist" style={{ color: '#10B981' }}>High Confidence</div>
        </div>

        <div className="kpi-card-custom kpi-card-custom--urgent">
          <div className="kpi-card-custom__head">
            <span className="kpi-card-custom__value">{highRiskCount.toLocaleString()}</span>
            <span className="kpi-card-custom__icon-wrapper icon-wrapper--urgent"><ShieldAlert size={18} /></span>
          </div>
          <div className="kpi-card-custom__label">High/Very High Risk Cohort</div>
          <div className="kpi-card-custom__sub-alert">{highRiskPct}% of total population</div>
        </div>

        <div className="kpi-card-custom">
          <div className="kpi-card-custom__head">
            <span className="kpi-card-custom__value">{readmissionRate}%</span>
            <span className="kpi-card-custom__icon-wrapper" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#F97316' }}>
              <Activity size={18} />
            </span>
          </div>
          <div className="kpi-card-custom__label">Proj. 90-Day Adm. Rate</div>
        </div>
      </section>

      {/* Visualizations Row */}
      <div className="analytics-charts-grid">
        {/* Chart A: Feature Importance */}
        <div className="dashboard__block-card">
          <h2 className="dashboard__block-title">Global Feature Importance (Macro SHAP)</h2>
          <p className="analytics-subtitle">Top features driving predicted risk across the entire population.</p>
          <div className="chart-container" style={{ height: '300px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportanceData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} style={{ fontSize: '12px', fill: '#4B5563' }} width={120} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="importance" fill="#3E64FF" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Risk by Condition */}
        <div className="dashboard__block-card">
          <h2 className="dashboard__block-title">Average 90-Day Risk by Condition</h2>
          <p className="analytics-subtitle">Risk severity distribution among major chronic disease groups.</p>
          <div className="chart-container" style={{ height: '300px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conditionRiskData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="condition" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(249, 115, 22, 0.05)'}} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }} 
                  formatter={(value) => [`${value}%`, 'Avg Risk Score']}
                />
                <Bar dataKey="avgRisk" fill="#F97316" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Cohort Table */}
      <div className="dashboard__block-card analytics-cohort-table" style={{ marginTop: '24px' }}>
        <h2 className="dashboard__block-title">Targetable High-Risk Cohorts</h2>
        <div className="data-table__wrapper" style={{ marginTop: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>COHORT SEGMENT</th>
                <th>TOTAL PATIENTS</th>
                <th>AVG 90-DAY RISK</th>
                <th>EST. AVG COST (YTD)</th>
                <th>TOP RISK DRIVER</th>
              </tr>
            </thead>
            <tbody>
              {cohortData.map((cohort, idx) => (
                <tr key={idx}>
                  <td><span className="table-patient-name">{cohort.name}</span></td>
                  <td className="table-vital-value">{cohort.count.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${cohort.avgRisk > 75 ? 'status-badge--critical' : 'status-badge--watch'}`}>
                      {cohort.avgRisk}%
                    </span>
                  </td>
                  <td className="table-condition-cell">${cohort.avgCost.toLocaleString()}</td>
                  <td className="table-patient-meta">{cohort.topDriver}</td>
                </tr>
              ))}
              {cohortData.length === 0 && (
                <tr><td colSpan="5" style={{textAlign: 'center'}}>Calculating cohorts...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
