import { Link } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import { formatAlertTime, getSeverityClass, getSeverityLabel, getAlertTypeIcon } from '../utils/alertUtils.js';
import '../styles/pages.css';

export default function AlertCard({ alert, onDismiss }) {
  return (
    <div className={`alert-card ${getSeverityClass(alert.severity)} alert-card--${alert.status}`}>
      <div className="alert-card__header">
        <div className="alert-card__icon-badge">
          <span className="alert-card__icon">{getAlertTypeIcon(alert.type)}</span>
        </div>
        <div className="alert-card__title-section">
          <h3 className="alert-card__title">{alert.type}</h3>
          <p className="alert-card__member">
            {alert.memberName} (ID: {alert.memberId})
          </p>
        </div>
        <div className="alert-card__meta">
          <span className="alert-card__time">{formatAlertTime(alert.timestamp)}</span>
          <span className={`alert-card__status alert-card__status--${alert.status}`}>
            {alert.status === 'resolved' ? 'Resolved' : 'Active'}
          </span>
        </div>
      </div>

      <p className="alert-card__description">{alert.description}</p>

      <div className="alert-card__footer">
        <div className="alert-card__severity-badge">
          <span>{getSeverityLabel(alert.severity)}</span>
        </div>
        <div className="alert-card__actions">
          <Link to={alert.actionUrl} className="alert-card__action-link">
            <span>{alert.actionLabel}</span>
            <ChevronRight size={14} />
          </Link>
          {alert.status === 'unresolved' && onDismiss ? (
            <button
              className="alert-card__dismiss-btn"
              onClick={() => onDismiss(alert.id)}
              aria-label="Dismiss alert"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
