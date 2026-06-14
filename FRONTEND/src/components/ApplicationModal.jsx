import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

export const ApplicationModal = ({ isOpen, onClose, team, onSubmit }) => {
  const [role, setRole] = useState(team?.openRoles?.[0] || '');
  const [coverMessage, setCoverMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !team) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!role) {
      return setError('Please select a target recruitment role.');
    }

    setLoading(true);
    try {
      await onSubmit({ teamId: team._id, role, coverMessage });
      setCoverMessage('');
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box rounded-2xl border border-border p-6 max-w-md bg-base-100 transition-colors duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
          <h3 className="font-bold text-lg">Apply to Join Team</h3>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">
          <div className="flex flex-col gap-1.5 bg-surface p-3 border border-border rounded-xl">
            <span className="text-[10px] text-base-content/50 uppercase">Applying to</span>
            <span className="text-sm font-black text-primary">{team.name}</span>
          </div>

          {/* Select Role */}
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-bold text-base-content/65 uppercase">Select Target Role</span></label>
            <select 
              className="select select-bordered select-sm rounded-xl text-xs"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              {team.openRoles && team.openRoles.map((openRole, idx) => (
                <option key={idx} value={openRole}>{openRole}</option>
              ))}
            </select>
          </div>

          {/* Cover Message */}
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-bold text-base-content/65 uppercase">Cover Message (Optional)</span></label>
            <textarea
              className="textarea textarea-bordered rounded-xl text-xs h-24 font-normal"
              placeholder="Why are you a good fit for this role? Share your skills, portfolio links, or experience..."
              value={coverMessage}
              onChange={(e) => setCoverMessage(e.target.value)}
              maxLength={500}
            />
            <label className="label py-1 justify-end">
              <span className="label-text-alt text-[10px] text-base-content/40 font-normal">{coverMessage.length}/500 chars</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm rounded-xl font-bold">
              Cancel
            </button>
            <button type="submit" className={`btn btn-primary btn-sm rounded-xl font-bold gap-1 ${loading ? 'loading' : ''}`} disabled={loading}>
              Submit Application <Send size={12} />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ApplicationModal;
