import '../styles/pages.css';
import { getRiskTierClass } from '../utils/formatters.js';

export default function RiskBadge({ tier }) {
  const label = tier || 'Unknown';
  const className = getRiskTierClass(tier);

  return <span className={`risk-badge risk-badge--${className}`}>{label}</span>;
}
