import { LayoutDashboard } from 'lucide-react';
import '../styles/pages.css';

export default function PagePlaceholder({ icon: Icon = LayoutDashboard, title, description }) {
  return (
    <div className="page-placeholder">
      <div className="page-placeholder__icon">
        <Icon size={36} />
      </div>
      <h2 className="page-placeholder__title">{title}</h2>
      <p className="page-placeholder__description">{description}</p>
      <div className="page-placeholder__badge">
        <LayoutDashboard size={14} />
        Coming Soon
      </div>
    </div>
  );
}
