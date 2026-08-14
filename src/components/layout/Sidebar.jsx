import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Activity, TrendingUp, BarChart3, ClipboardList, Settings, DollarSign } from 'lucide-react';
import '../../styles/sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const mainNavItems = [
    { id: 'dashboard', path: '/', icon: Home, label: 'Dashboard' },
    { id: 'members', path: '/members', icon: Users, label: 'Members' },
    { id: 'prediction', path: '/prediction', icon: Activity, label: 'Prediction' },
    { id: 'analytics', path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'roi', path: '/roi', icon: DollarSign, label: 'ROI Dashboard' },
    { id: 'care-plans', path: '/care-plans', icon: ClipboardList, label: 'Care Plans' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`} id="sidebar">
        {/* Brand Logo - Styled blue circle with letter 'J' */}
        <div className="sidebar__brand">
          <div className="sidebar__logo-circle">
            <span className="sidebar__logo-letter">J</span>
          </div>
        </div>

        {/* Middle Navigation Group */}
        <nav className="sidebar__nav" aria-label="Main navigation">
          <div className="sidebar__nav-group">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={`sidebar__link-btn ${isActive ? 'sidebar__link-btn--active' : ''}`}
                  onClick={onClose}
                  id={`nav-${item.id}`}
                  title={item.label}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </NavLink>
              );
            })}
          </div>
        </nav>

      </aside>
    </>
  );
}
