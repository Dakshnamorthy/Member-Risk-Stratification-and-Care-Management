import { HelpCircle } from 'lucide-react';
import PagePlaceholder from '../components/PagePlaceholder';

export default function Help() {
  return (
    <PagePlaceholder
      icon={HelpCircle}
      title="Help & Support"
      description="Access documentation, FAQs, onboarding guides, and contact support for assistance."
    />
  );
}
