import Button from './Button.jsx';
import '../styles/pages.css';

export default function InterventionCard({ intervention, onSelect }) {
  const {
    name,
    description,
    targetRiskLevel,
    applicableConditions,
    status,
    estimatedCost,
    successRate,
    memberCount,
  } = intervention;

  return (
    <article className="intervention-card">
      <div className="intervention-card__header">
        <div>
          <p className="intervention-card__title">{name}</p>
          <p className="intervention-card__tag">{targetRiskLevel}</p>
        </div>
        <span className="intervention-card__status">{status}</span>
      </div>

      <p className="intervention-card__description">{description}</p>

      <div className="intervention-card__meta">
        <div>
          <strong>{estimatedCost ? `$${estimatedCost}` : 'N/A'}</strong>
          <span>Estimated cost</span>
        </div>
        <div>
          <strong>{successRate ? `${successRate}%` : 'N/A'}</strong>
          <span>Success rate</span>
        </div>
        <div>
          <strong>{memberCount != null ? memberCount : 'N/A'}</strong>
          <span>Member count</span>
        </div>
      </div>

      <div className="intervention-card__conditions">
        {Array.isArray(applicableConditions) && applicableConditions.length > 0 ? (
          applicableConditions.map((condition) => (
            <span key={condition} className="intervention-card__condition">
              {condition}
            </span>
          ))
        ) : (
          <span className="intervention-card__condition">General</span>
        )}
      </div>

      <Button variant="secondary" onClick={() => onSelect(intervention)}>
        Assign intervention
      </Button>
    </article>
  );
}
