import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, PlusCircle } from 'lucide-react';
import { fetchCarePlans, patchCarePlan, saveCarePlans } from '../services/carePlanService.js';
import CarePlanCard from '../components/CarePlanCard.jsx';
import Button from '../components/Button.jsx';
import '../styles/pages.css';

const BOARD_COLUMNS = ['Identified', 'Contacted', 'Intervention In Progress', 'Follow-up', 'Completed'];
const STATUS_OPTIONS = ['Identified', 'Contacted', 'Intervention In Progress', 'Follow-up', 'Completed'];

export default function CarePlans() {
  const [carePlans, setCarePlans] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPlans() {
      setStatus('loading');
      setError(null);

      try {
        const plans = await fetchCarePlans();
        setCarePlans(plans);
        setStatus('ready');
      } catch (err) {
        setError('Unable to load care plans.');
        setStatus('error');
      }
    }

    loadPlans();
  }, []);

  const groupedPlans = useMemo(
    () =>
      BOARD_COLUMNS.reduce((acc, stage) => {
        acc[stage] = carePlans.filter((plan) => plan.status === stage);
        return acc;
      }, {}),
    [carePlans],
  );

  const handleStatusChange = async (plan) => {
    const currentIndex = STATUS_OPTIONS.indexOf(plan.status);
    const nextStatus = STATUS_OPTIONS[(currentIndex + 1) % STATUS_OPTIONS.length];

    try {
      const updatedPlan = await patchCarePlan(plan.id, { status: nextStatus });
      setCarePlans((currentPlans) => currentPlans.map((item) => (item.id === updatedPlan.id ? updatedPlan : item)));
    } catch {
      setError('Unable to update care plan status.');
    }
  };

  const handleAssignIntervention = async (plan) => {
    const nextIntervention = window.prompt(
      'Assign a new intervention for this member:',
      plan.recommendedIntervention || '',
    );
    if (nextIntervention === null) return;

    try {
      const updatedPlan = await patchCarePlan(plan.id, {
        recommendedIntervention: nextIntervention.trim() || plan.recommendedIntervention,
      });
      setCarePlans((currentPlans) => currentPlans.map((item) => (item.id === updatedPlan.id ? updatedPlan : item)));
    } catch {
      setError('Unable to assign intervention.');
    }
  };

  const handleAddPlan = async () => {
    const nextPlan = {
      memberId: `M-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
      riskTier: 'Moderate',
      riskScore: 12.5,
      recommendedIntervention: 'Initial outreach and care assessment',
      careManager: 'New Care Manager',
      status: 'Identified',
      dueDate: null,
      details: 'New care plan created from the care management board.',
    };
    const updatedPlans = [...carePlans, { ...nextPlan, id: `CP-${Date.now()}` }];
    await saveCarePlans(updatedPlans);
    setCarePlans(updatedPlans);
  };

  return (
    <div className="care-plans-page">
      <header className="care-plans-page__header">
        <div>
          <p className="care-plans-page__eyebrow">Care Management</p>
          <h1>Operational care plans and member workflows</h1>
        </div>
        <Button variant="primary" onClick={handleAddPlan}>
          <PlusCircle size={16} /> Add plan
        </Button>
      </header>

      {status === 'loading' ? (
        <div className="care-plans-page__state">Loading care plans…</div>
      ) : status === 'error' ? (
        <div className="care-plans-page__state care-plans-page__state--error">{error}</div>
      ) : (
        <div className="care-board">
          {BOARD_COLUMNS.map((column) => (
            <div key={column} className="care-board__column">
              <div className="care-board__column-header">
                <h2>{column}</h2>
                <span>{groupedPlans[column]?.length ?? 0}</span>
              </div>
              <div className="care-board__column-body">
                {groupedPlans[column]?.length > 0 ? (
                  groupedPlans[column].map((plan) => (
                    <CarePlanCard
                      key={plan.id}
                      plan={plan}
                      onStatusChange={handleStatusChange}
                      onAssignIntervention={handleAssignIntervention}
                    />
                  ))
                ) : (
                  <div className="care-board__empty">No plans in this stage.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
