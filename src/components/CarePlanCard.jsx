import { Link } from 'react-router-dom';
import RiskBadge from './RiskBadge.jsx';
import Button from './Button.jsx';
import '../styles/pages.css';

export default function CarePlanCard({ plan, onStatusChange, onAssignIntervention }) {
  const { id, memberId, riskTier, riskScore, recommendedIntervention, careManager, status, dueDate, details } = plan;

  return (
    <article className="care-plan-card">
      <div className="care-plan-card__header">
        <div>
          <p className="care-plan-card__id">{id}</p>
          <h3 className="care-plan-card__member">Member {memberId}</h3>
        </div>
        <RiskBadge tier={riskTier} />
      </div>

      <div className="care-plan-card__body">
        <div className="care-plan-card__row">
          <span className="care-plan-card__label">Status</span>
          <span>{status || 'Unknown'}</span>
        </div>
        <div className="care-plan-card__row">
          <span className="care-plan-card__label">Risk score</span>
          <strong>{riskScore !== null && riskScore !== undefined ? `${riskScore}%` : 'Not available'}</strong>
        </div>
        <div className="care-plan-card__row">
          <span className="care-plan-card__label">Recommendation</span>
          <span>{recommendedIntervention || 'Not available'}</span>
        </div>
        <div className="care-plan-card__row">
          <span className="care-plan-card__label">Care manager</span>
          <span>{careManager || 'Unassigned'}</span>
        </div>
        <div className="care-plan-card__row">
          <span className="care-plan-card__label">Due date</span>
          <span>{dueDate || 'Not set'}</span>
        </div>
      </div>

      <div className="care-plan-card__actions">
        <Button variant="secondary" onClick={() => onStatusChange(plan)}>
          Change status
        </Button>
        <Button variant="secondary" onClick={() => onAssignIntervention?.(plan)}>
          Assign intervention
        </Button>
        <Link to={`/members/${encodeURIComponent(memberId)}`} className="button button--primary">
          Open member
        </Link>
      </div>

      <div className="care-plan-card__details">
        <p>{details || 'No additional details available.'}</p>
      </div>
    </article>
  );
}
