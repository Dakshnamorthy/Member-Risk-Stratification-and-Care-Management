import { ShieldCheck } from 'lucide-react';
import PagePlaceholder from '../components/PagePlaceholder';

export default function Compliance() {
  return (
    <PagePlaceholder
      icon={ShieldCheck}
      title="Compliance"
      description="Monitor regulatory compliance, HIPAA audit logs, and quality measure adherence."
    />
  );
}
