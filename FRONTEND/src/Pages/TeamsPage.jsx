import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../Context/AuthContext.jsx';
import TeamCard from '../Components/TeamCard.jsx';
import FilterPanel from '../Components/FilterPanel.jsx';
import Pagination from '../Components/Pagination.jsx';
import { Layers, Loader2, PlusCircle, Search } from 'lucide-react';

export const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchTeams = async () => {
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
      const res = await api.get(`/api/teams?${queryParams.toString()}`);
      setTeams(res.data.data.teams || []);
      setPagination(res.data.data.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [page, filters]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTeams();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <Layers className="text-primary" size={28} /> Browse Teams
          </h1>
          <p className="text-sm text-base-content/60 mt-1">Discover teams seeking collaborators for innovative projects.</p>
        </div>

        <div className="flex w-full md:w-auto gap-2 items-center">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="join w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search teams..." 
              className="input input-bordered input-sm join-item grow rounded-l-xl text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm join-item rounded-r-xl font-bold">
              <Search size={14} />
            </button>
          </form>

          <Link to="/teams/create" className="btn btn-primary btn-sm rounded-xl font-bold gap-1 shrink-0">
            <PlusCircle size={14} /> Create Team
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel 
            onApplyFilters={handleApplyFilters} 
            showProjectType={true} 
          />
        </div>

        {/* Teams List */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {loading ? (
            <div className="flex justify-center items-center py-20 min-h-[40vh]">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-20 bg-base-100 border border-border rounded-2xl flex flex-col items-center justify-center gap-3">
              <Layers size={48} className="text-base-content/25" />
              <h3 className="font-extrabold text-lg">No teams found</h3>
              <p className="text-sm text-base-content/65 max-w-sm">No public teams matching your query are active. Be the first to build a team!</p>
              <Link to="/teams/create" className="btn btn-primary btn-sm rounded-xl mt-2">
                Create a Team
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <TeamCard key={team._id} team={team} />
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
    </div>
  );
};

export default TeamsPage;
