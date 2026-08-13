import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { fetchMemberById } from '../services/dataService.js';
import Button from '../components/Button.jsx';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRiskScore,
  formatRiskTier,
  getRiskTierClass,
  safeDisplay,
} from '../utils/formatters.js';
import AiRiskAnalysis from '../components/AiRiskAnalysis.jsx';
import '../styles/pages.css';

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-row__label">{label}</span>
      <span className="detail-row__value">{safeDisplay(value, 'Not available')}</span>
    </div>
  );
}



export default function MemberDetail() {
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMember() {
      setStatus('loading');
      setError(null);

      try {
        const loadedMember = await fetchMemberById(memberId);
        if (!loadedMember) {
          setError('Member not found.');
          setStatus('error');
          return;
        }

        setMember(loadedMember);
        setStatus('ready');
      } catch (err) {
        setError('Unable to load member details. Please try again later.');
        setStatus('error');
      }
    }

    if (memberId) {
      loadMember();
    }
  }, [memberId]);

  const healthConditions = useMemo(() => {
    if (!member?.conditions || member.conditions.length === 0) return [];
    return member.conditions;
  }, [member]);

  const utilizationItems = useMemo(() => {
    if (!member) return [];

    const items = [];
    if (member.utilization?.inpatientAdmissions !== null && member.utilization?.inpatientAdmissions !== undefined) {
      items.push({ label: 'Inpatient admissions', value: formatNumber(member.utilization.inpatientAdmissions) });
    }
    if (member.utilization?.outpatientVisits !== null && member.utilization?.outpatientVisits !== undefined) {
      items.push({ label: 'Outpatient visits', value: formatNumber(member.utilization.outpatientVisits) });
    }
    if (member.utilization?.edVisits !== null && member.utilization?.edVisits !== undefined) {
      items.push({ label: 'ED visits', value: formatNumber(member.utilization.edVisits) });
    }
    if (member.utilization?.totalVisits !== null && member.utilization?.totalVisits !== undefined) {
      items.push({ label: 'Total visits', value: formatNumber(member.utilization.totalVisits) });
    }

    if (member.metadata?.plan) {
      items.push({ label: 'Carrier', value: safeDisplay(member.metadata.plan, 'Not available') });
    }
    if (member.pharmacy?.cost !== null && member.pharmacy?.cost !== undefined) {
      items.push({ label: 'Pharmacy spend', value: formatCurrency(member.pharmacy.cost) });
    }

    return items;
  }, [member]);

  const costItems = useMemo(() => {
    if (!member) return [];

    const items = [];
    if (member.costs?.medical !== null && member.costs?.medical !== undefined) {
      items.push({ label: 'Medical cost', value: formatCurrency(member.costs.medical) });
    }
    if (member.costs?.pharmacy !== null && member.costs?.pharmacy !== undefined) {
      items.push({ label: 'Pharmacy cost', value: formatCurrency(member.costs.pharmacy) });
    }
    if (member.costs?.total !== null && member.costs?.total !== undefined) {
      items.push({ label: 'Total cost', value: formatCurrency(member.costs.total) });
    }
    return items;
  }, [member]);
  const clinicalItems = useMemo(() => {
    if (!member) return [];

    const items = [];
    if (member.clinical?.status) {
      items.push({ label: 'Clinical status', value: member.clinical.status });
    }
    if (member.clinical?.vitals?.hr) {
      items.push({ label: 'Heart rate', value: `${member.clinical.vitals.hr} bpm` });
    }
    if (member.clinical?.vitals?.bp) {
      items.push({ label: 'Blood pressure', value: member.clinical.vitals.bp });
    }
    if (member.clinical?.vitals?.spo2) {
      items.push({ label: 'SpO2', value: `${member.clinical.vitals.spo2}%` });
    }
    if (member.pharmacy?.activeMedications !== null && member.pharmacy?.activeMedications !== undefined) {
      items.push({ label: 'Active medications', value: formatNumber(member.pharmacy.activeMedications) });
    }
    if (member.pharmacy?.monthlySupply !== null && member.pharmacy?.monthlySupply !== undefined) {
      items.push({ label: 'Monthly supply', value: `${member.pharmacy.monthlySupply} days` });
    }

    return items;
  }, [member]);

  return (
    <div className="member-detail">
      <div className="member-detail__toolbar">
        <Link to="/members">
          <Button variant="secondary">
            <ArrowLeft size={16} />
            Back to members
          </Button>
        </Link>
        <div className="member-detail__status">
          <ShieldAlert size={16} />
          <span>Member profile</span>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="member-detail__state">Loading member details…</div>
      ) : status === 'error' ? (
        <div className={`member-detail__state ${error === 'Member not found.' ? 'member-detail__state--not-found' : 'member-detail__state--error'}`}>
          <h2>{error === 'Member not found.' ? 'Member not found' : 'Unable to load member details'}</h2>
          <p>{error === 'Member not found.' ? 'The requested member ID does not exist in the registry.' : 'Please try again or contact system support.'}</p>
          <Link to="/members">
            <Button variant="primary">Return to member registry</Button>
          </Link>
        </div>
      ) : (
        <div className="member-detail__card">
          <div className="member-detail__heading">
            <div>
              <p className="member-detail__eyebrow">CareGuard AI member profile</p>
              <h1>{safeDisplay(member.id, 'Unknown member')}</h1>
              <p className="member-detail__meta">Member record overview and care risk snapshot</p>
            </div>
            <div className="member-detail__pill-row">
              <span className={`risk-badge risk-badge--${getRiskTierClass(member.risk.tier)}`}>
                {formatRiskTier(member.risk.tier)} risk
              </span>
              <span>{healthConditions.length} recorded condition{healthConditions.length === 1 ? '' : 's'}</span>
              <span>Last visit {formatDate(member.metadata.lastVisit)}</span>
            </div>
          </div>

          <div className="member-detail__profile-grid">
            <section className="member-detail__section member-detail__section--compact">
              <h2>Member identity summary</h2>
              <DetailRow label="Member ID" value={member.id} />
              <DetailRow label="Age" value={member.age} />
              <DetailRow label="Gender" value={member.gender} />
              <DetailRow label="Primary care physician" value={member.metadata.pcp} />
              <DetailRow label="Care manager" value={member.metadata.careManager} />
              <DetailRow label="Carrier" value={member.metadata.plan} />
              <DetailRow label="Enrollment date" value={formatDate(member.metadata.enrollmentDate)} />
              <DetailRow label="Member status" value={member.metadata.status} />
            </section>
            <section className="member-detail__section member-detail__section--compact">
              <h2>Clinical status & pharmacy</h2>
              {clinicalItems.length > 0 ? (
                clinicalItems.map((item) => (
                  <DetailRow key={item.label} label={item.label} value={item.value} />
                ))
              ) : (
                <p className="member-detail__empty-state">Clinical data is not available.</p>
              )}
            </section>

            <section className="member-detail__section member-detail__section--compact">
              <h2>Healthcare utilization</h2>
              {utilizationItems.length > 0 ? (
                utilizationItems.map((item) => (
                  <DetailRow key={item.label} label={item.label} value={item.value} />
                ))
              ) : (
                <p className="member-detail__empty-state">Utilization data is not available.</p>
              )}
            </section>

            <section className="member-detail__section member-detail__section--compact">
              <h2>Cost overview</h2>
              {costItems.length > 0 ? (
                costItems.map((item) => (
                  <DetailRow key={item.label} label={item.label} value={item.value} />
                ))
              ) : (
                <p className="member-detail__empty-state">Cost information is not available.</p>
              )}
            </section>
            <section className="member-detail__section member-detail__section--full-width">
              <h2>Health conditions</h2>
              {healthConditions.length > 0 ? (
                <ul className="member-detail__conditions member-detail__conditions--chips">
                  {healthConditions.map((condition) => (
                    <li key={condition}>{condition}</li>
                  ))}
                </ul>
              ) : (
                <p className="member-detail__empty-state">No condition data available for this member.</p>
              )}
            </section>


            <section className="member-detail__section member-detail__section--full-width">
              <AiRiskAnalysis member={member} />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
