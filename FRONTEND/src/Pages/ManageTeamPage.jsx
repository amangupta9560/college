import React, { useState, useEffect } from 'react';
import { useNavigate as useNavigateRouter, useParams as useParamsRouter, Link as LinkRouter } from 'react-router-dom';
import { api, useAuth } from '../Context/AuthContext.jsx';
import { Users, FileText, Send, Trash, ShieldCheck, Check, X, AlertCircle, CheckCircle2, Settings, Loader2 } from 'lucide-react';

export const ManageTeamPage = () => {
  const { id } = useParamsRouter();
  const navigate = useNavigateRouter();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [applications, setApplications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCockpitData = async () => {
    try {
      // 1. Fetch team details
      const teamRes = await api.get(`/api/teams/${id}`);
      const teamData = teamRes.data.data.team;
      setTeam(teamData);

      // Verify user is leader
      if (teamData.leader?._id !== user?._id && user?.role !== 'admin') {
        navigate('/teams');
      }

      // 2. Fetch pending applications for this team
      const appRes = await api.get(`/api/applications?teamId=${teamData._id}&status=pending`);
      setApplications(appRes.data.data.applications || []);

      // 3. Fetch sent invitations for this team
      const inviteRes = await api.get(`/api/invitations/sent?teamId=${teamData._id}`);
      setInvitations(inviteRes.data.data.invitations || []);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch cockpit details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user) {
      fetchCockpitData();
    }
  }, [id, user]);

  const handleAcceptApp = async (appId) => {
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await api.patch(`/api/applications/${appId}/accept`);
      setSuccess('Applicant joined team successfully!');
      fetchCockpitData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept applicant.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApp = async (appId) => {
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await api.patch(`/api/applications/${appId}/reject`);
      setSuccess('Application rejected.');
      fetchCockpitData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await api.delete(`/api/invitations/${inviteId}`);
      setSuccess('Invitation canceled.');
      fetchCockpitData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await api.delete(`/api/teams/${team._id}/members/${memberUserId}`);
      setSuccess('Member removed from team roster.');
      fetchCockpitData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisbandTeam = async () => {
    if (window.confirm('Are you absolutely sure you want to disband this team? All member relations and sent invites will be deleted.')) {
      setError('');
      try {
        await api.delete(`/api/teams/${team._id}`);
        navigate('/teams');
      } catch (err) {
        setError('Failed to disband team.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!team) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Header Cockpit Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-base-content flex items-center gap-2">
            <Settings size={28} className="text-primary animate-spin-slow" /> {team.name} Cockpit
          </h1>
          <p className="text-sm text-base-content/60 mt-1">Manage team roster, review applications, and track invites.</p>
        </div>

        <div className="flex gap-2">
          <LinkRouter to={`/teams/${team.slug}`} className="btn btn-outline btn-sm rounded-xl">
            View Team Details
          </LinkRouter>
          <button onClick={handleDisbandTeam} className="btn btn-error btn-sm rounded-xl">
            Disband Team
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error rounded-xl py-3 px-4 flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success rounded-xl py-3 px-4 flex items-center gap-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <span className="text-xs font-medium">{success}</span>
        </div>
      )}

      {/* Main Grid: Roster vs Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Roster list */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Roster Membership */}
          <div className="card bg-base-100 border border-border p-6 rounded-2xl gap-4">
            <h2 className="text-lg font-bold border-b border-border pb-2 flex items-center gap-1.5"><Users size={18} /> Team Roster</h2>
            
            <div className="flex flex-col divide-y divide-border">
              {team.members.map((member, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full border border-border">
                        <img 
                          src={member.user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + (member.user?.firstName || 'User')} 
                          alt="Member Avatar" 
                        />
                      </div>
                    </div>
                    <div>
                      <LinkRouter to={`/users/${member.user?._id}`} className="font-extrabold text-sm hover:underline">{member.user?.firstName} {member.user?.lastName}</LinkRouter>
                      <span className="badge badge-ghost text-[8px] font-bold uppercase ml-2 px-1 rounded-md">{member.role}</span>
                    </div>
                  </div>
                  
                  {member.user?._id !== team.leader?._id && (
                    <button 
                      onClick={() => handleRemoveMember(member.user?._id)}
                      disabled={actionLoading}
                      className="btn btn-ghost btn-circle btn-xs text-error hover:bg-error/15"
                      title="Remove Member"
                    >
                      <Trash size={12} />
                    </button>
                  )}
                  {member.user?._id === team.leader?._id && (
                    <span className="text-xs font-bold text-primary flex items-center gap-1"><ShieldCheck size={14} /> Owner</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pending Applications */}
          <div className="card bg-base-100 border border-border p-6 rounded-2xl gap-4">
            <h2 className="text-lg font-bold border-b border-border pb-2 flex items-center gap-1.5"><FileText size={18} /> Pending Applications</h2>
            
            {applications.length === 0 ? (
              <div className="text-center py-8 text-base-content/40 italic">
                No pending team applications.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {applications.map((app) => (
                  <div key={app._id} className="p-4 border border-border rounded-xl bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-3 items-start">
                      <div className="avatar shrink-0">
                        <div className="w-10 h-10 rounded-full border border-border">
                          <img 
                            src={app.applicant?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + app.applicant?.firstName} 
                            alt="Applicant Avatar" 
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div>
                          <LinkRouter to={`/users/${app.applicant?._id}`} className="font-extrabold text-sm hover:underline">
                            {app.applicant?.firstName} {app.applicant?.lastName}
                          </LinkRouter>
                          <span className="text-[10px] text-base-content/50 font-semibold ml-2">{app.applicant?.college} (Year {app.applicant?.year})</span>
                        </div>
                        <p className="text-[10px] text-base-content/60 font-semibold">Applying for: <span className="text-primary font-extrabold">{app.role}</span></p>
                        {app.coverMessage && (
                          <div className="p-2 border border-border rounded-lg bg-base-100 mt-1 max-w-md">
                            <p className="text-[10px] text-base-content/75 italic leading-relaxed font-normal">{app.coverMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => handleRejectApp(app._id)}
                        disabled={actionLoading}
                        className="btn btn-outline btn-error btn-xs rounded-lg font-bold"
                      >
                        <X size={12} className="mr-0.5" /> Reject
                      </button>
                      <button 
                        onClick={() => handleAcceptApp(app._id)}
                        disabled={actionLoading}
                        className="btn btn-success btn-xs rounded-lg font-bold"
                      >
                        <Check size={12} className="mr-0.5" /> Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sent Invitations */}
        <div className="flex flex-col gap-6">
          
          {/* Sent invitations */}
          <div className="card bg-base-100 border border-border p-6 rounded-2xl gap-4">
            <h2 className="text-lg font-bold border-b border-border pb-2 flex items-center gap-1.5"><Send size={18} /> Sent Invitations</h2>
            
            {invitations.length === 0 ? (
              <div className="text-center py-6 text-base-content/40 italic">
                No active sent invitations.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {invitations.map((invite) => (
                  <div key={invite._id} className="p-3 border border-border rounded-xl bg-surface flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="avatar shrink-0">
                        <div className="w-7 h-7 rounded-full border border-border">
                          <img 
                            src={invite.invitee?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + invite.invitee?.firstName} 
                            alt="Invitee avatar" 
                          />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <LinkRouter to={`/users/${invite.invitee?._id}`} className="font-extrabold text-xs hover:underline truncate block">
                          {invite.invitee?.firstName} {invite.invitee?.lastName}
                        </LinkRouter>
                        <span className="text-[8px] text-base-content/40 uppercase font-black tracking-wider block mt-0.5">Role: {invite.role}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleCancelInvite(invite._id)}
                      disabled={actionLoading}
                      className="btn btn-ghost btn-circle btn-xs text-error hover:bg-error/15"
                      title="Cancel Invite"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ManageTeamPage;
