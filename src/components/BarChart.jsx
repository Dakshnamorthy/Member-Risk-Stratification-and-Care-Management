import '../styles/pages.css';

export default function BarChart({ data = [], valueKey = 'value', labelKey = 'label' }) {
  const maxValue = Math.max(...data.map((item) => Number(item[valueKey]) || 0), 1);

  return (
    <div className="bar-chart">
      {data.map((item) => {
        const value = Number(item[valueKey]) || 0;
        const width = maxValue > 0 ? (value / maxValue) * 100 : 0;
        return (
          <div className="bar-chart__row" key={item[labelKey] || item.id}>
            <span className="bar-chart__label">{item[labelKey]}</span>
            <div className="bar-chart__track">
              <div className="bar-chart__fill" style={{ width: `${width}%` }} />
            </div>
            <span className="bar-chart__value">{item.valueLabel ?? value}</span>
          </div>
        );
      })}
    </div>
  );
}
