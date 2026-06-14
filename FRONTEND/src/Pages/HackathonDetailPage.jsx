import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, useAuth } from '../Context/AuthContext.jsx';
import { ArrowLeft, Calendar, MapPin, Award, Users, ExternalLink, ShieldAlert, CheckCircle, Edit3, Trash2, HelpCircle } from 'lucide-react';

export const HackathonDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Registration
  const [userTeams, setUserTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [registering, setRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  const fetchHackathonDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/hackathons/${id}`);
      setHackathon(res.data.data.hackathon);
    } catch (err) {
      console.error(err);
      setError('Hackathon not found or inactive.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLedTeams = async () => {
    if (!user) return;
    try {
      // Fetch public teams and filter those led by this user and not registered to any hackathon
      const res = await api.get(`/api/teams?limit=50`);
      const teams = res.data.data.teams || [];
      const ledTeams = teams.filter(t => {
        const isLeader = t.leader?._id === user._id || t.leader === user._id;
        return isLeader && !t.hackathon;
      });
      setUserTeams(ledTeams);
      if (ledTeams.length > 0) {
        setSelectedTeamId(ledTeams[0]._id);
      }
    } catch (err) {
      console.error('Error fetching user teams:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchHackathonDetails();
      fetchUserLedTeams();
    }
  }, [id, user]);

  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    
    if (!selectedTeamId) {
      return setRegError('Please select a team to register.');
    }

    setRegistering(true);
    try {
      const res = await api.post(`/api/hackathons/${id}/register`, { teamId: selectedTeamId });
      setRegSuccess('Your team has been successfully registered!');
      
      // Refresh details and user teams list
      fetchHackathonDetails();
      fetchUserLedTeams();
    } catch (err) {
      console.error(err);
      setRegError(err.response?.data?.message || 'Failed to register team.');
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteHackathon = async () => {
    if (!window.confirm('Are you sure you want to delete this hackathon? All associated registrations will be affected.')) return;
    
    try {
      await api.delete(`/api/hackathons/${id}`);
      navigate('/hackathons');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete hackathon.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-4">
        <h2 className="text-xl font-bold">{error || 'Hackathon not found'}</h2>
        <Link to="/hackathons" className="btn btn-primary btn-sm rounded-xl">Back to Directory</Link>
      </div>
    );
  }

  const isOrganizer = hackathon.organizer?._id === user?._id || hackathon.organizer === user?._id;
  const isAdmin = user?.role === 'admin';
  const isRegistrationClosed = new Date() > new Date(hackathon.registrationDeadline);
  const daysLeftReg = Math.ceil((new Date(hackathon.registrationDeadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/hackathons')}
          className="btn btn-ghost btn-sm rounded-xl font-bold text-xs gap-1 hover:bg-base-200"
        >
          <ArrowLeft size={14} /> Back to Directory
        </button>

        {(isOrganizer || isAdmin) && (
          <div className="flex items-center gap-2">
            <Link 
              to={`/hackathons/manage/${hackathon._id}`} 
              className="btn btn-outline btn-sm rounded-xl font-bold text-xs gap-1.5"
            >
              <Edit3 size={12} /> Manage / Edit
            </Link>
            <button 
              onClick={handleDeleteHackathon}
              className="btn btn-outline btn-error btn-sm rounded-xl font-bold text-xs gap-1.5"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns - Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Cover & Header */}
          <div className="card bg-base-100 border border-border shadow-sm rounded-3xl overflow-hidden">
            <div className="h-56 sm:h-72 bg-gradient-to-br from-accent/5 to-secondary/5 border-b border-border relative">
              <img 
                src={hackathon.bannerURL || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop'} 
                alt={hackathon.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-base-content leading-tight">
                  {hackathon.title}
                </h1>
                
                <span className="badge badge-lg bg-accent/10 border border-accent/20 text-accent font-extrabold text-[10px] px-3.5 py-4 rounded-xl uppercase">
                  {hackathon.mode}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-bold text-base-content/50 py-1.5 border-y border-border/60">
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-accent" /> Start: {new Date(hackathon.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-accent" /> End: {new Date(hackathon.endDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm mb-3">About Hackathon</h3>
                <p className="text-xs text-base-content/75 leading-relaxed font-normal whitespace-pre-wrap">
                  {hackathon.description}
                </p>
              </div>
            </div>
          </div>

          {/* Registered Teams */}
          <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 sm:p-8">
            <h3 className="font-extrabold text-base mb-4 flex items-center gap-1.5"><Users size={18} className="text-accent" /> Registered Teams ({hackathon.registeredTeams?.length || 0})</h3>
            
            {hackathon.registeredTeams && hackathon.registeredTeams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hackathon.registeredTeams.map((team) => (
                  <div key={team._id} className="p-4 border border-border rounded-2xl bg-surface flex items-center justify-between gap-4">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="avatar shrink-0">
                        <div className="w-10 h-10 rounded-xl border border-border">
                          <img src={team.avatarURL || `https://api.dicebear.com/7.x/initials/svg?seed=${team.name}`} alt="Team avatar" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-base-content truncate">{team.name}</p>
                        <p className="text-[10px] text-base-content/40 mt-0.5 truncate">Leader: {team.leader?.firstName} {team.leader?.lastName}</p>
                      </div>
                    </div>
                    <Link to={`/teams/${team.slug}`} className="btn btn-ghost hover:bg-accent/5 hover:text-accent btn-xs font-bold rounded-lg text-[9px]">
                      View Team
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-base-content/50 italic py-4">No teams registered yet. Be the first to secure a spot!</p>
            )}
          </div>
        </div>

        {/* Right Columns - Registration panel & sidebar */}
        <div className="flex flex-col gap-6">
          {/* Registration Box */}
          <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="font-extrabold text-sm border-b border-border pb-2">Event Registration</h3>
            
            {regSuccess && (
              <div className="alert alert-success rounded-xl py-3 text-xs font-bold text-white flex items-center gap-1">
                <CheckCircle size={14} /> <span>{regSuccess}</span>
              </div>
            )}
            
            {regError && (
              <div className="alert alert-error rounded-xl py-3 text-xs font-bold text-white">
                <span>{regError}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-base-content/40 font-bold uppercase">Registration Deadline</span>
              <p className="font-extrabold text-xs text-base-content">
                {new Date(hackathon.registrationDeadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              {isRegistrationClosed ? (
                <span className="badge badge-error font-extrabold text-[8px] py-2 px-2.5 rounded-md text-white mt-1 w-max">CLOSED</span>
              ) : (
                <span className="badge badge-success font-extrabold text-[8px] py-2 px-2.5 rounded-md text-white mt-1 w-max">
                  CLOSES IN {daysLeftReg} DAYS
                </span>
              )}
            </div>

            {/* Team leader registration form */}
            {!isRegistrationClosed && user && (
              <div className="border-t border-border pt-4 mt-1">
                <h4 className="text-[10px] font-extrabold uppercase text-base-content/50 mb-3">Register your Team</h4>
                
                {userTeams.length > 0 ? (
                  <form onSubmit={handleRegisterTeam} className="flex flex-col gap-3">
                    <div className="form-control">
                      <label className="label p-0 pb-1.5"><span className="label-text text-[9px] font-bold text-base-content/60">Choose Team (Leader only)</span></label>
                      <select 
                        className="select select-bordered select-sm rounded-xl text-xs font-semibold"
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                      >
                        {userTeams.map(t => (
                          <option key={t._id} value={t._id}>{t.name} ({t.members?.length || 0} members)</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      disabled={registering}
                      className="btn btn-primary btn-sm rounded-xl font-bold w-full shadow-md shadow-primary/10 mt-1 h-9"
                    >
                      {registering ? 'Registering...' : 'Register Team'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-surface p-3 rounded-xl border border-border flex flex-col gap-2">
                    <p className="text-[10px] text-base-content/60 leading-normal font-normal">
                      Only Team Leaders can register a team. You must lead an active team with size between {hackathon.teamSizeMin} and {hackathon.teamSizeMax} that is not already registered.
                    </p>
                    <Link to="/teams/create" className="btn btn-outline btn-xs rounded-xl font-bold w-full mt-1.5">
                      Create Team
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Details & Rules Panel */}
          <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <h3 className="font-extrabold text-sm mb-4 border-b border-border pb-2">Event Parameters</h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-base-content/40 font-bold">Venue</span>
                  <span className="font-extrabold text-base-content truncate max-w-[150px]">
                    {hackathon.mode === 'online' ? 'Online Event' : hackathon.venue}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs border-t border-border/40 pt-2.5">
                  <span className="text-base-content/40 font-bold">Team Limits</span>
                  <span className="font-extrabold text-base-content">
                    {hackathon.teamSizeMin} to {hackathon.teamSizeMax} Hackers
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-border/40 pt-2.5">
                  <span className="text-base-content/40 font-bold">Website / Info</span>
                  {hackathon.websiteURL ? (
                    <a href={hackathon.websiteURL} target="_blank" rel="noopener noreferrer" className="font-extrabold text-primary hover:underline flex items-center gap-0.5">
                      Visit site <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-base-content/30 italic">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="border-t border-border pt-4">
              <h4 className="text-[10px] font-bold uppercase text-base-content/50 mb-3">Hosted By</h4>
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-9 h-9 rounded-full border border-border">
                    <img src={hackathon.organizer?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${hackathon.organizer?.firstName}`} alt="Organizer" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-xs text-base-content truncate">{hackathon.organizer?.firstName} {hackathon.organizer?.lastName}</p>
                  <p className="text-[10px] text-base-content/40 truncate">{hackathon.organizer?.college || 'Organizer'}</p>
                </div>
              </div>
            </div>

            {/* Prizes List */}
            {hackathon.prizes && hackathon.prizes.length > 0 && (
              <div className="border-t border-border pt-4">
                <h4 className="text-[10px] font-bold uppercase text-base-content/50 mb-3 flex items-center gap-1">
                  <Award size={12} className="text-warning" /> Prizes & Rewards
                </h4>
                <div className="flex flex-col gap-2.5">
                  {hackathon.prizes.map((prize, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs border-b border-border/30 pb-2">
                      <span className="font-extrabold text-base-content">{prize.rank}</span>
                      <span className="text-base-content/70 font-semibold text-right max-w-[130px]">{prize.prize}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDetailPage;
