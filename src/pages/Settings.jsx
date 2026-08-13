import { Settings } from 'lucide-react';
import PagePlaceholder from '../components/PagePlaceholder';

export default function SettingsPage() {
  return (
    <PagePlaceholder
      icon={Settings}
      title="Settings"
      description="Configure application preferences, user roles, notification rules, and integration settings."
    />
  );
}
