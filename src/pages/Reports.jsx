import { FileText } from 'lucide-react';
import PagePlaceholder from '../components/PagePlaceholder';

export default function Reports() {
  return (
    <PagePlaceholder
      icon={FileText}
      title="Reports"
      description="Generate and export compliance, outcomes, and risk stratification reports for stakeholders."
    />
  );
}
