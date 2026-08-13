import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  Activity,
  AlertCircle,
  Clock,
  CalendarDays
} from 'lucide-react';
import { fetchDashboardStats, fetchMembers } from '../services/dataService.js';
import DonutChart from '../components/DonutChart.jsx';
import DataTable from '../components/DataTable.jsx';
import Button from '../components/Button.jsx';
import '../../src/styles/pages.css';

export default function Dashboard() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    setStatus('loading');
    setError(null);

    try {
      const [membersData, statsData] = await Promise.all([fetchMembers(), fetchDashboardStats()]);
      setMembers(membersData);
      setStats(statsData);
      setStatus('ready');
    } catch (err) {
      setError('Unable to load dashboard data. Please try again.');
      setStatus('error');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const isEmpty = status === 'ready' && members.length === 0;

  // Filter members for Priority Patient Queue (Critical and Watch status)
  const priorityMembers = members.filter((member) => 
    member.clinical && ['Critical', 'Watch'].includes(member.clinical.status)
  );

  // Derived metrics from stats
  const totalPatients = stats?.totalMembers || 0;
  const hosp30 = stats?.hospitalization30dCount || 0;
  const hosp60 = stats?.hospitalization60dCount || 0;
  const hosp90 = stats?.hospitalization90dCount || 0;

  // Donut values: Very High, High, Moderate, Low, Very Low
  const donutData = stats?.tierDistribution ? [
    stats.tierDistribution['Very High'] || 0,
    stats.tierDistribution['High'] || 0,
    stats.tierDistribution['Moderate'] || 0,
    stats.tierDistribution['Low'] || 0,
    stats.tierDistribution['Very Low'] || 0,
  ] : [];

  return (
    <div className="dashboard-container">
      {status === 'loading' ? (
        <div className="dashboard__state dashboard__state--loading">Loading predictive models and population data...</div>
      ) : status === 'error' ? (
        <div className="dashboard__state dashboard__state--error">
          <p>{error}</p>
          <Button onClick={loadDashboardData}>Retry</Button>
        </div>
      ) : isEmpty ? (
        <div className="dashboard__state dashboard__state--empty">
          <h2>No population data available</h2>
          <p>Once member data is loaded via the ML pipeline, predictive insights will appear here.</p>
        </div>
      ) : (
        <>
          {/* Dashboard Header Bar */}
          <div className="dashboard__top-bar">
            <div>
              <h1 className="dashboard__greeting-title">Predictive AI Dashboard</h1>
            </div>
            <div className="dashboard__actions">
              <button className="btn-filter-settings" aria-label="Filters">
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <section className="dashboard__kpi-grid">
            {/* Card 1: Total Patients */}
            <div className="kpi-card-custom kpi-card-custom--active">
              <div className="kpi-card-custom__head">
                <span className="kpi-card-custom__value">{totalPatients.toLocaleString()}</span>
                <span className="kpi-card-custom__icon-wrapper">
                  <Activity size={18} />
                </span>
              </div>
              <div className="kpi-card-custom__label">Total Patients Processed</div>
              <div className="kpi-card-custom__sparkline">
                <div className="sparkline-bar" style={{ height: '35%' }}></div>
                <div className="sparkline-bar" style={{ height: '50%' }}></div>
                <div className="sparkline-bar" style={{ height: '40%' }}></div>
                <div className="sparkline-bar" style={{ height: '75%' }}></div>
                <div className="sparkline-bar" style={{ height: '90%' }}></div>
              </div>
            </div>

            {/* Card 2: Hospitalization 30 Days */}
            <div className="kpi-card-custom kpi-card-custom--urgent">
              <div className="kpi-card-custom__head">
                <span className="kpi-card-custom__value">
                  {hosp30.toLocaleString()}
                </span>
                <span className="kpi-card-custom__icon-wrapper icon-wrapper--urgent">
                  <AlertCircle size={18} />
                </span>
              </div>
              <div className="kpi-card-custom__label">Hospitalization &lt; 30 Days</div>
              <div className="kpi-card-custom__sub-alert">High likelihood prediction</div>
            </div>

            {/* Card 3: Hospitalization 60 Days */}
            <div className="kpi-card-custom kpi-card-custom--reviews">
              <div className="kpi-card-custom__head">
                <span className="kpi-card-custom__value">{hosp60.toLocaleString()}</span>
                <span className="kpi-card-custom__icon-wrapper icon-wrapper--reviews">
                  <Clock size={18} />
                </span>
              </div>
              <div className="kpi-card-custom__label">Hospitalization &lt; 60 Days</div>
              <div className="kpi-card-custom__sub-reviews">Moderate-term risk</div>
            </div>

            {/* Card 4: Hospitalization 90 Days */}
            <div className="kpi-card-custom kpi-card-custom--watchlist">
              <div className="kpi-card-custom__head">
                <span className="kpi-card-custom__value">{hosp90.toLocaleString()}</span>
                <span className="kpi-card-custom__icon-wrapper icon-wrapper--watchlist">
                  <CalendarDays size={18} />
                </span>
              </div>
              <div className="kpi-card-custom__label">Hospitalization &lt; 90 Days</div>
              <div className="kpi-card-custom__sub-watchlist">Long-term risk</div>
            </div>
          </section>

          {/* Tier Cards Grid */}
          <section className="dashboard__tier-grid">
            <div className="kpi-card-custom clickable-tier-card" style={{ borderTop: '4px solid #EF4444', cursor: 'pointer' }} onClick={() => navigate('/members?tier=Very High')}>
              <div className="kpi-card-custom__head">
                <span className="kpi-card-custom__value">{donutData[0]?.toLocaleString() || 0}</span>
              </div>
              <div className="kpi-card-custom__label">Very High Risk</div>
            </div>
            <div className="kpi-card-custom clickable-tier-card" style={{ borderTop: '4px solid #F97316', cursor: 'pointer' }} onClick={() => navigate('/members?tier=High')}>
              <div className="kpi-card-custom__head">
                <span className="kpi-card-custom__value">{donutData[1]?.toLocaleString() || 0}</span>
              </div>
              <div className="kpi-card-custom__label">High Risk</div>
            </div>
            <div className="kpi-card-custom clickable-tier-card" style={{ borderTop: '4px solid #F59E0B', cursor: 'pointer' }} onClick={() => navigate('/members?tier=Moderate')}>
              <div className="kpi-card-custom__head">
                <span className="kpi-card-custom__value">{donutData[2]?.toLocaleString() || 0}</span>
              </div>
              <div className="kpi-card-custom__label">Moderate Risk</div>
            </div>
            <div className="kpi-card-custom clickable-tier-card" style={{ borderTop: '4px solid #3E64FF', cursor: 'pointer' }} onClick={() => navigate('/members?tier=Low')}>
              <div className="kpi-card-custom__head">
                <span className="kpi-card-custom__value">{donutData[3]?.toLocaleString() || 0}</span>
              </div>
              <div className="kpi-card-custom__label">Low Risk</div>
            </div>
            <div className="kpi-card-custom clickable-tier-card" style={{ borderTop: '4px solid #10B981', cursor: 'pointer' }} onClick={() => navigate('/members?tier=Very Low')}>
              <div className="kpi-card-custom__head">
                <span className="kpi-card-custom__value">{donutData[4]?.toLocaleString() || 0}</span>
              </div>
              <div className="kpi-card-custom__label">Very Low Risk</div>
            </div>
          </section>

          {/* Main Dashboard Columns */}
          <div className="dashboard__content-layout">
            
            {/* Left Column: Priority Patient Queue */}
            <div className="dashboard__left-col">
              <div className="dashboard__block-card">
                <div className="dashboard__block-header">
                  <h2 className="dashboard__block-title">Highest Risk Patients (Watchlist)</h2>
                  <button className="btn-view-all-link">View All</button>
                </div>
                <DataTable rows={priorityMembers} />
              </div>
            </div>

            {/* Right Column: Quick Actions & Risk Distribution */}
            <div className="dashboard__right-col">
              {/* Patient Risk Distribution Chart Card */}
              <div className="dashboard__block-card" style={{ height: '100%' }}>
                <h2 className="dashboard__block-title block-title--donut">5-Tier Risk Stratification</h2>
                <DonutChart data={donutData} labels={['Very High', 'High', 'Moderate', 'Low', 'Very Low']} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
