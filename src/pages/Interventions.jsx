import { useEffect, useMemo, useState } from 'react';
import { HeartPulse } from 'lucide-react';
import {
  assignInterventionToMember,
  fetchInterventionsWithAssignmentCounts,
  fetchInterventionAssignments,
} from '../services/interventionService.js';
import InterventionCard from '../components/InterventionCard.jsx';
import Button from '../components/Button.jsx';
import '../styles/pages.css';

const SAMPLE_MEMBERS = ['M-001', 'M-002', 'M-003', 'M-004', 'M-005'];

export default function Interventions() {
  const [interventions, setInterventions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(SAMPLE_MEMBERS[0]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      setStatus('loading');
      setError(null);

      try {
        const [available, assigned] = await Promise.all([
          fetchInterventionsWithAssignmentCounts(),
          fetchInterventionAssignments(),
        ]);
        setInterventions(available);
        setAssignments(assigned);
        setStatus('ready');
      } catch {
        setError('Unable to load interventions.');
        setStatus('error');
      }
    }

    loadData();
  }, []);

  const assignedCounts = useMemo(() => {
    return assignments.reduce((acc, assignment) => {
      acc[assignment.memberId] = (acc[assignment.memberId] || 0) + 1;
      return acc;
    }, {});
  }, [assignments]);

  const handleAssign = async (intervention) => {
    if (!selectedMemberId) return;

    try {
      await assignInterventionToMember(selectedMemberId, intervention.id);
      const [updatedInterventions, updatedAssignments] = await Promise.all([
        fetchInterventionsWithAssignmentCounts(),
        fetchInterventionAssignments(),
      ]);
      setInterventions(updatedInterventions);
      setAssignments(updatedAssignments);
      setSuccessMessage(`${intervention.name} assigned to member ${selectedMemberId}.`);
      window.setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      setError('Unable to assign intervention.');
    }
  };

  const assignedToSelectedMember = assignments.filter((assignment) => assignment.memberId === selectedMemberId);

  return (
    <div className="interventions-page">
      <header className="interventions-page__header">
        <div>
          <p className="interventions-page__eyebrow">Interventions</p>
          <h1>Care manager intervention library</h1>
        </div>
        <div className="interventions-page__summary">
          <div className="interventions-page__summary-item">
            <strong>{interventions.length}</strong>
            <span>configured interventions</span>
          </div>
          <div className="interventions-page__summary-item">
            <strong>{assignedToSelectedMember.length}</strong>
            <span>assigned to {selectedMemberId}</span>
          </div>
        </div>
      </header>

      <div className="interventions-page__controls">
        <label htmlFor="member-select">Select member for assignment</label>
        <select
          id="member-select"
          value={selectedMemberId}
          onChange={(event) => setSelectedMemberId(event.target.value)}
        >
          {SAMPLE_MEMBERS.map((memberId) => (
            <option key={memberId} value={memberId}>
              {memberId}
            </option>
          ))}
        </select>
      </div>

      {status === 'loading' ? (
        <div className="interventions-page__state">Loading interventions…</div>
      ) : status === 'error' ? (
        <div className="interventions-page__state interventions-page__state--error">{error}</div>
      ) : (
        <div className="interventions-grid">
          {interventions.map((intervention) => (
            <InterventionCard key={intervention.id} intervention={intervention} onSelect={handleAssign} />
          ))}
        </div>
      )}

      {successMessage ? <div className="interventions-page__toast">{successMessage}</div> : null}
    </div>
  );
}
