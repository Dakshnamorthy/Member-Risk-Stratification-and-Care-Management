import { useEffect, useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchMembers } from '../services/dataService.js';
import { applyMemberFilters, getMemberFilterOptions, getPaginationMetadata, paginate } from '../services/memberListService.js';
import { formatRiskScore, safeDisplay } from '../utils/formatters.js';
import FilterPanel from '../components/FilterPanel.jsx';
import Pagination from '../components/Pagination.jsx';
import RiskBadge from '../components/RiskBadge.jsx';
import Button from '../components/Button.jsx';
import '../styles/pages.css';

const DEFAULT_PAGE_SIZE = 10;
const initialFilters = {
  search: '',
  riskTier: 'All',
  ageGroup: 'All',
  condition: 'All',
  riskWindow: 'All',
};

export default function Members() {
  const [searchParams] = useSearchParams();
  const initialTier = searchParams.get('tier') || 'All';
  
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({ ...initialFilters, riskTier: initialTier });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadMembers() {
      setStatus('loading');
      setError(null);

      try {
        const loadedMembers = await fetchMembers();
        setMembers(loadedMembers);
        setStatus('ready');
      } catch (err) {
        setError('Unable to load members. Please try again.');
        setStatus('error');
      }
    }

    loadMembers();
  }, []);

  const filterOptions = useMemo(() => getMemberFilterOptions(members), [members]);
  const filteredMembers = useMemo(() => applyMemberFilters(members, filters), [members, filters]);
  const { total, totalPages } = useMemo(() => getPaginationMetadata(filteredMembers, DEFAULT_PAGE_SIZE), [filteredMembers]);
  const currentPageMembers = useMemo(() => paginate(filteredMembers, DEFAULT_PAGE_SIZE, currentPage), [filteredMembers, currentPage]);

  const setFilterValue = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    setStatus('loading');
    setError(null);
    setMembers([]);
    setFilters(initialFilters);
    setCurrentPage(1);
    fetchMembers()
      .then((data) => {
        setMembers(data);
        setStatus('ready');
      })
      .catch(() => {
        setError('Unable to load members. Please try again.');
        setStatus('error');
      });
  };

  return (
    <div className="members-page">
      <header className="members-page__header">
        <div>
          <p className="members-page__eyebrow">Member Registry</p>
          <h1 className="members-page__title">Find and prioritize Medicare members</h1>
        </div>
        <div className="members-page__badge">
          <Users size={20} />
          <span>Normalized member data</span>
        </div>
      </header>

      {status === 'loading' ? (
        <div className="members-page__state">Loading members…</div>
      ) : status === 'error' ? (
        <div className="members-page__state members-page__state--error">
          <p>{error}</p>
          <Button onClick={handleRetry}>Retry</Button>
        </div>
      ) : members.length === 0 ? (
        <div className="members-page__state members-page__state--empty">
          <h2>No member data available</h2>
          <p>Connect to your member source or add sample data to begin prioritization.</p>
        </div>
      ) : (
        <>
          <section className="members-page__filters">
            <FilterPanel title="Search and filters">
              <div className="filter-grid">
                <div className="filter-field">
                  <label htmlFor="risk-tier-select">Risk tier</label>
                  <select id="risk-tier-select" value={filters.riskTier} onChange={(event) => setFilterValue('riskTier', event.target.value)}>
                    <option value="All">All</option>
                    {filterOptions.riskTiers.map((tier) => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="age-group-select">Age group</label>
                  <select id="age-group-select" value={filters.ageGroup} onChange={(event) => setFilterValue('ageGroup', event.target.value)}>
                    <option value="All">All</option>
                    {filterOptions.ageGroups.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="condition-select">Condition</label>
                  <select id="condition-select" value={filters.condition} onChange={(event) => setFilterValue('condition', event.target.value)}>
                    <option value="All">All</option>
                    {filterOptions.conditions.map((condition) => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="risk-window-select">Risk window</label>
                  <select id="risk-window-select" value={filters.riskWindow} onChange={(event) => setFilterValue('riskWindow', event.target.value)}>
                    <option value="All">All</option>
                    {filterOptions.riskWindows.map((window) => (
                      <option key={window} value={window}>{window}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="filter-actions">
                <Button variant="secondary" onClick={resetFilters}>Reset filters</Button>
              </div>
            </FilterPanel>
          </section>

          <section className="members-page__summary">
            <div>{total} members match the current filters</div>
            <div>Page {currentPage} of {totalPages}</div>
          </section>

          {currentPageMembers.length === 0 ? (
            <div className="members-page__state members-page__state--empty">
              <h2>No members match these filters</h2>
              <p>Try expanding your search or removing a filter.</p>
            </div>
          ) : (
            <div className="responsive-table">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Member ID</th>
                    <th>Age</th>
                    <th>Risk Tier</th>
                    <th>30D Risk</th>
                    <th>60D Risk</th>
                    <th>90D Risk</th>
                    <th>Conditions</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageMembers.map((member) => (
                    <tr key={member.id}>
                      <td>{safeDisplay(member.id)}</td>
                      <td>{safeDisplay(member.age)}</td>
                      <td><RiskBadge tier={member.risk?.tier} /></td>
                      <td>{formatRiskScore(member.risk?.score30d)}</td>
                      <td>{formatRiskScore(member.risk?.score60d)}</td>
                      <td>{formatRiskScore(member.risk?.score90d)}</td>
                      <td>{Array.isArray(member.conditions) && member.conditions.length > 0 ? member.conditions.join(', ') : '—'}</td>
                      <td>
                        <Link to={`/members/${encodeURIComponent(member.id)}`} className="button button--secondary">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages))} />
        </>
      )}
    </div>
  );
}
