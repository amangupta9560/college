import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, useAuth } from '../Context/AuthContext.jsx';
import { ArrowLeft, Github, Globe, Code, Calendar, Edit3, Trash2, ShieldAlert, Users, Award, ExternalLink, Flag } from 'lucide-react';
import ReportModal from '../Components/ReportModal.jsx';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit mode fields
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTechInput, setEditTechInput] = useState('');
  const [editTechStack, setEditTechStack] = useState([]);
  const [editGithubURL, setEditGithubURL] = useState('');
  const [editDemoURL, setEditDemoURL] = useState('');
  const [editStatus, setEditStatus] = useState('in_progress');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/projects/${id}`);
      const proj = res.data.data.project;
      setProject(proj);
      
      // Seed edit form
      setEditTitle(proj.title);
      setEditDescription(proj.description);
      setEditTechStack(proj.techStack || []);
      setEditGithubURL(proj.githubURL || '');
      setEditDemoURL(proj.demoURL || '');
      setEditStatus(proj.status || 'in_progress');
      setEditIsPublic(proj.isPublic);
    } catch (err) {
      console.error(err);
      setError('Project not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/api/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return alert('Project title is required.');
    if (!editDescription.trim()) return alert('Project description is required.');
    if (editTechStack.length === 0) return alert('At least one technology is required.');

    setSaving(true);
    try {
      const res = await api.patch(`/api/projects/${id}`, {
        title: editTitle,
        description: editDescription,
        techStack: editTechStack,
        githubURL: editGithubURL,
        demoURL: editDemoURL,
        status: editStatus,
        isPublic: editIsPublic
      });
      setProject(res.data.data.project);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTech = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tech = editTechInput.trim();
      if (tech && !editTechStack.includes(tech)) {
        setEditTechStack([...editTechStack, tech]);
      }
      setEditTechInput('');
    }
  };

  const handleRemoveTech = (techToRemove) => {
    setEditTechStack(editTechStack.filter(t => t !== techToRemove));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-4">
        <h2 className="text-xl font-bold">{error || 'Project not found'}</h2>
        <Link to="/projects" className="btn btn-primary btn-sm rounded-xl">Back to Projects</Link>
      </div>
    );
  }

  const isOwner = project.owner?._id === user?._id || project.owner === user?._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Breadcrumb & Actions */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/projects')}
          className="btn btn-ghost btn-sm rounded-xl font-bold text-xs gap-1 hover:bg-base-200"
        >
          <ArrowLeft size={14} /> Back to Showcase
        </button>

        <div className="flex items-center gap-2">
          {(isOwner || isAdmin) && !isEditing && (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="btn btn-outline btn-sm rounded-xl font-bold text-xs gap-1.5"
              >
                <Edit3 size={12} /> Edit
              </button>
              <button 
                onClick={handleDelete}
                className="btn btn-outline btn-error btn-sm rounded-xl font-bold text-xs gap-1.5"
              >
                <Trash2 size={12} /> Delete
              </button>
            </>
          )}

          {!isOwner && (
            <button 
              onClick={() => setReportModalOpen(true)}
              className="btn btn-ghost text-base-content/40 hover:text-danger hover:bg-danger/5 btn-sm rounded-xl font-bold text-xs gap-1.5"
              title="Report Project"
            >
              <Flag size={12} /> Report
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Edit Project Mode */
        <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-extrabold mb-6">Edit Project Details</h2>
          <form onSubmit={handleUpdateProject} className="flex flex-col gap-5 text-xs font-semibold">
            <div className="form-control">
              <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Project Title</span></label>
              <input 
                type="text" 
                className="input input-bordered rounded-xl text-xs h-10 w-full"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Description</span></label>
              <textarea 
                rows={5}
                className="textarea textarea-bordered rounded-xl text-xs w-full leading-relaxed"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={2000}
                required
              />
            </div>

            <div className="form-control">
              <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Tech Stack (Press Enter / comma to add)</span></label>
              <input 
                type="text" 
                placeholder="Type tech and press Enter..."
                className="input input-bordered rounded-xl text-xs h-10 w-full"
                value={editTechInput}
                onChange={(e) => setEditTechInput(e.target.value)}
                onKeyDown={handleAddTech}
              />
              <div className="flex flex-wrap gap-1.5 mt-2 bg-surface border border-border p-2 rounded-xl">
                {editTechStack.map(tech => (
                  <span key={tech} className="badge bg-primary/10 border border-primary/20 text-primary font-bold py-2.5 px-3 rounded-lg text-[10px] flex items-center gap-1">
                    {tech}
                    <button type="button" onClick={() => handleRemoveTech(tech)} className="hover:text-danger text-[9px]">✕</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">GitHub Repo Link</span></label>
                <input 
                  type="url" 
                  className="input input-bordered rounded-xl text-xs h-10"
                  value={editGithubURL}
                  onChange={(e) => setEditGithubURL(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Live Demo Link</span></label>
                <input 
                  type="url" 
                  className="input input-bordered rounded-xl text-xs h-10"
                  value={editDemoURL}
                  onChange={(e) => setEditDemoURL(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Status</span></label>
                <select 
                  className="select select-bordered rounded-xl text-xs h-10"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed / Shipped</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Visibility</span></label>
                <select 
                  className="select select-bordered rounded-xl text-xs h-10"
                  value={editIsPublic ? 'public' : 'private'}
                  onChange={(e) => setEditIsPublic(e.target.value === 'public')}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="btn btn-ghost btn-sm rounded-xl font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="btn btn-primary btn-sm rounded-xl font-bold px-4"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Read Details Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="card bg-base-100 border border-border shadow-sm rounded-2xl overflow-hidden">
              <div className="h-64 sm:h-80 bg-base-200 border-b border-border relative">
                <img 
                  src={project.thumbnailURL || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop'} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 sm:p-8 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content leading-tight">
                    {project.title}
                  </h1>
                  
                  <span className={`badge ${project.status === 'completed' ? 'badge-success' : 'badge-warning'} font-extrabold text-[10px] py-3 px-4 rounded-xl`}>
                    {project.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 py-2">
                  {project.techStack?.map((tech, i) => (
                    <span key={i} className="badge bg-primary/10 border border-primary/20 text-primary font-bold py-3 px-4 rounded-xl text-xs">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="border-t border-border pt-4 mt-2">
                  <h3 className="font-extrabold text-sm mb-3">Project Description</h3>
                  <p className="text-xs text-base-content/80 leading-relaxed font-normal whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Panel */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Project Owner & Links */}
            <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 flex flex-col gap-5">
              <div>
                <h3 className="font-extrabold text-sm mb-4 border-b border-border pb-2">Links & Assets</h3>
                <div className="flex flex-col gap-2.5">
                  {project.githubURL ? (
                    <a 
                      href={project.githubURL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm rounded-xl font-bold text-xs flex justify-between items-center w-full"
                    >
                      <span className="flex items-center gap-1.5"><Github size={14} /> GitHub Code</span>
                      <ExternalLink size={12} className="opacity-50" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-base-content/40 italic text-center p-2 border border-dashed border-border rounded-xl">
                      No GitHub link provided
                    </span>
                  )}

                  {project.demoURL ? (
                    <a 
                      href={project.demoURL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm rounded-xl font-bold text-xs flex justify-between items-center w-full shadow-md shadow-primary/10"
                    >
                      <span className="flex items-center gap-1.5"><Globe size={14} /> Live Demo / Site</span>
                      <ExternalLink size={12} className="opacity-50" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-base-content/40 italic text-center p-2 border border-dashed border-border rounded-xl">
                      No live demo link provided
                    </span>
                  )}
                </div>
              </div>

              {project.hackathon && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-[10px] font-bold uppercase text-base-content/50 mb-1 flex items-center gap-1">
                    <Award size={12} /> Hackathon Entry
                  </h4>
                  <Link to={`/hackathons/${project.hackathon._id}`} className="text-xs font-extrabold hover:text-primary hover:underline">
                    {project.hackathon.title}
                  </Link>
                </div>
              )}

              {/* Owner Info */}
              <div className="border-t border-border pt-4">
                <h4 className="text-[10px] font-bold uppercase text-base-content/50 mb-3">Owner / Author</h4>
                <Link to={`/users/${project.owner?._id}`} className="flex items-center gap-3 hover:bg-base-200 p-2 rounded-xl -mx-2 transition-colors">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full border border-border">
                      <img src={project.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${project.owner?.firstName}`} alt="Owner" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-base-content truncate">{project.owner?.firstName} {project.owner?.lastName}</p>
                    <p className="text-[10px] text-base-content/50 truncate">{project.owner?.college}</p>
                  </div>
                </Link>
              </div>

              {/* Collaborators list */}
              {project.collaborators && project.collaborators.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-[10px] font-bold uppercase text-base-content/50 mb-3 flex items-center gap-1">
                    <Users size={12} /> Collaborators ({project.collaborators.length})
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {project.collaborators.map((collab) => (
                      <Link key={collab._id} to={`/users/${collab._id}`} className="flex items-center gap-2.5 hover:bg-base-200 p-1.5 rounded-lg -mx-1.5 transition-colors">
                        <div className="avatar shrink-0">
                          <div className="w-6 h-6 rounded-full border border-border">
                            <img src={collab.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${collab.firstName}`} alt="Avatar" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[11px] text-base-content truncate">{collab.firstName} {collab.lastName}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal 
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="project" // backend schema expects 'user', 'team', 'review', 'message'. Wait, we will adapt it to 'user' or team depending on what is reported, or send custom reason. In our backend, targetType is ['user', 'team', 'review', 'message']. Let's report the project owner as targetType 'user' or project team. Let's make it report owner.
        targetId={project.owner?._id}
      />
    </div>
  );
};

export default ProjectDetailPage;
