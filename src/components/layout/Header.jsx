import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Mail, ChevronDown, LogOut } from 'lucide-react';
import { routes } from '../../utils/routes';
import drRobertsAvatar from '../../assets/dr_roberts.png';
import '../../styles/header.css';

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState('Dr. Roberts');

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.name) {
          setUserName(parsed.name);
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, []);

  // Find current route info for title
  const currentRoute = routes.find((r) => r.path === location.pathname) || {
    title: 'Page',
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/members/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="header" id="header">
      {/* Left - Search and Toggle */}
      <div className="header__left">
        <button
          className="header__menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
          id="header-menu-toggle"
        >
          <Menu size={20} />
        </button>

        <form className="header__search" onSubmit={handleSearch}>
          <Search size={18} className="header__search-icon" />
          <input
            type="text"
            className="header__search-input"
            placeholder="Search Member ID (e.g., M-015)..."
            aria-label="Search Member ID"
            id="header-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Right - Profile and Logout */}
      <div className="header__right">
        {/* Logout Button */}
        <button
          className="header__icon-btn"
          aria-label="Log out"
          id="header-logout"
          onClick={handleLogout}
          title="Log out"
        >
          <LogOut size={20} />
        </button>

        {/* User Profile */}
        <div className="header__profile" id="header-profile">
          <div className="header__avatar-wrapper">
            <img
              src={drRobertsAvatar}
              alt="Dr. Roberts"
              className="header__profile-avatar-img"
            />
          </div>
          <div className="header__profile-info">
            <span className="header__profile-name">{userName}</span>
            <span className="header__profile-role">Attending Physician</span>
          </div>
          <ChevronDown size={16} className="header__profile-chevron" />
        </div>
      </div>
    </header>
  );
}
