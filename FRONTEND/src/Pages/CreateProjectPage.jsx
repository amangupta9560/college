import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../Context/AuthContext.jsx';
import { ArrowLeft, Save, Code, Link as LinkIcon, Users, FileImage, Trash, Search, Plus } from 'lucide-react';

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [githubURL, setGithubURL] = useState('');
  const [demoURL, setDemoURL] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [status, setStatus] = useState('in_progress');
  
  // Collaborators search
  const [userQuery, setUserQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Thumbnail file
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Handle tech stack tags adding
  const handleAddTech = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tech = techInput.trim();
      if (tech && !techStack.includes(tech)) {
        setTechStack([...techStack, tech]);
      }
      setTechInput('');
    }
  };

  const handleRemoveTech = (techToRemove) => {
    setTechStack(techStack.filter(t => t !== techToRemove));
  };

  // Search users for collaborators
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (userQuery.trim().length >= 2) {
        setSearching(true);
        try {
          const res = await api.get(`/api/users/search?q=${encodeURIComponent(userQuery)}`);
          // Filter out users already in collaborators list
          const collabsIds = collaborators.map(c => c._id);
          const results = (res.data.data.users || []).filter(u => !collabsIds.includes(u._id));
          setSearchResults(results);
        } catch (err) {
          console.error('Error searching users:', err);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [userQuery, collaborators]);

  const handleAddCollaborator = (user) => {
    setCollaborators([...collaborators, user]);
    setUserQuery('');
    setSearchResults([]);
  };

  const handleRemoveCollaborator = (userId) => {
    setCollaborators(collaborators.filter(c => c._id !== userId));
  };

  // Handle image select
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!title.trim()) return setError('Project title is required.');
    if (!description.trim()) return setError('Project description is required.');
    if (techStack.length === 0) return setError('At least one technology must be listed.');

    setSaving(true);
    try {
      // 1. Create project metadata
      const res = await api.post('/api/projects', {
        title,
        description,
        techStack,
        githubURL,
        demoURL,
        collaborators: collaborators.map(c => c._id),
        isPublic,
        status
      });

      const newProject = res.data.data.project;

      // 2. If thumbnail selected, upload it
      if (thumbnailFile && newProject._id) {
        const formData = new FormData();
        formData.append('thumbnail', thumbnailFile);
        await api.post(`/api/projects/${newProject._id}/thumbnail`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate(`/projects/${newProject._id || ''}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Breadcrumb */}
      <button 
        onClick={() => navigate('/projects')}
        className="btn btn-ghost btn-sm rounded-xl mb-4 font-bold text-xs gap-1 hover:bg-base-200"
      >
        <ArrowLeft size={14} /> Back to Projects
      </button>

      <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-base-content">Share a Project Showcase</h1>
          <p className="text-xs text-base-content/50 mt-1">Publish your hackathon hacks, group works, or personal side projects.</p>
        </div>

        {error && (
          <div className="alert alert-error rounded-xl py-3 text-xs font-bold gap-2 text-white">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs font-semibold">
          {/* Title */}
          <div className="form-control">
            <label className="label p-1">
              <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Project Title</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. HackMatch App"
              className="input input-bordered rounded-xl h-10 text-xs w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label p-1">
              <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Description / Overview</span>
            </label>
            <textarea 
              rows={4}
              placeholder="What does your project do? What technologies were used? What problems did it solve? (Max 2000 characters)"
              className="textarea textarea-bordered rounded-xl text-xs w-full leading-relaxed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              required
            />
          </div>

          {/* Tech Stack */}
          <div className="form-control">
            <label className="label p-1">
              <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Tech Stack (Press Enter or comma to add)</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. React, Node.js, TailwindCSS"
              className="input input-bordered rounded-xl h-10 text-xs w-full"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleAddTech}
            />
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 bg-surface border border-border rounded-xl">
                {techStack.map((tech) => (
                  <span key={tech} className="badge bg-primary/10 border border-primary/20 text-primary font-bold py-2.5 px-3 rounded-lg text-[10px] flex items-center gap-1">
                    {tech}
                    <button type="button" onClick={() => handleRemoveTech(tech)} className="hover:text-danger text-[9px]">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* External Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">GitHub Repository Link</span>
              </label>
              <div className="relative">
                <input 
                  type="url" 
                  placeholder="https://github.com/username/project"
                  className="input input-bordered rounded-xl h-10 text-xs w-full pl-8"
                  value={githubURL}
                  onChange={(e) => setGithubURL(e.target.value)}
                />
                <LinkIcon size={14} className="absolute left-2.5 top-3.5 text-base-content/40" />
              </div>
            </div>

            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Live Demo Link</span>
              </label>
              <div className="relative">
                <input 
                  type="url" 
                  placeholder="https://my-demo.com"
                  className="input input-bordered rounded-xl h-10 text-xs w-full pl-8"
                  value={demoURL}
                  onChange={(e) => setDemoURL(e.target.value)}
                />
                <LinkIcon size={14} className="absolute left-2.5 top-3.5 text-base-content/40" />
              </div>
            </div>
          </div>

          {/* Visibility and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Development Status</span>
              </label>
              <select 
                className="select select-bordered rounded-xl h-10 text-xs"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed / Shipped</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Visibility</span>
              </label>
              <select 
                className="select select-bordered rounded-xl h-10 text-xs"
                value={isPublic ? 'public' : 'private'}
                onChange={(e) => setIsPublic(e.target.value === 'public')}
              >
                <option value="public">Public (Show on profile and feed)</option>
                <option value="private">Private (Only you can see)</option>
              </select>
            </div>
          </div>

          {/* Contributors / Collaborators search */}
          <div className="form-control">
            <label className="label p-1">
              <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Add Teammates / Collaborators</span>
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search user by name..."
                className="input input-bordered rounded-xl h-10 text-xs w-full pl-8"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
              <Search size={14} className="absolute left-2.5 top-3.5 text-base-content/40" />
            </div>
            
            {searching && (
              <span className="loading loading-dots loading-xs text-primary mt-1.5 ml-1"></span>
            )}
            
            {searchResults.length > 0 && (
              <ul className="menu bg-base-100 border border-border mt-1.5 rounded-xl max-h-40 overflow-y-auto p-1.5 gap-1 shadow-md">
                {searchResults.map((user) => (
                  <li key={user._id}>
                    <button 
                      type="button" 
                      onClick={() => handleAddCollaborator(user)}
                      className="rounded-lg text-xs py-1.5 px-3 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="avatar">
                          <div className="w-5 h-5 rounded-full">
                            <img src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`} alt="User avatar" />
                          </div>
                        </div>
                        <span className="font-extrabold">{user.firstName} {user.lastName}</span>
                      </div>
                      <span className="text-[9px] text-base-content/40">{user.college}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {collaborators.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5 p-2 bg-surface border border-border rounded-xl">
                {collaborators.map((collab) => (
                  <div key={collab._id} className="flex items-center gap-1.5 bg-base-100 border border-border p-1.5 rounded-lg">
                    <div className="avatar shrink-0">
                      <div className="w-4 h-4 rounded-full">
                        <img src={collab.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${collab.firstName}`} alt="Avatar" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold">{collab.firstName} {collab.lastName}</span>
                    <button type="button" onClick={() => handleRemoveCollaborator(collab._id)} className="hover:text-danger text-[9px] ml-1">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Thumbnail Upload */}
          <div className="form-control">
            <label className="label p-1">
              <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Project Thumbnail Banner</span>
            </label>
            
            <div className="flex items-center gap-4">
              <div className="relative border-2 border-dashed border-border rounded-xl p-4 flex-1 flex flex-col items-center justify-center text-center gap-2 min-h-32 bg-surface">
                {thumbnailPreview ? (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden border border-border">
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={handleRemoveThumbnail}
                      className="absolute top-2 right-2 btn btn-circle btn-xs btn-error text-white font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <FileImage size={24} className="text-base-content/30" />
                    <div>
                      <p className="text-[11px] font-bold">Click to upload banner</p>
                      <p className="text-[9px] text-base-content/40 mt-0.5">Supports PNG, JPG (Max 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleThumbnailChange}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={saving}
            className="btn btn-primary rounded-xl font-bold mt-4 shadow-md shadow-primary/20 inline-flex items-center gap-1.5 h-11"
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm text-white"></span>
            ) : (
              <>
                <Save size={16} /> Save & Publish
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;
