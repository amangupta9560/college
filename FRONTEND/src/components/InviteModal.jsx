import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { api, useAuth } from '../Context/AuthContext.jsx';

export const InviteModal = ({ isOpen, onClose, candidate, onSubmit }) => {
  const { user } = useAuth();
  
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      // Fetch teams led by current user
      const fetchMyTeams = async () => {
        try {
          const res = await api.get('/api/teams');
          const myTeams = res.data.data.teams.filter(t => t.leader?._id === user._id && t.status === 'forming');
          setTeams(myTeams);
          if (myTeams.length > 0) {
            setSelectedTeamId(myTeams[0]._id);
            setRole(myTeams[0].openRoles?.[0] || 'Member');
          } else {
            setError('You must be the leader of an active forming team to invite collaborators.');
          }
        } catch (err) {
          console.error(err);
          setError('Failed to load your teams.');
        }
      };
      fetchMyTeams();
    }
  }, [isOpen, user]);

  const handleTeamChange = (teamId) => {
    setSelectedTeamId(teamId);
    const selectedTeam = teams.find(t => t._id === teamId);
    if (selectedTeam) {
      setRole(selectedTeam.openRoles?.[0] || 'Member');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedTeamId) {
      return setError('Please select a team.');
    }

    setLoading(true);
    try {
      await onSubmit({
        teamId: selectedTeamId,
        inviteeId: candidate._id,
        role,
        message
      });
      setMessage('');
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send team invitation.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !candidate) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box rounded-2xl border border-border p-6 max-w-md bg-base-100 transition-colors duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
          <h3 className="font-bold text-lg">Send Team Invitation</h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-xs hover:bg-base-200 text-base-content/50 hover:text-base-content">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error rounded-xl py-2 px-3 flex items-center gap-2 mb-4">
            <AlertCircle size={14} className="shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}

        {teams.length > 0 ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">
            <div className="flex flex-col gap-1 bg-surface p-3 border border-border rounded-xl">
              <span className="text-[10px] text-base-content/50 uppercase">Inviting Student</span>
              <span className="text-sm font-black text-primary">{candidate.firstName} {candidate.lastName}</span>
            </div>

            {/* Select Team */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text font-bold text-base-content/65 uppercase">Select Team</span></label>
              <select 
                className="select select-bordered select-sm rounded-xl text-xs"
                value={selectedTeamId}
                onChange={(e) => handleTeamChange(e.target.value)}
                required
              >
                {teams.map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>

            {/* Proposed Role */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text font-bold text-base-content/65 uppercase">Proposed Role</span></label>
              <input 
                type="text"
                placeholder="e.g. Frontend Developer"
                className="input input-bordered input-sm rounded-xl text-xs"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>

            {/* Message */}
            <div className="form-control">
              <label className="label py-1"><span className="label-text font-bold text-base-content/65 uppercase">Personal Message (Optional)</span></label>
              <textarea
                className="textarea textarea-bordered rounded-xl text-xs h-20 font-normal"
                placeholder="Write a brief description of the project and why you want them on your team..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={300}
              />
              <label className="label py-1 justify-end">
                <span className="label-text-alt text-[10px] text-base-content/40 font-normal">{message.length}/300 chars</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-border">
              <button type="button" onClick={onClose} className="btn btn-ghost btn-sm rounded-xl font-bold">
                Cancel
              </button>
              <button type="submit" className={`btn btn-primary btn-sm rounded-xl font-bold gap-1 ${loading ? 'loading' : ''}`} disabled={loading}>
                Send Invitation <Send size={12} />
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-base-content/60">You do not currently lead any active forming teams. Create a team first to invite collaborators!</p>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button type="button" onClick={onClose} className="btn btn-outline btn-sm rounded-xl font-bold">
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InviteModal;
