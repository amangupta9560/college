import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';
import { Mail, Lock, User, GraduationCap, Building, Link2, Tag, ArrowRight, ArrowLeft, Layers, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Step 1 Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2 Form Data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState(1);

  // Step 3 Form Data
  const [githubURL, setGithubURL] = useState('');
  const [linkedinURL, setLinkedinURL] = useState('');
  const [portfolioURL, setPortfolioURL] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [interests, setInterests] = useState([]);
  
  const { register } = useAuth();
  const navigate = useNavigate();

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
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!email || !password || !confirmPassword) {
        return setError('All fields are required.');
      }
      if (password !== confirmPassword) {
        return setError('Passwords do not match.');
      }
      if (password.length < 8) {
        return setError('Password must be at least 8 characters long.');
      }
    }
    if (step === 2) {
      if (!firstName || !lastName || !college || !branch) {
        return setError('All fields are required.');
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

    const userData = {
      email,
      password,
      firstName,
      lastName,
      college,
      degree,
      branch,
      year: parseInt(year, 10),
      githubURL,
      linkedinURL,
      portfolioURL,
      interests,
      skills: [] // skills will be seeded and edited in full profile editor or seeded default
    };

    try {
      await register(userData);
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>

      <div className="card w-full max-w-lg bg-base-100 border border-border shadow-xl rounded-2xl relative z-10">
        <div className="card-body p-8 sm:p-10 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white mb-4">
              <Layers size={20} />
            </div>
            <h2 className="text-2xl font-bold text-base-content">Create an Account</h2>
            <p className="text-xs text-base-content/60 mt-1">Join HackMatch to build amazing teams</p>
          </div>

          {/* Stepper Progress Bar */}
          <ul className="steps steps-horizontal w-full text-xs font-semibold mb-2">
            <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Account</li>
            <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Academics</li>
            <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>Profile</li>
          </ul>

          {error && (
            <div className="alert alert-error rounded-xl py-3 px-4 flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* STEP 1: Account Credentials */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-semibold text-xs">Email Address</span></label>
                  <div className="input input-bordered flex items-center gap-2 rounded-xl">
                    <Mail size={16} className="text-base-content/40" />
                    <input 
                      type="email" 
                      className="grow text-sm" 
                      placeholder="you@college.edu" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-semibold text-xs">Password</span></label>
                  <div className="input input-bordered flex items-center gap-2 rounded-xl">
                    <Lock size={16} className="text-base-content/40" />
                    <input 
                      type="password" 
                      className="grow text-sm" 
                      placeholder="Minimum 8 characters" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-semibold text-xs">Confirm Password</span></label>
                  <div className="input input-bordered flex items-center gap-2 rounded-xl">
                    <Lock size={16} className="text-base-content/40" />
                    <input 
                      type="password" 
                      className="grow text-sm" 
                      placeholder="Confirm password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={nextStep}
                  className="btn btn-primary rounded-xl mt-4 font-bold"
                >
                  Continue <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            )}

            {/* STEP 2: Academic Info */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text font-semibold text-xs">First Name</span></label>
                    <div className="input input-bordered flex items-center gap-2 rounded-xl">
                      <User size={16} className="text-base-content/40" />
                      <input 
                        type="text" 
                        className="grow text-sm" 
                        placeholder="John" 
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
                        placeholder="Doe" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-semibold text-xs">College / University</span></label>
                  <div className="input input-bordered flex items-center gap-2 rounded-xl">
                    <Building size={16} className="text-base-content/40" />
                    <input 
                      type="text" 
                      className="grow text-sm" 
                      placeholder="HIET Ghaziabad" 
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="form-control col-span-2">
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
                      <option value={1}>1st</option>
                      <option value={2}>2nd</option>
                      <option value={3}>3rd</option>
                      <option value={4}>4th</option>
                      <option value={5}>5th</option>
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-semibold text-xs">Branch / Specialization</span></label>
                  <div className="input input-bordered flex items-center gap-2 rounded-xl">
                    <GraduationCap size={16} className="text-base-content/40" />
                    <input 
                      type="text" 
                      className="grow text-sm" 
                      placeholder="CSE / IT / ECE" 
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="btn btn-outline flex-1 rounded-xl font-bold"
                  >
                    <ArrowLeft size={16} className="mr-1" /> Back
                  </button>
                  <button 
                    type="button" 
                    onClick={nextStep}
                    className="btn btn-primary flex-1 rounded-xl font-bold"
                  >
                    Continue <ArrowRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Profile Details */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-semibold text-xs">GitHub Profile URL (Optional)</span></label>
                  <div className="input input-bordered flex items-center gap-2 rounded-xl">
                    <Link2 size={16} className="text-base-content/40" />
                    <input 
                      type="url" 
                      className="grow text-sm" 
                      placeholder="https://github.com/username" 
                      value={githubURL}
                      onChange={(e) => setGithubURL(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-semibold text-xs">LinkedIn Profile URL (Optional)</span></label>
                  <div className="input input-bordered flex items-center gap-2 rounded-xl">
                    <Link2 size={16} className="text-base-content/40" />
                    <input 
                      type="url" 
                      className="grow text-sm" 
                      placeholder="https://linkedin.com/in/username" 
                      value={linkedinURL}
                      onChange={(e) => setLinkedinURL(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-semibold text-xs">Portfolio URL (Optional)</span></label>
                  <div className="input input-bordered flex items-center gap-2 rounded-xl">
                    <Link2 size={16} className="text-base-content/40" />
                    <input 
                      type="url" 
                      className="grow text-sm" 
                      placeholder="https://mywebsite.com" 
                      value={portfolioURL}
                      onChange={(e) => setPortfolioURL(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs">Interests / Focus Areas</span>
                  </label>
                  <div className="input input-bordered flex items-center gap-2 rounded-xl">
                    <Tag size={16} className="text-base-content/40" />
                    <input 
                      type="text" 
                      className="grow text-sm" 
                      placeholder="Web, AI, Blockchain (press Enter to add)" 
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

                <div className="flex gap-4 mt-4">
                  <button 
                    type="button" 
                    onClick={prevStep}
                    className="btn btn-outline flex-1 rounded-xl font-bold"
                  >
                    <ArrowLeft size={16} className="mr-1" /> Back
                  </button>
                  <button 
                    type="submit" 
                    className={`btn btn-primary flex-1 rounded-xl font-bold ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Register'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="text-center mt-2">
            <span className="text-xs text-base-content/60">Already have an account? </span>
            <Link to="/login" className="text-xs font-bold text-primary hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
