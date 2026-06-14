import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, useAuth } from '../Context/AuthContext.jsx';
import { Mail, GraduationCap, Building, Github, Linkedin, Globe, Edit3, ShieldAlert, FolderKanban, Star, Plus, Trash2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOwnProfileDetails = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/users/${user._id}`);
      setProfileData(res.data.data);
    } catch (err) {
      console.error('Error fetching profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnProfileDetails();
  }, [user]);

  if (!user) return null;

  const getAvailabilityClass = (status) => {
    switch (status) {
      case 'available': return 'badge-success text-white';
      case 'busy': return 'badge-warning text-white';
      case 'not_looking': return 'badge-error text-white';
      default: return 'badge-ghost';
    }
  };

  const formatAvailability = (status) => {
    return status ? status.toUpperCase().replace('_', ' ') : 'UNKNOWN';
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/api/projects/${projectId}`);
      // Refresh profile data
      fetchOwnProfileDetails();
    } catch (err) {
      console.error(err);
      alert('Failed to delete project.');
    }
  };

  const { projects = [], reviews = [] } = profileData || {};

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-6">
      {/* Header Profile Card */}
      <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left transition-colors duration-200">
        <div className="avatar border border-border rounded-full p-1 bg-base-200 shrink-0">
          <div className="w-24 sm:w-32 rounded-full">
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`} 
              alt="Profile Avatar"
              onError={(e) => {
                e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.firstName;
              }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold truncate">{user.firstName} {user.lastName}</h1>
            <span className={`badge ${getAvailabilityClass(user.availability)} font-semibold py-3 px-4 rounded-xl text-xs w-max mx-auto sm:mx-0`}>
              {formatAvailability(user.availability)}
            </span>
          </div>

          <p className="text-sm text-base-content/60 flex items-center justify-center sm:justify-start gap-1">
            <Mail size={14} /> {user.email}
          </p>

          <p className="text-sm text-base-content/85 font-medium leading-relaxed max-w-xl">
            {user.bio || "No bio added yet. Tell us about your interests, skills, and background."}
          </p>
        </div>

        <div className="shrink-0 mt-4 sm:mt-0">
          <Link to="/profile/edit" className="btn btn-outline rounded-xl btn-sm font-bold text-xs">
            <Edit3 size={14} className="mr-1" /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Academic Details */}
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

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <ShieldAlert size={18} />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Role Privileges</p>
                <p className="text-sm font-semibold capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links & Interactions */}
        <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 gap-4 transition-colors duration-200">
          <h2 className="text-lg font-bold border-b border-border pb-2">Social Profiles</h2>
          
          <div className="flex flex-col gap-3">
            {user.githubURL ? (
              <a href={user.githubURL} target="_blank" rel="noopener noreferrer" className="btn btn-outline rounded-xl btn-sm font-semibold text-xs flex items-center justify-start gap-2">
                <Github size={14} /> GitHub Profile
              </a>
            ) : (
              <span className="text-xs text-base-content/40 italic flex items-center gap-2 px-2 py-1"><Github size={14} /> GitHub link empty</span>
            )}

            {user.linkedinURL ? (
              <a href={user.linkedinURL} target="_blank" rel="noopener noreferrer" className="btn btn-outline rounded-xl btn-sm font-semibold text-xs flex items-center justify-start gap-2">
                <Linkedin size={14} /> LinkedIn Profile
              </a>
            ) : (
              <span className="text-xs text-base-content/40 italic flex items-center gap-2 px-2 py-1"><Linkedin size={14} /> LinkedIn link empty</span>
            )}

            {user.portfolioURL ? (
              <a href={user.portfolioURL} target="_blank" rel="noopener noreferrer" className="btn btn-outline rounded-xl btn-sm font-semibold text-xs flex items-center justify-start gap-2">
                <Globe size={14} /> Personal Website
              </a>
            ) : (
              <span className="text-xs text-base-content/40 italic flex items-center gap-2 px-2 py-1"><Globe size={14} /> Portfolio website empty</span>
            )}
          </div>
        </div>
      </div>

      {/* Focus Areas / Interests */}
      <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 transition-colors duration-200">
        <h2 className="text-lg font-bold border-b border-border pb-2 mb-3">Interests & Focus Areas</h2>
        {user.interests && user.interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, idx) => (
              <span key={idx} className="badge bg-primary/10 border border-primary/20 text-primary font-semibold py-3 px-4 rounded-xl text-xs">
                {interest}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-base-content/50 italic">No interests specified yet. Add focus areas to get matched better.</p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-md text-primary"></span>
        </div>
      ) : (
        <>
          {/* Showcase Projects */}
          <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 transition-colors duration-200">
            <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
              <h2 className="text-lg font-bold flex items-center gap-1.5">
                <FolderKanban size={18} /> Showcase Projects ({projects.length})
              </h2>
              <Link to="/projects/create" className="btn btn-primary btn-xs font-bold rounded-lg gap-0.5 px-2">
                <Plus size={10} /> Add New
              </Link>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div key={project._id} className="p-4 border border-border rounded-xl bg-surface flex flex-col justify-between gap-3 group">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-extrabold text-xs text-base-content line-clamp-1">{project.title}</h3>
                        <span className={`badge badge-xs text-[8px] font-bold p-1 px-1.5 ${project.isPublic ? 'badge-neutral' : 'badge-ghost'}`}>
                          {project.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <p className="text-[11px] text-base-content/65 line-clamp-2 leading-relaxed mt-1">{project.description}</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-border/40 pt-2.5">
                      <div className="flex flex-wrap gap-1">
                        {project.techStack?.slice(0, 2).map((tech, i) => (
                          <span key={i} className="badge badge-xs bg-base-200 border-none font-semibold text-[8px] rounded-md">{tech}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link to={`/projects/${project._id}`} className="btn btn-ghost hover:bg-primary/5 hover:text-primary btn-xs font-bold rounded-lg text-[9px]">
                          View
                        </Link>
                        <button 
                          onClick={() => handleDeleteProject(project._id)}
                          className="btn btn-ghost hover:bg-danger/5 hover:text-danger btn-xs font-bold rounded-lg text-[9px]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-base-content/50 italic py-2">No projects showcased yet. Click "Add New" to get started!</p>
            )}
          </div>

          {/* Teammate Reviews */}
          <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 transition-colors duration-200">
            <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
              <h2 className="text-lg font-bold flex items-center gap-1.5">
                <Star size={18} className="text-warning" /> Teammate Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1 font-black text-xs text-warning">
                  <Star size={14} fill="currentColor" /> {avgRating} / 5.0
                </div>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <div key={review._id} className="p-4 border border-border rounded-xl bg-surface flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="avatar">
                          <div className="w-6 h-6 rounded-full border border-border">
                            <img 
                              src={review.reviewer?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${review.reviewer?.firstName}`} 
                              alt="Reviewer" 
                            />
                          </div>
                        </div>
                        <span className="text-[11px] font-bold">{review.reviewer?.firstName} {review.reviewer?.lastName}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-warning font-black text-[10px]">
                        <Star size={10} fill="currentColor" /> {review.rating}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-base-content/70 italic leading-relaxed">"{review.comment}"</p>
                    )}
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {review.tags.map((tag, i) => (
                          <span key={i} className="badge badge-xs bg-primary/10 border border-primary/20 text-primary font-bold text-[8px] p-1 px-1.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-base-content/50 italic py-2">No classmate reviews received yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
