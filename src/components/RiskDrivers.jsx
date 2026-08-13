import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatNumber, safeDisplay } from '../utils/formatters.js';

function DriverDirection({ direction }) {
  if (direction === 'up') {
    return (
      <span className="risk-driver__direction risk-driver__direction--up">
        <ArrowUpRight size={14} /> Increased
      </span>
    );
  }

  if (direction === 'down') {
    return (
      <span className="risk-driver__direction risk-driver__direction--down">
        <ArrowDownRight size={14} /> Decreased
      </span>
    );
  }

  return <span className="risk-driver__direction">Stable</span>;
}

export default function RiskDrivers({ drivers = [] }) {
  const hasDrivers = Array.isArray(drivers) && drivers.length > 0;

  return (
    <div className="risk-drivers">
      <div className="risk-drivers__header">
        <div>
          <h3>Risk drivers</h3>
          <p className="risk-drivers__subtitle">Factors that most influence the predicted risk score.</p>
        </div>
        <span className="risk-drivers__note">Demo explanation data; not an actual model output.</span>
      </div>

      {hasDrivers ? (
        <div className="risk-drivers__list">
          {drivers.map((driver) => (
            <div className="risk-driver" key={`${driver.feature}-${driver.contribution}-${driver.direction}`}>
              <div className="risk-driver__meta">
                <strong>{safeDisplay(driver.label, driver.feature)}</strong>
                <span className="risk-driver__feature">{safeDisplay(driver.feature, 'Unknown feature')}</span>
              </div>
              <div className="risk-driver__stats">
                <span className="risk-driver__value">{formatNumber(driver.contribution, 'en-US')}</span>
                <DriverDirection direction={driver.direction} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="risk-drivers__empty">
          No risk driver information is currently available for this member.
        </div>
      )}
    </div>
  );
}
