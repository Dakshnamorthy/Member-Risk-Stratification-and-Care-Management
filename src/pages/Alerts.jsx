import { useEffect, useState } from 'react';
import { Bell, Filter } from 'lucide-react';
import { fetchAlerts, dismissAlert } from '../services/alertService.js';
import { filterAlertsByStatus, filterAlertsBySeverity, getSortedAlerts, getAlertStats } from '../utils/alertUtils.js';
import AlertCard from '../components/AlertCard.jsx';
import '../styles/pages.css';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unresolved', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
];

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAlerts()
      .then((data) => {
        setAlerts(data);
        setStats(getAlertStats(data));
      })
      .catch(() => setError('Unable to load alerts.'));
  }, []);

  useEffect(() => {
    let filtered = alerts;
    filtered = filterAlertsByStatus(filtered, filterStatus);
    filtered = filterAlertsBySeverity(filtered, filterSeverity);
    filtered = getSortedAlerts(filtered, 'severity-desc');
    setFilteredAlerts(filtered);
  }, [alerts, filterStatus, filterSeverity]);

  const handleDismiss = async (alertId) => {
    try {
      await dismissAlert(alertId);
      setAlerts((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((a) => a.id === alertId);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], status: 'resolved' };
        }
        return updated;
      });
    } catch {
      setError('Failed to dismiss alert.');
    }
  };

  return (
    <div className="alerts-page">
      <header className="alerts-page__header">
        <div>
          <p className="alerts-page__eyebrow">Care Operations</p>
          <h1 className="alerts-page__title">Alert Center</h1>
          <p className="alerts-page__description">
            Monitor operational alerts and care-management events across your member population.
          </p>
        </div>
        <div className="alerts-page__badge">
          <Bell size={24} />
          Demo data only
        </div>
      </header>

      {stats ? (
        <section className="alerts-stats-grid">
          <div className="alerts-stat-card">
            <span className="alerts-stat-card__label">Total alerts</span>
            <strong className="alerts-stat-card__value">{stats.total}</strong>
          </div>
          <div className="alerts-stat-card alerts-stat-card--critical">
            <span className="alerts-stat-card__label">Critical</span>
            <strong className="alerts-stat-card__value">{stats.critical}</strong>
          </div>
          <div className="alerts-stat-card alerts-stat-card--high">
            <span className="alerts-stat-card__label">High</span>
            <strong className="alerts-stat-card__value">{stats.high}</strong>
          </div>
          <div className="alerts-stat-card alerts-stat-card--medium">
            <span className="alerts-stat-card__label">Medium</span>
            <strong className="alerts-stat-card__value">{stats.medium}</strong>
          </div>
          <div className="alerts-stat-card alerts-stat-card--resolved">
            <span className="alerts-stat-card__label">Resolved</span>
            <strong className="alerts-stat-card__value">{stats.resolved}</strong>
          </div>
        </section>
      ) : null}

      <section className="alerts-page__controls">
        <div className="alerts-page__filter-group">
          <div className="alerts-page__control">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="alerts-page__control">
            <label htmlFor="severity-filter">Severity</label>
            <select
              id="severity-filter"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="alerts-page__result-count">
          Showing {filteredAlerts.length} of {alerts.length} alerts
        </div>
      </section>

      {error ? (
        <div className="alerts-page__state alerts-page__state--error">{error}</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="alerts-page__empty-state">
          <Filter size={48} />
          <h2>No alerts match your filters</h2>
          <p>Adjust your filters or check back later for new alerts.</p>
        </div>
      ) : (
        <section className="alerts-list">
          {filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onDismiss={handleDismiss} />
          ))}
        </section>
      )}
    </div>
  );
}
