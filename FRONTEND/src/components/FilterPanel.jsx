import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { api } from '../Context/AuthContext.jsx';

export const FilterPanel = ({ onApplyFilters, showAvailability = false, showProjectType = false }) => {
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [availability, setAvailability] = useState('');
  const [projectType, setProjectType] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);

  useEffect(() => {
    // Fetch skills from admin database to show in multi-select filter
    const fetchSkills = async () => {
      try {
        const res = await api.get('/api/users/me'); // Just to hit a safe endpoint, or search
        // We can fetch skills from users or write a public endpoint. Since there's no public skill fetch,
        // we can hit /api/users/search or define a static local list of common skills to choose from.
        // Let's define a static list of common skills for convenience in filtering.
        setAllSkills([
          { name: 'React', id: 'react' },
          { name: 'Node.js', id: 'nodejs' },
          { name: 'Python', id: 'python' },
          { name: 'TypeScript', id: 'typescript' },
          { name: 'Figma', id: 'figma' },
          { name: 'UI/UX Design', id: 'uiux' },
          { name: 'PyTorch', id: 'pytorch' },
          { name: 'Docker', id: 'docker' }
        ]);
      } catch (err) {
        console.error('Error seeding filters:', err);
      }
    };
    fetchSkills();
  }, []);

  const handleApply = (e) => {
    e.preventDefault();
    const filters = {};
    if (college) filters.college = college;
    if (year) filters.year = year;
    if (availability) filters.availability = availability;
    if (projectType) filters.projectType = projectType;
    if (selectedSkills.length > 0) filters.skills = selectedSkills.join(',');
    
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setCollege('');
    setYear('');
    setAvailability('');
    setProjectType('');
    setSelectedSkills([]);
    onApplyFilters({});
  };

  const toggleSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  return (
    <div className="card bg-base-100 border border-border p-5 rounded-2xl gap-4 sticky top-24 transition-colors duration-200">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="font-bold flex items-center gap-1.5"><Filter size={16} /> Filters</h3>
        <button onClick={handleReset} className="btn btn-ghost btn-xs text-base-content/50 hover:text-primary gap-0.5 rounded-lg">
          <RotateCcw size={10} /> Reset
        </button>
      </div>

      <form onSubmit={handleApply} className="flex flex-col gap-4 text-xs font-semibold">
        {/* College */}
        <div className="form-control">
          <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">College / University</span></label>
          <input 
            type="text" 
            placeholder="Search college..."
            className="input input-bordered input-sm rounded-xl text-xs"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
          />
        </div>

        {/* Year */}
        <div className="form-control">
          <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Year</span></label>
          <select 
            className="select select-bordered select-sm rounded-xl text-xs"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Any Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="5">5th Year</option>
          </select>
        </div>

        {/* Availability */}
        {showAvailability && (
          <div className="form-control">
            <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Availability</span></label>
            <select 
              className="select select-bordered select-sm rounded-xl text-xs"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="">Any Status</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
            </select>
          </div>
        )}

        {/* Project Type */}
        {showProjectType && (
          <div className="form-control">
            <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Project Type</span></label>
            <select 
              className="select select-bordered select-sm rounded-xl text-xs"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
            >
              <option value="">Any Type</option>
              <option value="hackathon">Hackathon</option>
              <option value="fyp">Final Year Project</option>
              <option value="startup">Startup</option>
              <option value="research">Research</option>
              <option value="opensource">Open Source</option>
            </select>
          </div>
        )}

        {/* Skills Selector */}
        <div className="form-control">
          <label className="label p-1"><span className="label-text text-[10px] font-bold text-base-content/60 uppercase">Skills Required</span></label>
          <div className="flex flex-wrap gap-1 mt-1 max-h-[120px] overflow-y-auto border border-border p-2 rounded-xl bg-surface">
            {allSkills.map((skill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleSkill(skill.name)}
                className={`btn btn-xs rounded-lg border-none hover:bg-primary/20 ${selectedSkills.includes(skill.name) ? 'bg-primary text-white hover:bg-primary/95' : 'bg-base-200 text-base-content/80'}`}
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-sm rounded-xl font-bold mt-2">
          Apply Filters
        </button>
      </form>
    </div>
  );
};

export default FilterPanel;
