import '../styles/pages.css';

export default function KpiCard({ label, value, icon: Icon, variant = 'default', subtitle }) {
  return (
    <div className={`kpi-card kpi-card--${variant}`}>
      <div className="kpi-card__head">
        <span className="kpi-card__label">{label}</span>
        {Icon ? (
          <span className="kpi-card__icon">
            <Icon size={18} />
          </span>
        ) : null}
      </div>

      <div className="kpi-card__value">{value}</div>
      {subtitle ? <p className="kpi-card__subtitle">{subtitle}</p> : null}
    </div>
  );
}
