import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, useAuth } from '../Context/AuthContext.jsx';
import InviteModal from '../Components/InviteModal.jsx';
import ReviewModal from '../Components/ReviewModal.jsx';
import ReportModal from '../Components/ReportModal.jsx';
import { Mail, GraduationCap, Building, Github, Linkedin, Globe, Send, Sparkles, FolderKanban, Star, Flag, MessageSquare } from 'lucide-react';

export const PublicProfilePage = () => {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  const fetchPublicProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/users/${id}`);
      setProfileData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPublicProfile();
    }
  }, [id]);

  const handleSendInvite = async (payload) => {
    await api.post('/api/invitations', payload);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-4">
        <h2 className="text-xl font-bold">User profile not found</h2>
        <Link to="/discover" className="btn btn-primary btn-sm rounded-xl">Back to Discover</Link>
      </div>
    );
  }

  const { user, projects, reviews } = profileData;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-6">
      {/* Header Profile Card */}
      <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left transition-colors duration-200">
        <div className="avatar border border-border rounded-full p-1 bg-base-200">
          <div className="w-24 sm:w-32 rounded-full">
            <img 
              src={user.avatar || 'https://res.cloudinary.com/dgtyqhtor/image/upload/v1700000000/default-avatar.png'} 
              alt="Profile Avatar"
              onError={(e) => {
                e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.firstName;
              }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold">{user.firstName} {user.lastName}</h1>
            <span className={`badge ${user.availability === 'available' ? 'badge-success' : 'badge-warning'} font-semibold py-3 px-4 rounded-xl text-xs capitalize`}>
              {user.availability}
            </span>
          </div>

          <p className="text-sm text-base-content/60 flex items-center justify-center sm:justify-start gap-1">
            <Mail size={14} /> {user.email}
          </p>

          <p className="text-sm text-base-content/85 font-medium leading-relaxed max-w-xl">
            {user.bio || "No biography provided by user."}
          </p>
        </div>

        <div className="shrink-0 flex flex-col gap-2">
          <button 
            onClick={() => setInviteModalOpen(true)}
            className="btn btn-primary rounded-xl btn-sm font-bold text-xs inline-flex items-center gap-1 shadow-md shadow-primary/20"
          >
            <Send size={12} /> Invite to Team
          </button>
          
          <Link 
            to="/chat"
            className="btn btn-outline rounded-xl btn-sm font-bold text-xs inline-flex items-center gap-1"
          >
            <MessageSquare size={12} /> Message
          </Link>

          <button 
            onClick={() => setReviewModalOpen(true)}
            className="btn btn-outline rounded-xl btn-sm font-bold text-xs inline-flex items-center gap-1 text-warning hover:bg-warning/5 hover:border-warning hover:text-warning"
          >
            <Star size={12} /> Review Teammate
          </button>

          <button 
            onClick={() => setReportTarget({ type: 'user', id: user._id })}
            className="btn btn-ghost text-base-content/40 hover:text-danger hover:bg-danger/5 btn-xs rounded-xl font-bold text-[10px] inline-flex items-center gap-1 mt-1"
          >
            <Flag size={10} /> Report User
          </button>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Academics */}
        <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 md:col-span-2 gap-4 transition-colors duration-200">
          <h2 className="text-lg font-bold border-b border-border pb-2">Academic Details</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Building size={18} />
              </div>
              <div>
                <p className="text-xs text-base-content/50">College / Institution</p>
                <p className="text-sm font-semibold">{user.college}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Degree & Year</p>
                <p className="text-sm font-semibold">{user.degree} (Year {user.year})</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Branch / Specialization</p>
                <p className="text-sm font-semibold">{user.branch}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Link sidebar */}
        <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 gap-4 transition-colors duration-200">
          <h2 className="text-lg font-bold border-b border-border pb-2">Social Profiles</h2>
          
          <div className="flex flex-col gap-3">
            {user.githubURL && (
              <a href={user.githubURL} target="_blank" rel="noopener noreferrer" className="btn btn-outline rounded-xl btn-sm font-semibold text-xs flex items-center justify-start gap-2">
                <Github size={14} /> GitHub Profile
              </a>
            )}
            {user.linkedinURL && (
              <a href={user.linkedinURL} target="_blank" rel="noopener noreferrer" className="btn btn-outline rounded-xl btn-sm font-semibold text-xs flex items-center justify-start gap-2">
                <Linkedin size={14} /> LinkedIn Profile
              </a>
            )}
            {user.portfolioURL && (
              <a href={user.portfolioURL} target="_blank" rel="noopener noreferrer" className="btn btn-outline rounded-xl btn-sm font-semibold text-xs flex items-center justify-start gap-2">
                <Globe size={14} /> Personal Website
              </a>
            )}
            {!user.githubURL && !user.linkedinURL && !user.portfolioURL && (
              <p className="text-xs text-base-content/40 italic">No social links added.</p>
            )}
          </div>
        </div>
      </div>

      {/* Skills list */}
      <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 transition-colors duration-200">
        <h2 className="text-lg font-bold border-b border-border pb-2 mb-3">Skills & Experience</h2>
        {user.skills && user.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skillObj, idx) => (
              <div key={idx} className="badge badge-lg bg-base-200 border-none font-bold text-xs p-3 rounded-lg flex items-center gap-1 text-base-content">
                {skillObj.skill?.name || 'Skill'}
                <span className="badge badge-xs badge-primary rounded-sm uppercase text-[7px] p-1.5 font-bold tracking-wider">{skillObj.level}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-base-content/50 italic">No skills listed yet.</p>
        )}
      </div>

      {/* Public Projects */}
      <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 transition-colors duration-200">
        <h2 className="text-lg font-bold border-b border-border pb-2 mb-4 flex items-center gap-1.5"><FolderKanban size={18} /> Public Projects</h2>
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div key={project._id} className="p-4 border border-border rounded-xl bg-surface flex flex-col gap-2">
                <h3 className="font-extrabold text-sm">{project.title}</h3>
                <p className="text-xs text-base-content/70 line-clamp-2 leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.techStack && project.techStack.map((tech, i) => (
                    <span key={i} className="badge badge-xs bg-base-200 border-none font-semibold text-[8px] rounded-md">{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-base-content/50 italic">No projects showcased yet.</p>
        )}
      </div>

      {/* Team Reviews */}
      <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 transition-colors duration-200">
        <h2 className="text-lg font-bold border-b border-border pb-2 mb-4 flex items-center gap-1.5"><Star size={18} className="text-warning" /> Teammate Reviews</h2>
        {reviews && reviews.length > 0 ? (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div key={review._id} className="p-4 border border-border rounded-xl bg-surface flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="avatar">
                      <div className="w-6 h-6 rounded-full border border-border">
                        <img 
                          src={review.reviewer?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + review.reviewer?.firstName} 
                          alt="Reviewer Avatar" 
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold">{review.reviewer?.firstName} {review.reviewer?.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-warning font-black text-xs">
                      <Star size={12} fill="currentColor" /> {review.rating}
                    </div>
                    {review.reviewer?._id !== currentUser?._id && (
                      <button
                        onClick={() => setReportTarget({ type: 'review', id: review._id })}
                        className="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-danger"
                        title="Report review"
                      >
                        <Flag size={10} />
                      </button>
                    )}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-xs text-base-content/75 italic leading-relaxed font-normal">"{review.comment}"</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-base-content/50 italic">No teammate reviews posted yet.</p>
        )}
      </div>

      {/* Invite Modal */}
      <InviteModal 
        isOpen={inviteModalOpen} 
        onClose={() => setInviteModalOpen(false)}
        candidate={user}
        onSubmit={handleSendInvite}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        reviewee={user}
        onSubmitSuccess={fetchPublicProfile}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        targetType={reportTarget?.type}
        targetId={reportTarget?.id}
      />
    </div>
  );
};

export default PublicProfilePage;
