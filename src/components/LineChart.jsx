import '../styles/pages.css';

export default function LineChart({ series = [], labels = [] }) {
  const maxValue = Math.max(...series.flatMap((item) => item.data), 1);
  const width = 280;
  const height = 160;
  const padding = 24;

  const points = series.map((item) =>
    item.data
      .map((value, index) => {
        const x = padding + (index / Math.max(labels.length - 1, 1)) * (width - padding * 2);
        const y = height - padding - (value / maxValue) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(' '),
  );

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="line-chart__svg" role="img" aria-label="Risk outlook chart">
        <g className="line-chart__grid">
          {[0, 1, 2, 3].map((row) => (
            <line
              key={row}
              x1={padding}
              x2={width - padding}
              y1={padding + (row / 3) * (height - padding * 2)}
              y2={padding + (row / 3) * (height - padding * 2)}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
        </g>
        {points.map((path, index) => (
          <polyline
            key={index}
            fill="none"
            stroke={['#5B65DC', '#122056', '#C7D4FF'][index] || '#5B65DC'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={path}
          />
        ))}
        <g className="line-chart__labels">
          {labels.map((label, index) => (
            <text key={label} x={padding + (index / Math.max(labels.length - 1, 1)) * (width - padding * 2)} y={height - 6} textAnchor="middle" fontSize="10" fill="#6B7280">
              {label}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
