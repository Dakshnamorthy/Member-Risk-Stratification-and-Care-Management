import '../styles/pages.css';
import { MoreVertical } from 'lucide-react';

function getInitials(name) {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(id) {
  const colors = [
    { bg: '#E8EEFF', text: '#3E64FF' },
    { bg: '#FEE2E2', text: '#EF4444' },
    { bg: '#FFFBEB', text: '#F59E0B' },
    { bg: '#E6FDF4', text: '#10B981' },
    { bg: '#F3E8FF', text: '#A855F7' },
  ];
  const index = id.charCodeAt(id.length - 1) % colors.length;
  return colors[index];
}

export default function DataTable({ rows = [] }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="table-empty-state">
        <p>No priority members available right now.</p>
      </div>
    );
  }

  // Slice to show first 5 priority patients, matching the mockup queue
  const displayRows = rows.slice(0, 5);

  return (
    <div className="data-table__wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>PATIENT</th>
            <th>ROOM</th>
            <th>CONDITION</th>
            <th>VITALS</th>
            <th>STATUS</th>
            <th style={{ textAlign: 'center' }}>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row) => {
            const clinical = row.clinical || { vitals: {} };
            const vitals = clinical.vitals || {};
            const colors = getAvatarColor(row.id);

            // Determine if vitals are abnormal
            const isHrAbnormal = vitals.hr && (vitals.hr > 100 || vitals.hr < 60);
            const isSpo2Abnormal = vitals.spo2 && vitals.spo2 < 93;
            const isTempAbnormal = vitals.temp && vitals.temp > 100;
            const isBpAbnormal = vitals.bp && (vitals.bp.startsWith('14') || vitals.bp.startsWith('15') || vitals.bp.startsWith('16'));

            return (
              <tr key={row.id}>
                {/* Patient avatar and name/demographics */}
                <td>
                  <div className="table-patient-cell">
                    <div
                      className="table-patient-avatar"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {getInitials(row.name || row.id)}
                    </div>
                    <div className="table-patient-info">
                      <span className="table-patient-name">{row.name || `Member ${row.id}`}</span>
                      <span className="table-patient-meta">
                        {row.gender || '—'}, {row.age ? `${row.age} yrs` : '—'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Room */}
                <td className="table-room-cell">{clinical.room || 'Outpatient'}</td>

                {/* Condition */}
                <td className="table-condition-cell">{clinical.condition || 'General Observation'}</td>

                {/* Vitals with conditional styling */}
                <td>
                  <div className="table-vitals-container">
                    {/* Render HR */}
                    {vitals.hr && (
                      <div className="table-vital-item">
                        <span className="table-vital-label">HR</span>
                        <span className={`table-vital-value ${isHrAbnormal ? 'table-vital-value--alert' : ''}`}>
                          {vitals.hr}
                        </span>
                      </div>
                    )}

                    {/* Render SpO2 */}
                    {vitals.spo2 && (
                      <div className="table-vital-item">
                        <span className="table-vital-label">SpO2</span>
                        <span className={`table-vital-value ${isSpo2Abnormal ? 'table-vital-value--alert' : ''}`}>
                          {vitals.spo2}%
                        </span>
                      </div>
                    )}

                    {/* Render Temp */}
                    {vitals.temp && (
                      <div className="table-vital-item">
                        <span className="table-vital-label">Temp</span>
                        <span className={`table-vital-value ${isTempAbnormal ? 'table-vital-value--alert' : ''}`}>
                          {vitals.temp}°F
                        </span>
                      </div>
                    )}

                    {/* Render BP */}
                    {vitals.bp && (
                      <div className="table-vital-item">
                        <span className="table-vital-label">BP</span>
                        <span className={`table-vital-value ${isBpAbnormal ? 'table-vital-value--alert' : ''}`}>
                          {vitals.bp}
                        </span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Clinical Status badge */}
                <td>
                  <span className={`status-badge status-badge--${String(clinical.status).toLowerCase()}`}>
                    {clinical.status || 'Stable'}
                  </span>
                </td>

                {/* Action button */}
                <td style={{ textAlign: 'center' }}>
                  <button className="table-action-btn" aria-label="More actions">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
