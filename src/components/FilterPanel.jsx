import '../styles/pages.css';

export default function FilterPanel({ children, title }) {
  return (
    <div className="filter-panel">
      <div className="filter-panel__header">
        <h2>{title}</h2>
      </div>
      <div className="filter-panel__controls">{children}</div>
    </div>
  );
}
