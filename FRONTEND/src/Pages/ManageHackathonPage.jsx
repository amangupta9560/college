import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../Context/AuthContext.jsx';
import { ArrowLeft, Save, Calendar, MapPin, Award, Trash, Plus, FileImage, Users, CheckCircle } from 'lucide-react';

export const ManageHackathonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Loading/saving
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
  const [registeredTeams, setRegisteredTeams] = useState([]);

  // Prizes
  const [prizes, setPrizes] = useState([]);
  const [newRank, setNewRank] = useState('');
  const [newPrize, setNewPrize] = useState('');

  // Banner file
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');

  const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(date - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const fetchHackathonDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/hackathons/${id}`);
      const h = res.data.data.hackathon;
      
      setTitle(h.title);
      setDescription(h.description);
      setMode(h.mode);
      setStartDate(formatDateTimeLocal(h.startDate));
      setEndDate(formatDateTimeLocal(h.endDate));
      setRegistrationDeadline(formatDateTimeLocal(h.registrationDeadline));
      setVenue(h.venue || '');
      setTeamSizeMin(h.teamSizeMin);
      setTeamSizeMax(h.teamSizeMax);
      setTags(h.tags || []);
      setPrizes(h.prizes || []);
      setRegisteredTeams(h.registeredTeams || []);
      setBannerPreview(h.bannerURL || '');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch hackathon details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchHackathonDetails();
    }
  }, [id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      // 1. Update hackathon
      await api.patch(`/api/hackathons/${id}`, {
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

      // 2. Upload banner if selected
      if (bannerFile) {
        const formData = new FormData();
        formData.append('banner', bannerFile);
        const uploadRes = await api.post(`/api/hackathons/${id}/banner`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setBannerPreview(uploadRes.data.data.bannerURL);
        setBannerFile(null);
      }

      setSuccess('Hackathon details updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update hackathon.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-surface">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <button 
        onClick={() => navigate(`/hackathons/${id}`)}
        className="btn btn-ghost btn-sm rounded-xl mb-2 font-bold text-xs gap-1 hover:bg-base-200 w-max"
      >
        <ArrowLeft size={14} /> Back to Detail
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Form */}
        <div className="lg:col-span-2 card bg-base-100 border border-border shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-extrabold text-base-content">Edit Hackathon Info</h1>
            <p className="text-xs text-base-content/50 mt-1">Update event parameters, dates, and rewards.</p>
          </div>

          {error && (
            <div className="alert alert-error rounded-xl py-3 text-xs font-bold text-white">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success rounded-xl py-3 text-xs font-bold text-white flex items-center gap-1">
              <CheckCircle size={14} /> <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs font-semibold">
            {/* Title */}
            <div className="form-control">
              <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Hackathon Title</span></label>
              <input 
                type="text" 
                className="input input-bordered rounded-xl h-10 text-xs w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Description</span></label>
              <textarea 
                rows={5}
                className="textarea textarea-bordered rounded-xl text-xs w-full leading-relaxed"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Mode & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Mode</span></label>
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
                <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Venue / Location</span></label>
                <input 
                  type="text" 
                  className="input input-bordered rounded-xl h-10 text-xs w-full"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  disabled={mode === 'online'}
                  required={mode !== 'online'}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Reg. Deadline</span></label>
                <input 
                  type="datetime-local" 
                  className="input input-bordered rounded-xl h-10 text-xs w-full"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Start Date</span></label>
                <input 
                  type="datetime-local" 
                  className="input input-bordered rounded-xl h-10 text-xs w-full"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">End Date</span></label>
                <input 
                  type="datetime-local" 
                  className="input input-bordered rounded-xl h-10 text-xs w-full"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Sizes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Min Team Size</span></label>
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
                <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Max Team Size</span></label>
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
              <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Tags (Press Enter to add)</span></label>
              <input 
                type="text" 
                placeholder="Add tags..."
                className="input input-bordered rounded-xl h-10 text-xs w-full"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map(t => (
                  <span key={t} className="badge bg-primary/10 border border-primary/20 text-primary font-bold py-2.5 px-3 rounded-lg text-[10px] flex items-center gap-1">
                    {t} <button type="button" onClick={() => handleRemoveTag(t)}>✕</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Prizes */}
            <div className="form-control border border-border p-4 rounded-2xl bg-surface/40">
              <label className="label p-0 pb-2 border-b border-border"><span className="label-text text-[10px] font-bold text-base-content uppercase">Prizes & Rewards</span></label>
              <div className="flex flex-col gap-2 mt-3 mb-3">
                {prizes.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-base-100 border border-border p-2 rounded-lg">
                    <div>
                      <p className="font-extrabold text-[11px]">{p.rank}</p>
                      <p className="text-[10px] text-base-content/50">{p.prize}</p>
                    </div>
                    <button type="button" onClick={() => handleRemovePrize(idx)} className="btn btn-ghost btn-circle btn-xs hover:text-danger">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Rank" className="input input-bordered rounded-xl h-9 text-xs flex-1 bg-base-100" value={newRank} onChange={e=>setNewRank(e.target.value)} />
                <input type="text" placeholder="Prize details" className="input input-bordered rounded-xl h-9 text-xs flex-[2] bg-base-100" value={newPrize} onChange={e=>setNewPrize(e.target.value)} />
                <button type="button" onClick={handleAddPrize} className="btn btn-outline rounded-xl btn-xs h-9">Add</button>
              </div>
            </div>

            {/* Banner Artwork */}
            <div className="form-control">
              <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Banner Artwork</span></label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 min-h-32 bg-surface relative">
                {bannerPreview ? (
                  <div className="w-full h-28 rounded-lg overflow-hidden border border-border relative">
                    <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleBannerChange} />
                  </div>
                ) : (
                  <>
                    <FileImage size={24} className="text-base-content/30" />
                    <div>
                      <p className="text-[11px] font-bold">Upload banner image</p>
                    </div>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleBannerChange} />
                  </>
                )}
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary rounded-xl font-bold mt-4 shadow-md shadow-primary/20 h-11">
              {saving ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Registered Teams Sidebar list */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6">
            <h3 className="font-extrabold text-sm mb-4 border-b border-border pb-2 flex items-center gap-1.5"><Users size={16} /> Registrations Roster</h3>
            
            {registeredTeams.length > 0 ? (
              <div className="flex flex-col gap-3">
                {registeredTeams.map(t => (
                  <div key={t._id} className="p-3 border border-border rounded-xl bg-surface flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="avatar">
                        <div className="w-6 h-6 rounded-lg border border-border">
                          <img src={t.avatarURL || `https://api.dicebear.com/7.x/initials/svg?seed=${t.name}`} alt="Team" />
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold truncate max-w-[130px]">{t.name}</span>
                    </div>
                    <div className="text-[9px] text-base-content/40 font-bold">
                      <p>Members Count: {t.members?.length || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-base-content/40 italic py-4">No registrations on roster yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageHackathonPage;
