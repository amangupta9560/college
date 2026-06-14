import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, useAuth } from '../Context/AuthContext.jsx';
import ApplicationModal from '../Components/ApplicationModal.jsx';
import { ArrowLeft, Users, FolderKanban, ShieldCheck, Mail, Calendar, Sparkles, CheckCircle2, FileText, Settings } from 'lucide-react';

export const TeamDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  // Application Modal state
  const [appModalOpen, setAppModalOpen] = useState(false);

  const fetchTeamDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/teams/${slug}`);
      const teamData = res.data.data.team;
      setTeam(teamData);

      // Check if current user is member or leader
      const memberCheck = teamData.members.some(m => m.user?._id === user?._id);
      const leaderCheck = teamData.leader?._id === user?._id;
      setIsMember(memberCheck || leaderCheck);

      // Check if user has already applied
      const appRes = await api.get(`/api/applications?teamId=${teamData._id}`);
      const alreadyApplied = appRes.data.data.applications.some(
        a => a.applicant?._id === user?._id && a.status === 'pending'
      );
      setHasApplied(alreadyApplied);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug && user) {
      fetchTeamDetails();
    }
  }, [slug, user]);

  const handleApplySubmit = async (payload) => {
    await api.post('/api/applications', payload);
    setHasApplied(true);
    // Success toast / notification can trigger
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-4">
        <h2 className="text-xl font-bold">Team not found</h2>
        <Link to="/teams" className="btn btn-primary btn-sm rounded-xl">Back to Teams</Link>
      </div>
    );
  }

  const isLeader = team.leader?._id === user?._id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Header Back & Cockpit controls */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/teams')} className="btn btn-ghost btn-sm rounded-xl font-semibold inline-flex items-center gap-1">
          <ArrowLeft size={16} /> Back to Teams
        </button>

        {isLeader && (
          <Link to={`/teams/manage/${team._id}`} className="btn btn-outline btn-sm rounded-xl font-bold inline-flex items-center gap-1 hover:bg-base-200">
            <Settings size={14} /> Team Cockpit
          </Link>
        )}
      </div>

      {/* Main Details Card */}
      <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start justify-between transition-colors duration-200">
        <div className="flex-grow flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-black">{team.name}</h1>
            <span className="badge badge-primary uppercase font-bold text-[10px] py-2.5 px-3 rounded-lg">
              {team.projectType}
            </span>
          </div>

          <p className="text-sm text-base-content/85 leading-relaxed max-w-2xl">{team.description}</p>

          <div className="flex flex-wrap gap-4 text-xs font-semibold text-base-content/60">
            <span className="flex items-center gap-1"><Users size={14} /> {team.members.length} / {team.maxSize} Members</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> Created {new Date(team.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action / Recruitment details */}
        <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto md:text-right border-t md:border-t-0 border-border pt-4 md:pt-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-base-content/40 tracking-wider">Recruiting Status</span>
            <span className={`text-sm font-black ${team.isRecruiting ? 'text-success' : 'text-base-content/50'}`}>
              {team.isRecruiting ? '● OPEN FOR RECRUITMENT' : '● RECRUITMENT CLOSED'}
            </span>
          </div>

          {/* Action button */}
          {!isMember && team.isRecruiting && (
            hasApplied ? (
              <button disabled className="btn btn-outline rounded-xl btn-sm font-bold gap-1 text-xs">
                <CheckCircle2 size={14} /> Applied (Pending)
              </button>
            ) : (
              <button 
                onClick={() => setAppModalOpen(true)}
                className="btn btn-primary rounded-xl btn-sm font-bold gap-1 text-xs shadow-md shadow-primary/20"
              >
                Apply to Join Team <Sparkles size={14} />
              </button>
            )
          )}
        </div>
      </div>

      {/* Roster & Recruitment split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Roster list */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="card bg-base-100 border border-border p-6 rounded-2xl gap-4">
            <h2 className="text-lg font-bold border-b border-border pb-2 flex items-center gap-1.5"><Users size={18} /> Team Roster</h2>
            
            <div className="flex flex-col divide-y divide-border">
              {team.members.map((member, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-9 h-9 rounded-full border border-border">
                        <img 
                          src={member.user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + (member.user?.firstName || 'User')} 
                          alt="Member Avatar" 
                        />
                      </div>
                    </div>
                    <div>
                      <Link to={`/users/${member.user?._id}`} className="font-extrabold text-sm hover:underline">{member.user?.firstName} {member.user?.lastName}</Link>
                      <p className="text-[10px] text-base-content/50 font-semibold">{member.user?.college}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {member.role === 'Leader' && <ShieldCheck size={14} className="text-primary" />}
                    <span className="badge badge-outline border-none text-[10px] font-bold uppercase">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recruitment roles details */}
        <div className="flex flex-col gap-6">
          <div className="card bg-base-100 border border-border p-6 rounded-2xl gap-4">
            <h2 className="text-lg font-bold border-b border-border pb-2 flex items-center gap-1.5"><FileText size={18} /> Open Roles</h2>
            
            {team.openRoles && team.openRoles.length > 0 ? (
              <div className="flex flex-col gap-2">
                {team.openRoles.map((role, idx) => (
                  <div key={idx} className="p-3 bg-surface border border-border rounded-xl font-bold flex flex-col gap-1">
                    <span className="text-xs text-primary">{role}</span>
                    <span className="text-[9px] text-base-content/40 uppercase tracking-wider font-semibold">Vacant position</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-base-content/50 italic py-2">No open positions advertised.</p>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <ApplicationModal 
        isOpen={appModalOpen} 
        onClose={() => setAppModalOpen(false)}
        team={team}
        onSubmit={handleApplySubmit}
      />
    </div>
  );
};

export default TeamDetailPage;
