import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../Context/AuthContext.jsx';
import { ArrowLeft, Save, Calendar, MapPin, Award, Trash, Plus, FileImage } from 'lucide-react';

export const CreateHackathonPage = () => {
  const navigate = useNavigate();

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState('online');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [venue, setVenue] = useState('');
  const [teamSizeMin, setTeamSizeMin] = useState(1);
  const [teamSizeMax, setTeamSizeMax] = useState(4);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  
  // Prize fields
  const [prizes, setPrizes] = useState([
    { rank: '1st Place', prize: '$1000 + Trophy' },
    { rank: '2nd Place', prize: '$500' }
  ]);
  const [newRank, setNewRank] = useState('');
  const [newPrize, setNewPrize] = useState('');

  // Banner file
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Tags
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Prizes
  const handleAddPrize = (e) => {
    e.preventDefault();
    if (newRank.trim() && newPrize.trim()) {
      setPrizes([...prizes, { rank: newRank.trim(), prize: newPrize.trim() }]);
      setNewRank('');
      setNewPrize('');
    }
  };

  const handleRemovePrize = (index) => {
    setPrizes(prizes.filter((_, idx) => idx !== index));
  };

  // Banner
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Dates check
    if (new Date(startDate) > new Date(endDate)) {
      return setError('Start date must be before end date.');
    }
    if (new Date(registrationDeadline) > new Date(startDate)) {
      return setError('Registration deadline must be before hackathon start date.');
    }
    if (teamSizeMin > teamSizeMax) {
      return setError('Minimum team size cannot be greater than maximum team size.');
    }

    setSaving(true);
    try {
      // 1. Create hackathon
      const res = await api.post('/api/hackathons', {
        title,
        description,
        mode,
        startDate,
        endDate,
        registrationDeadline,
        venue: mode !== 'online' ? venue : '',
        teamSizeMin,
        teamSizeMax,
        prizes,
        tags
      });

      const newHackathon = res.data.data.hackathon;

      // 2. Upload banner if selected
      if (bannerFile && newHackathon._id) {
        const formData = new FormData();
        formData.append('banner', bannerFile);
        await api.post(`/api/hackathons/${newHackathon._id}/banner`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate(`/hackathons/${newHackathon._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create hackathon.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/hackathons')}
        className="btn btn-ghost btn-sm rounded-xl mb-4 font-bold text-xs gap-1 hover:bg-base-200"
      >
        <ArrowLeft size={14} /> Back to Directory
      </button>

      <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-base-content">Host a Hackathon</h1>
          <p className="text-xs text-base-content/50 mt-1">Add dates, prize tiers, team constraints, and manage registrations.</p>
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
              <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Hackathon Title</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. InnovateCollab 2026"
              className="input input-bordered rounded-xl h-10 text-xs w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label p-1">
              <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Description / Details</span>
            </label>
            <textarea 
              rows={4}
              placeholder="Provide a comprehensive summary of the hackathon theme, rules, judging criteria, and schedule."
              className="textarea textarea-bordered rounded-xl text-xs w-full leading-relaxed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Mode & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Mode</span>
              </label>
              <select 
                className="select select-bordered rounded-xl h-10 text-xs"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Venue / Location</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={mode === 'online' ? 'Online event' : 'e.g. Seminar Hall, Block C'}
                  className="input input-bordered rounded-xl h-10 text-xs w-full pl-8"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  disabled={mode === 'online'}
                  required={mode !== 'online'}
                />
                <MapPin size={14} className="absolute left-2.5 top-3.5 text-base-content/40" />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Registration Deadline</span>
              </label>
              <input 
                type="datetime-local" 
                className="input input-bordered rounded-xl h-10 text-xs w-full"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Start Date & Time</span>
              </label>
              <input 
                type="datetime-local" 
                className="input input-bordered rounded-xl h-10 text-xs w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">End Date & Time</span>
              </label>
              <input 
                type="datetime-local" 
                className="input input-bordered rounded-xl h-10 text-xs w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Team Size constraints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Minimum Team Size</span>
              </label>
              <input 
                type="number" 
                min={1}
                className="input input-bordered rounded-xl h-10 text-xs w-full"
                value={teamSizeMin}
                onChange={(e) => setTeamSizeMin(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label p-1">
                <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Maximum Team Size</span>
              </label>
              <input 
                type="number" 
                min={1}
                className="input input-bordered rounded-xl h-10 text-xs w-full"
                value={teamSizeMax}
                onChange={(e) => setTeamSizeMax(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div className="form-control">
            <label className="label p-1">
              <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Tags / Topics (Press Enter or comma to add)</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. AI/ML, Web3, Fintech"
              className="input input-bordered rounded-xl h-10 text-xs w-full"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 bg-surface border border-border rounded-xl">
                {tags.map((tag) => (
                  <span key={tag} className="badge bg-accent/10 border border-accent/20 text-accent font-bold py-2.5 px-3 rounded-lg text-[10px] flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-danger text-[9px]">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Prizes Adder */}
          <div className="form-control border border-border p-4 rounded-2xl bg-surface/40">
            <label className="label p-0 pb-2 border-b border-border">
              <span className="label-text text-[10px] font-bold text-base-content uppercase flex items-center gap-1">
                <Award size={13} /> Prize Tiers & Rewards
              </span>
            </label>

            {/* Existing Prizes */}
            {prizes.length > 0 && (
              <div className="flex flex-col gap-2 mt-3 mb-4">
                {prizes.map((prizeObj, index) => (
                  <div key={index} className="flex justify-between items-center bg-base-100 border border-border p-2.5 rounded-xl">
                    <div>
                      <p className="font-extrabold text-xs text-base-content">{prizeObj.rank}</p>
                      <p className="text-[10px] text-base-content/60 mt-0.5">{prizeObj.prize}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemovePrize(index)}
                      className="btn btn-ghost btn-circle btn-xs hover:text-danger"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Prize inputs */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-end">
              <div className="flex-1 w-full">
                <label className="label p-1"><span className="label-text text-[9px] font-bold text-base-content/50 uppercase">Rank / Title</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. 1st Place / Best Hack" 
                  className="input input-bordered rounded-xl h-9 text-xs w-full bg-base-100"
                  value={newRank}
                  onChange={(e) => setNewRank(e.target.value)}
                />
              </div>
              <div className="flex-grow-[2] w-full">
                <label className="label p-1"><span className="label-text text-[9px] font-bold text-base-content/50 uppercase">Prize Details</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. $1000 Cash + Certificates" 
                  className="input input-bordered rounded-xl h-9 text-xs w-full bg-base-100"
                  value={newPrize}
                  onChange={(e) => setNewPrize(e.target.value)}
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddPrize}
                className="btn btn-outline rounded-xl btn-sm font-bold text-xs h-9 w-full sm:w-auto mt-2"
              >
                Add Tier
              </button>
            </div>
          </div>

          {/* Banner Image Upload */}
          <div className="form-control">
            <label className="label p-1">
              <span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Hackathon Artwork Banner</span>
            </label>
            
            <div className="flex items-center gap-4">
              <div className="relative border-2 border-dashed border-border rounded-xl p-4 flex-1 flex flex-col items-center justify-center text-center gap-2 min-h-32 bg-surface">
                {bannerPreview ? (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden border border-border">
                    <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={handleRemoveBanner}
                      className="absolute top-2 right-2 btn btn-circle btn-xs btn-error text-white font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <FileImage size={24} className="text-base-content/30" />
                    <div>
                      <p className="text-[11px] font-bold">Click to upload banner artwork</p>
                      <p className="text-[9px] text-base-content/40 mt-0.5">Supports PNG, JPG (Max 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleBannerChange}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={saving}
            className="btn btn-primary bg-gradient-to-r from-accent to-secondary border-none text-white rounded-xl font-bold mt-4 shadow-md shadow-accent/20 inline-flex items-center gap-1.5 h-11"
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm text-white"></span>
            ) : (
              <>
                <Save size={16} /> Host & Publish Event
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateHackathonPage;
