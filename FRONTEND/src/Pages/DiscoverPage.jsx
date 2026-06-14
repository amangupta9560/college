import React, { useState, useEffect } from 'react';
import { api } from '../Context/AuthContext.jsx';
import UserCard from '../Components/UserCard.jsx';
import FilterPanel from '../Components/FilterPanel.jsx';
import Pagination from '../Components/Pagination.jsx';
import InviteModal from '../Components/InviteModal.jsx';
import { Sparkles, Loader2, Search } from 'lucide-react';

export const DiscoverPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Invite Modal States
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 9,
        ...filters
      });
      if (search) {
        queryParams.append('q', search);
      }
      const res = await api.get(`/api/match/recommendations?${queryParams.toString()}`);
      setCandidates(res.data.data.candidates || []);
      setPagination(res.data.data.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [page, filters]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecommendations();
  };

  const handleOpenInvite = (candidateUser) => {
    setSelectedCandidate(candidateUser);
    setInviteModalOpen(true);
  };

  const handleSendInvite = async (payload) => {
    // Submit invitation to API
    await api.post('/api/invitations', payload);
    // Success toast or banner can go here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <Sparkles className="text-primary animate-pulse" size={28} /> Discover Teammates
          </h1>
          <p className="text-sm text-base-content/60 mt-1">Smart teammate matches scored by our compatibility matching engine.</p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="join w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search by name..." 
            className="input input-bordered input-sm join-item grow rounded-l-xl text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm join-item rounded-r-xl font-bold">
            <Search size={14} />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel 
            onApplyFilters={handleApplyFilters} 
            showAvailability={true} 
          />
        </div>

        {/* Candidates Grid */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {loading ? (
            <div className="flex justify-center items-center py-20 min-h-[40vh]">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-20 bg-base-100 border border-border rounded-2xl flex flex-col items-center justify-center gap-3">
              <Sparkles size={48} className="text-base-content/25 animate-pulse" />
              <h3 className="font-extrabold text-lg">No matching candidates found</h3>
              <p className="text-sm text-base-content/65 max-w-sm">Try broadening your filter criteria or adjusting your profile skills to match more students.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {candidates.map((candidate) => (
                  <UserCard 
                    key={candidate.user._id} 
                    candidate={candidate} 
                    onInvite={handleOpenInvite}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination 
                pagination={pagination} 
                onPageChange={(p) => setPage(p)} 
              />
            </>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal 
        isOpen={inviteModalOpen} 
        onClose={() => setInviteModalOpen(false)}
        candidate={selectedCandidate}
        onSubmit={handleSendInvite}
      />
    </div>
  );
};

export default DiscoverPage;
