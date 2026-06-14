import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';
import { ArrowLeft, User, Mail, Building, GraduationCap, Tag, Link2, FileText, CheckCircle2, AlertCircle, Upload } from 'lucide-react';

export const EditProfilePage = () => {
  const { user, updateUser, updateAvatar } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [college, setCollege] = useState(user?.college || '');
  const [degree, setDegree] = useState(user?.degree || 'B.Tech');
  const [branch, setBranch] = useState(user?.branch || '');
  const [year, setYear] = useState(user?.year || 1);
  const [availability, setAvailability] = useState(user?.availability || 'available');
  
  const [githubURL, setGithubURL] = useState(user?.githubURL || '');
  const [linkedinURL, setLinkedinURL] = useState(user?.linkedinURL || '');
  const [portfolioURL, setPortfolioURL] = useState(user?.portfolioURL || '');
  
  const [interestsInput, setInterestsInput] = useState('');
  const [interests, setInterests] = useState(user?.interests || []);
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddInterest = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = interestsInput.trim().replace(/,/g, '');
      if (val && !interests.includes(val)) {
        setInterests([...interests, val]);
        setInterestsInput('');
      }
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setInterests(interests.filter((i) => i !== interestToRemove));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return setError('Avatar size cannot exceed 5MB.');
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. Upload Avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await updateAvatar(formData);
      }

      // 2. Update profile details
      const profileData = {
        firstName,
        lastName,
        bio,
        college,
        degree,
        branch,
        year: parseInt(year, 10),
        availability,
        githubURL,
        linkedinURL,
        portfolioURL,
        interests
      };

      await updateUser(profileData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Back to Profile */}
      <button 
        onClick={() => navigate('/profile')} 
        className="btn btn-ghost btn-sm rounded-xl mb-4 font-semibold inline-flex items-center gap-1 hover:bg-base-200"
      >
        <ArrowLeft size={16} /> Back to Profile
      </button>

      <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 sm:p-8 transition-colors duration-200">
        <div className="border-b border-border pb-4 mb-6">
          <h1 className="text-2xl font-extrabold text-base-content">Edit Profile</h1>
          <p className="text-xs text-base-content/60 mt-1">Manage your public information and matching details</p>
        </div>

        {error && (
          <div className="alert alert-error rounded-xl py-3 px-4 flex items-center gap-2 mb-6">
            <AlertCircle size={18} className="shrink-0" />
            <span className="text-xs font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success rounded-xl py-3 px-4 flex items-center gap-2 mb-6">
            <CheckCircle2 size={18} className="shrink-0" />
            <span className="text-xs font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Avatar Upload Grid */}
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-border pb-6">
            <div className="avatar border border-border rounded-full p-1 bg-base-200">
              <div className="w-24 rounded-full">
                <img 
                  src={avatarPreview || 'https://res.cloudinary.com/dgtyqhtor/image/upload/v1700000000/default-avatar.png'} 
                  alt="Avatar Preview" 
                  onError={(e) => {
                    e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + firstName;
                  }}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <span className="text-sm font-semibold">Profile Picture</span>
              <span className="text-xs text-base-content/50">Upload a fresh JPG, PNG, or WebP. Max size 5MB.</span>
              <label className="btn btn-outline btn-sm rounded-xl font-semibold mt-1 inline-flex items-center gap-1.5 cursor-pointer">
                <Upload size={14} /> Choose Photo
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Form Fields: Personal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1"><span className="label-text font-semibold text-xs">First Name</span></label>
              <div className="input input-bordered flex items-center gap-2 rounded-xl">
                <User size={16} className="text-base-content/40" />
                <input 
                  type="text" 
                  className="grow text-sm" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text font-semibold text-xs">Last Name</span></label>
              <div className="input input-bordered flex items-center gap-2 rounded-xl">
                <User size={16} className="text-base-content/40" />
                <input 
                  type="text" 
                  className="grow text-sm" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Form Fields: Bio */}
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-semibold text-xs">Bio / Summary</span></label>
            <textarea 
              className="textarea textarea-bordered rounded-xl text-sm h-28" 
              placeholder="Tell other students what you enjoy building, your core tech stack, and your goals..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
            />
            <label className="label py-1 justify-end">
              <span className="label-text-alt text-base-content/40">{bio.length}/500 chars</span>
            </label>
          </div>

          {/* Form Fields: Academic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1"><span className="label-text font-semibold text-xs">College / University</span></label>
              <div className="input input-bordered flex items-center gap-2 rounded-xl">
                <Building size={16} className="text-base-content/40" />
                <input 
                  type="text" 
                  className="grow text-sm" 
                  value={college} 
                  onChange={(e) => setCollege(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text font-semibold text-xs">Branch / Course</span></label>
              <div className="input input-bordered flex items-center gap-2 rounded-xl">
                <GraduationCap size={16} className="text-base-content/40" />
                <input 
                  type="text" 
                  className="grow text-sm" 
                  value={branch} 
                  onChange={(e) => setBranch(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text font-semibold text-xs">Degree</span></label>
              <select 
                className="select select-bordered rounded-xl text-sm" 
                value={degree} 
                onChange={(e) => setDegree(e.target.value)}
              >
                <option value="B.Tech">B.Tech</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="B.Sc">B.Sc</option>
                <option value="M.Tech">M.Tech</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text font-semibold text-xs">Year</span></label>
              <select 
                className="select select-bordered rounded-xl text-sm" 
                value={year} 
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
              </select>
            </div>
          </div>

          {/* Form Fields: Availability */}
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-semibold text-xs">Availability Status</span></label>
            <select 
              className="select select-bordered rounded-xl text-sm"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="available">🟢 Available for new projects</option>
              <option value="busy">🟡 Busy with other projects</option>
              <option value="not_looking">🔴 Not looking for teams</option>
            </select>
          </div>

          {/* Form Fields: Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label py-1"><span className="label-text font-semibold text-xs">GitHub Link</span></label>
              <div className="input input-bordered flex items-center gap-2 rounded-xl">
                <Link2 size={16} className="text-base-content/40" />
                <input 
                  type="url" 
                  className="grow text-sm" 
                  value={githubURL} 
                  onChange={(e) => setGithubURL(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text font-semibold text-xs">LinkedIn Link</span></label>
              <div className="input input-bordered flex items-center gap-2 rounded-xl">
                <Link2 size={16} className="text-base-content/40" />
                <input 
                  type="url" 
                  className="grow text-sm" 
                  value={linkedinURL} 
                  onChange={(e) => setLinkedinURL(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text font-semibold text-xs">Portfolio Link</span></label>
              <div className="input input-bordered flex items-center gap-2 rounded-xl">
                <Link2 size={16} className="text-base-content/40" />
                <input 
                  type="url" 
                  className="grow text-sm" 
                  value={portfolioURL} 
                  onChange={(e) => setPortfolioURL(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Form Fields: Interests */}
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-semibold text-xs">Interests / Focus Areas</span></label>
            <div className="input input-bordered flex items-center gap-2 rounded-xl">
              <Tag size={16} className="text-base-content/40" />
              <input 
                type="text" 
                className="grow text-sm" 
                placeholder="Press Enter to add focus areas (e.g. Web, AI)" 
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                onKeyDown={handleAddInterest}
              />
            </div>
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {interests.map((interest, idx) => (
                  <div key={idx} className="badge badge-primary gap-1 p-2.5 text-xs font-semibold rounded-lg">
                    {interest}
                    <button type="button" onClick={() => handleRemoveInterest(interest)} className="hover:text-red-200">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save & Cancel */}
          <div className="flex gap-4 border-t border-border pt-6 mt-4">
            <button 
              type="button" 
              onClick={() => navigate('/profile')}
              className="btn btn-outline flex-1 rounded-xl font-bold"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn btn-primary flex-1 rounded-xl font-bold ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
