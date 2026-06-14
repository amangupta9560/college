import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../Context/AuthContext.jsx';
import { Star, X, Check, Loader2 } from 'lucide-react';

export const ReviewModal = ({ isOpen, onClose, reviewee, onSubmitSuccess }) => {
  const { user } = useAuth();
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  
  const [eligibleTeams, setEligibleTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Available tag feedback options
  const reviewTags = ['Good Communicator', 'Reliable', 'Strong Coder', 'Creative Designer', 'Team Player', 'Problem Solver', 'Great Leader'];

  useEffect(() => {
    if (isOpen && reviewee && user) {
      setError('');
      setSuccess(false);
      setComment('');
      setRating(5);
      setSelectedTags([]);
      
      const fetchSharedTeams = async () => {
        setLoadingTeams(true);
        try {
          // Fetch teams
          const res = await api.get('/api/teams?limit=50');
          const allTeams = res.data.data.teams || [];
          
          // Filter teams that are:
          // 1. Completed
          // 2. Both current user and reviewee are members
          const shared = allTeams.filter(t => {
            if (t.status !== 'completed') return false;
            
            const myId = user._id;
            const revieweeId = reviewee._id;
            
            const hasMe = t.members?.some(m => (m.user?._id || m.user) === myId);
            const hasReviewee = t.members?.some(m => (m.user?._id || m.user) === revieweeId);
            
            return hasMe && hasReviewee;
          });
          
          setEligibleTeams(shared);
          if (shared.length > 0) {
            setSelectedTeamId(shared[0]._id);
          }
        } catch (err) {
          console.error(err);
          setError('Failed to load shared projects.');
        } finally {
          setLoadingTeams(false);
        }
      };

      fetchSharedTeams();
    }
  }, [isOpen, reviewee, user]);

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!selectedTeamId) {
      return setError('You must select a completed project/team you shared.');
    }

    setSubmitting(true);
    try {
      await api.post('/api/reviews', {
        revieweeId: reviewee._id,
        teamId: selectedTeamId,
        rating,
        comment,
        tags: selectedTags
      });

      setSuccess(true);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !reviewee) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md bg-base-100 border border-border rounded-3xl p-6 relative">
        <button 
          onClick={onClose}
          className="btn btn-ghost btn-circle btn-xs absolute top-4 right-4"
        >
          <X size={16} />
        </button>

        <h3 className="font-extrabold text-base border-b border-border pb-2.5 text-base-content">
          Review Teammate
        </h3>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center animate-bounce">
              <Check size={24} />
            </div>
            <h4 className="font-extrabold text-sm text-base-content mt-2">Review Submitted!</h4>
            <p className="text-[10px] text-base-content/50">Your rating has been successfully saved to their profile.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 text-xs font-semibold">
            {/* Reviewee Info */}
            <div className="flex items-center gap-3 bg-surface p-3 border border-border rounded-xl">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full">
                  <img src={reviewee.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${reviewee.firstName}`} alt="Teammate avatar" />
                </div>
              </div>
              <div>
                <p className="font-extrabold text-xs text-base-content">{reviewee.firstName} {reviewee.lastName}</p>
                <p className="text-[9px] text-base-content/40 mt-0.5">{reviewee.college}</p>
              </div>
            </div>

            {error && (
              <div className="alert alert-error rounded-xl py-2 px-3 text-[10px] font-bold text-white leading-relaxed">
                {error}
              </div>
            )}

            {/* Shared Team selector */}
            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Completed Shared Project</span>
              </label>
              {loadingTeams ? (
                <div className="flex items-center gap-1.5 py-2">
                  <Loader2 className="animate-spin text-primary" size={14} />
                  <span className="text-[10px] text-base-content/40">Checking eligibility...</span>
                </div>
              ) : eligibleTeams.length === 0 ? (
                <div className="p-3 bg-surface rounded-xl border border-border text-center text-[10px] text-base-content/50 font-normal leading-relaxed">
                  You can only review teammates you have worked with on a team that is marked as <strong>Completed</strong>.
                </div>
              ) : (
                <select 
                  className="select select-bordered select-sm rounded-xl text-xs font-semibold"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  required
                >
                  {eligibleTeams.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>

            {eligibleTeams.length > 0 && (
              <>
                {/* Stars Rating */}
                <div className="form-control items-center py-2 bg-surface rounded-2xl border border-border/60">
                  <span className="text-[10px] font-bold text-base-content/50 uppercase mb-2">Teammate Rating</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = hoverRating ? star <= hoverRating : star <= rating;
                      return (
                        <button
                          key={star}
                          type="button"
                          className="text-warning focus:outline-none p-1 transition-transform active:scale-95"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          <Star 
                            size={28} 
                            fill={isFilled ? 'currentColor' : 'none'} 
                            stroke="currentColor" 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment */}
                <div className="form-control">
                  <label className="label p-1">
                    <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Written Review</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Write a comment about your collaboration experience... (Max 500 characters)"
                    className="textarea textarea-bordered rounded-xl text-xs font-normal leading-relaxed"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                  />
                </div>

                {/* Tags checkboxes */}
                <div className="form-control">
                  <label className="label p-1">
                    <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Feedback Tags</span>
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {reviewTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`btn btn-xs rounded-lg border-none hover:bg-primary/20 ${isSelected ? 'bg-primary text-white hover:bg-primary/95' : 'bg-base-200 text-base-content/80'}`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm rounded-xl font-bold mt-2 shadow-md shadow-primary/10 h-9"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
