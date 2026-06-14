import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, useAuth } from '../Context/AuthContext.jsx';
import { Calendar, MapPin, Users, Plus, Award, Filter, Search } from 'lucide-react';
import Pagination from '../Components/Pagination.jsx';

export const HackathonsPage = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('upcoming'); // upcoming, ongoing, past
  const [mode, setMode] = useState(''); // online, offline, hybrid
  const [selectedTag, setSelectedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      let url = `/api/hackathons?page=${currentPage}&limit=6&coming=${timeframe}`;
      if (mode) {
        url += `&mode=${mode}`;
      }
      if (selectedTag) {
        url += `&tags=${selectedTag}`;
      }
      
      const res = await api.get(url);
      setHackathons(res.data.data.hackathons || []);
      setTotalPages(res.data.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching hackathons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [currentPage, timeframe, mode, selectedTag]);

  const handleResetFilters = () => {
    setMode('');
    setSelectedTag('');
    setTimeframe('upcoming');
    setCurrentPage(1);
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const tagOptions = ['Web3', 'AI/ML', 'Fintech', 'Edtech', 'Healthcare', 'Social Impact', 'Beginner Friendly', 'Hardware'];

  const getModeBadge = (mode) => {
    switch (mode) {
      case 'online':
        return 'badge-info text-info-content';
      case 'offline':
        return 'badge-primary text-primary-content';
      case 'hybrid':
        return 'badge-secondary text-secondary-content';
      default:
        return 'badge-ghost';
    }
  };

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent to-secondary p-8 md:p-12 mb-8 shadow-lg shadow-accent/20 text-white">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pointer-events-none">
          <Calendar size={400} className="translate-x-1/4 translate-y-1/4 scale-150 rotate-12" />
        </div>

        <div className="relative z-10 max-w-2xl flex flex-col gap-4">
          <span className="badge bg-white/20 border-none font-bold text-xs uppercase text-white tracking-widest px-3 py-1.5 rounded-lg">Hackathons Directory</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Hackathon Directory</h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Find the hottest upcoming university and national hackathons. Form a team, register, and build prototype solutions to win prizes!
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            {isOrganizer && (
              <Link to="/hackathons/create" className="btn btn-neutral bg-white text-accent hover:bg-white/90 border-none rounded-xl btn-sm font-bold shadow-md shadow-black/10">
                <Plus size={14} className="mr-1" /> Host Hackathon
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs & Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8 pb-4 border-b border-border">
        {/* Timeframe Tabs */}
        <div className="tabs tabs-boxed bg-base-200 p-1 rounded-xl">
          <button 
            className={`tab rounded-lg text-xs font-bold ${timeframe === 'upcoming' ? 'tab-active bg-primary text-white hover:bg-primary' : 'text-base-content/60'}`}
            onClick={() => { setTimeframe('upcoming'); setCurrentPage(1); }}
          >
            Upcoming
          </button>
          <button 
            className={`tab rounded-lg text-xs font-bold ${timeframe === 'ongoing' ? 'tab-active bg-primary text-white hover:bg-primary' : 'text-base-content/60'}`}
            onClick={() => { setTimeframe('ongoing'); setCurrentPage(1); }}
          >
            Ongoing
          </button>
          <button 
            className={`tab rounded-lg text-xs font-bold ${timeframe === 'past' ? 'tab-active bg-primary text-white hover:bg-primary' : 'text-base-content/60'}`}
            onClick={() => { setTimeframe('past'); setCurrentPage(1); }}
          >
            Past
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            className="select select-bordered select-sm rounded-xl text-xs font-bold"
            value={mode}
            onChange={(e) => { setMode(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Modes</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <select 
            className="select select-bordered select-sm rounded-xl text-xs font-bold"
            value={selectedTag}
            onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Topics</option>
            {tagOptions.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <button onClick={handleResetFilters} className="btn btn-ghost hover:bg-base-200 btn-sm rounded-xl text-xs font-bold">
            Reset
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20 min-h-[30vh]">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : hackathons.length === 0 ? (
        <div className="card bg-base-100 border border-border p-16 text-center flex flex-col items-center justify-center min-h-[30vh] gap-3 rounded-2xl">
          <Calendar size={40} className="text-base-content/30" />
          <h3 className="font-extrabold text-base">No Hackathons Found</h3>
          <p className="text-xs text-base-content/50 max-w-sm">
            We couldn't find any hackathons matching your search parameters. Please try resetting your filters or check back later!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon) => {
              const daysLeft = Math.ceil((new Date(hackathon.registrationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={hackathon._id} className="card bg-base-100 border border-border shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between group">
                  <div>
                    {/* Banner Image */}
                    <div className="h-40 bg-gradient-to-br from-accent/5 to-secondary/5 border-b border-border relative overflow-hidden shrink-0">
                      <img 
                        src={hackathon.bannerURL || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop'} 
                        alt={hackathon.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                      <span className={`absolute top-3 right-3 badge ${getModeBadge(hackathon.mode)} font-extrabold text-[9px] px-2.5 py-1.5 border-none shadow-sm rounded-lg`}>
                        {hackathon.mode?.toUpperCase()}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col gap-3">
                      <h3 className="font-extrabold text-sm text-base-content line-clamp-1 group-hover:text-accent transition-colors">
                        {hackathon.title}
                      </h3>
                      
                      <div className="flex flex-col gap-1.5 text-[10px] font-bold text-base-content/50">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                        {hackathon.venue && (
                          <span className="flex items-center gap-1"><MapPin size={12} /> {hackathon.venue}</span>
                        )}
                        <span className="flex items-center gap-1"><Users size={12} /> {hackathon.registeredTeams?.length || 0} teams registered</span>
                      </div>

                      <p className="text-[11px] text-base-content/75 line-clamp-2 leading-relaxed font-normal mt-1">
                        {hackathon.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex flex-col gap-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {hackathon.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="badge badge-xs bg-base-200 border-none font-semibold text-[8px] rounded-md px-1.5 py-1 text-base-content/70">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Register Deadline Callout / View Button */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                      <div>
                        {daysLeft > 0 ? (
                          <p className="text-[9px] text-success font-extrabold">Reg. closes in {daysLeft}d</p>
                        ) : daysLeft === 0 ? (
                          <p className="text-[9px] text-warning font-extrabold">Reg. closes today!</p>
                        ) : (
                          <p className="text-[9px] text-base-content/40 font-extrabold">Registration closed</p>
                        )}
                      </div>

                      <Link to={`/hackathons/${hackathon._id}`} className="btn btn-ghost hover:bg-accent/5 hover:text-accent btn-xs font-bold rounded-lg text-[10px]">
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HackathonsPage;
