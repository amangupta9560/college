import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../Context/AuthContext.jsx';
import { FolderKanban, Info, Users, PlusCircle, Trash, ArrowRight, ArrowLeft, Layers, AlertCircle } from 'lucide-react';

export const CreateTeamPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Core Details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('hackathon');

  // Step 2: Roster Rules
  const [maxSize, setMaxSize] = useState(5);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);

  // Step 3: Recruitment Roles
  const [roleInput, setRoleInput] = useState('');
  const [openRoles, setOpenRoles] = useState([]);

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim().replace(/,/g, '');
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
        setSkillInput('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddRole = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = roleInput.trim().replace(/,/g, '');
      if (val && !openRoles.includes(val)) {
        setOpenRoles([...openRoles, val]);
        setRoleInput('');
      }
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    setOpenRoles(openRoles.filter(r => r !== roleToRemove));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!name || !description) {
        return setError('Team name and description are required.');
      }
      if (name.length > 80) {
        return setError('Team name cannot exceed 80 characters.');
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const teamPayload = {
      name,
      description,
      projectType,
      maxSize: parseInt(maxSize, 10),
      skills,
      openRoles,
      isPublic: true
    };

    try {
      const res = await api.post('/api/teams', teamPayload);
      const teamSlug = res.data.data.team.slug;
      navigate(`/teams/${teamSlug}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create team. You may already lead 3 active teams.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 relative">
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl opacity-10"></div>

      <div className="card bg-base-100 border border-border shadow-xl rounded-2xl p-6 sm:p-8 relative z-10 transition-colors duration-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white mb-3">
            <Layers size={20} />
          </div>
          <h1 className="text-2xl font-black">Create a Team</h1>
          <p className="text-xs text-base-content/60 mt-1">Assemble your dream team in few simple steps</p>
        </div>

        {/* Stepper Progress */}
        <ul className="steps steps-horizontal w-full text-xs font-semibold mb-6">
          <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Details</li>
          <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Roster</li>
          <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>Recruit</li>
        </ul>

        {error && (
          <div className="alert alert-error rounded-xl py-3 px-4 flex items-center gap-2 mb-6">
            <AlertCircle size={18} className="shrink-0" />
            <span className="text-xs font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">
          {/* STEP 1: Core Details */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold text-base-content/65 uppercase">Team / Project Name</span></label>
                <div className="input input-bordered flex items-center gap-2 rounded-xl">
                  <FolderKanban size={16} className="text-base-content/40" />
                  <input 
                    type="text"
                    className="grow text-sm"
                    placeholder="e.g. AI-Powered Smart Campus"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold text-base-content/65 uppercase">Project Type</span></label>
                <select 
                  className="select select-bordered rounded-xl text-sm"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                >
                  <option value="hackathon">Hackathon Project</option>
                  <option value="fyp">Final Year Project</option>
                  <option value="startup">Startup Competition</option>
                  <option value="research">Academic Research</option>
                  <option value="opensource">Open Source Initiative</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold text-base-content/65 uppercase">Project Description</span></label>
                <textarea
                  className="textarea textarea-bordered rounded-xl text-xs h-28 font-normal"
                  placeholder="Describe what you plan to build, the goals, and the problems you want to solve..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  required
                />
                <label className="label py-1 justify-end">
                  <span className="label-text-alt text-[10px] text-base-content/40 font-normal">{description.length}/1000 chars</span>
                </label>
              </div>

              <button type="button" onClick={nextStep} className="btn btn-primary rounded-xl font-bold mt-2">
                Continue <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          )}

          {/* STEP 2: Roster & Size Limits */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold text-base-content/65 uppercase">Maximum Team Size</span></label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="2" 
                    max="10" 
                    value={maxSize} 
                    onChange={(e) => setMaxSize(parseInt(e.target.value, 10))}
                    className="range range-primary" 
                  />
                  <span className="badge badge-lg badge-outline border-border p-4 font-black w-12">{maxSize}</span>
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold text-base-content/65 uppercase">Target Tech Skills Required</span></label>
                <div className="input input-bordered flex items-center gap-2 rounded-xl">
                  <PlusCircle size={16} className="text-base-content/40" />
                  <input 
                    type="text"
                    className="grow text-sm font-normal"
                    placeholder="React, Docker, Python (press Enter)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                  />
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skills.map((skill, idx) => (
                      <div key={idx} className="badge badge-primary gap-1 p-2.5 text-xs font-semibold rounded-lg">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-200">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                <button type="button" onClick={prevStep} className="btn btn-outline flex-1 rounded-xl font-bold">
                  <ArrowLeft size={16} className="mr-1" /> Back
                </button>
                <button type="button" onClick={nextStep} className="btn btn-primary flex-1 rounded-xl font-bold">
                  Continue <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Recruitment Roles & Finalize */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label py-1"><span className="label-text font-bold text-base-content/65 uppercase">Post Recruitment Roles</span></label>
                <div className="input input-bordered flex items-center gap-2 rounded-xl">
                  <PlusCircle size={16} className="text-base-content/40" />
                  <input 
                    type="text"
                    className="grow text-sm font-normal"
                    placeholder="e.g. Frontend Dev, ML Expert (press Enter)"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={handleAddRole}
                  />
                </div>
                {openRoles.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {openRoles.map((role, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-surface border border-border rounded-xl">
                        <span className="text-xs text-primary font-bold">{role}</span>
                        <button type="button" onClick={() => handleRemoveRole(role)} className="btn btn-ghost btn-circle btn-xs text-error">
                          <Trash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button type="button" onClick={prevStep} className="btn btn-outline flex-1 rounded-xl font-bold" disabled={loading}>
                  <ArrowLeft size={16} className="mr-1" /> Back
                </button>
                <button type="submit" className={`btn btn-primary flex-1 rounded-xl font-bold ${loading ? 'loading' : ''}`} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateTeamPage;
