import '../styles/pages.css';

export default function DonutChart({ data = [105, 17, 6, 0, 0], labels = ['Very High', 'High', 'Moderate', 'Low', 'Very Low'] }) {
  const total = data.reduce((sum, value) => sum + value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  // Calculate percentages
  const percentages = data.map((value) => (total === 0 ? 0 : Math.round((value / total) * 100)));

  // Accumulate segments for stacked circular rendering
  let accumulatedPercent = 0;
  // Colors for: Very High, High, Moderate, Low, Very Low
  const chartColors = ['#EF4444', '#F97316', '#F59E0B', '#3E64FF', '#10B981'];

  const coloredSegments = data.map((value, index) => {
    const percent = total === 0 ? 0 : (value / total) * 100;
    const dash = (percent / 100) * circumference;
    // Calculate the stroke-dashoffset to stack segments sequentially
    const offset = circumference - (accumulatedPercent / 100) * circumference;
    accumulatedPercent += percent;

    return {
      dashArray: `${dash} ${circumference - dash}`,
      dashOffset: offset,
      color: chartColors[index] || '#cbd5e1',
    };
  });

  return (
    <div className="donut-chart-container">
      <div className="donut-chart__graphic">
        <svg viewBox="0 0 120 120" className="donut-chart__svg" aria-hidden="true">
          {/* Base track circle */}
          <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
          
          {/* Segments */}
          {coloredSegments.map((segment, index) => (
            <circle
              key={index}
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth="12"
              strokeDasharray={segment.dashArray}
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="butt"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          ))}
        </svg>
        
        {/* Center label */}
        <div className="donut-chart__center">
          <span className="donut-chart__center-number">{total}</span>
          <span className="donut-chart__center-text">Patient</span>
        </div>
      </div>

      {/* Legend on the right side */}
      <div className="donut-chart__legend">
        {labels.map((label, index) => {
          return (
            <div className="donut-chart__legend-item" key={label}>
              <div className="donut-chart__legend-badge">
                <span className="donut-chart__legend-percentage">{percentages[index]}%</span>
                <span className="donut-chart__legend-dot" style={{ backgroundColor: chartColors[index] || '#cbd5e1' }} />
              </div>
              <span className="donut-chart__legend-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
