import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Code, Award, Search, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../Context/AuthContext.jsx';

export const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden relative">
      {/* Background Animated Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-10 left-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>

      {/* Hero Section */}
      <div className="hero min-h-[85vh] px-4 md:px-8 max-w-7xl mx-auto flex flex-col justify-center items-center text-center relative z-10 py-16">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 animate-pulse border border-primary/20">
            <Sparkles size={12} /> Discover your dream teammates today
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Find the Right Team.<br />
            <span className="text-gradient">Build Better Projects.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-base-content/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            HackMatch bridges the gap in student collaboration. Match with developers, designers, and innovators based on skill complementarity, college, and interest overlap.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 group">
                Go to Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 group">
                  Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg rounded-xl hover:bg-base-200">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Floating Skill Chips Visual */}
        <div className="mt-16 flex flex-wrap gap-3 justify-center max-w-3xl opacity-80">
          <span className="badge badge-lg border border-border bg-white text-base-content shadow-sm py-5 px-6 font-medium select-none hover:scale-105 transition-transform">React ⚛️</span>
          <span className="badge badge-lg border border-border bg-white text-base-content shadow-sm py-5 px-6 font-medium select-none hover:scale-105 transition-transform">Python 🐍</span>
          <span className="badge badge-lg border border-border bg-white text-base-content shadow-sm py-5 px-6 font-medium select-none hover:scale-105 transition-transform">UI/UX Design 🎨</span>
          <span className="badge badge-lg border border-border bg-white text-base-content shadow-sm py-5 px-6 font-medium select-none hover:scale-105 transition-transform">Node.js 🟢</span>
          <span className="badge badge-lg border border-border bg-white text-base-content shadow-sm py-5 px-6 font-medium select-none hover:scale-105 transition-transform">Machine Learning 🤖</span>
          <span className="badge badge-lg border border-border bg-white text-base-content shadow-sm py-5 px-6 font-medium select-none hover:scale-105 transition-transform">Figma 🚀</span>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="w-full bg-base-100 border-y border-border py-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col gap-1.5">
            <span className="text-4xl font-extrabold text-primary">12,000+</span>
            <span className="text-sm font-semibold text-base-content/60">Registered Students</span>
          </div>
          <div className="flex flex-col gap-1.5 border-y md:border-y-0 md:border-x border-border py-6 md:py-0">
            <span className="text-4xl font-extrabold text-primary">3,500+</span>
            <span className="text-sm font-semibold text-base-content/60">Teams Formed</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-4xl font-extrabold text-primary">800+</span>
            <span className="text-sm font-semibold text-base-content/60">Hackathons Participated</span>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold mb-4">Core Collaboration Features</h2>
          <p className="text-base-content/70">Everything you need to find potential collaborators and build high-impact technical projects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card bg-base-100 border border-border shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300">
            <div className="card-body p-8 gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Search size={22} />
              </div>
              <h3 className="card-title text-xl font-bold">Smart Teammate Search</h3>
              <p className="text-base-content/70 text-sm leading-relaxed">
                Filter students by core languages, framework skills, college year, or course background. Find partners with precise skill alignments.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card bg-base-100 border border-border shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300">
            <div className="card-body p-8 gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <Code size={22} />
              </div>
              <h3 className="card-title text-xl font-bold">GitHub-Style Portfolios</h3>
              <p className="text-base-content/70 text-sm leading-relaxed">
                Showcase past projects with rich markdown details, repository links, direct collaborator tags, and verified skill badges.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card bg-base-100 border border-border shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300">
            <div className="card-body p-8 gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <Users size={22} />
              </div>
              <h3 className="card-title text-xl font-bold">Lifecycle Management</h3>
              <p className="text-base-content/70 text-sm leading-relaxed">
                Send formal team invitations, review incoming applications with custom cover letters, and manage team roster roles seamlessly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 bg-base-100/50 border-t border-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold mb-4">How HackMatch Works</h2>
            <p className="text-base-content/70">Three simple steps to build your dream hackathon team.</p>
          </div>

          {/* Horizontal Timeline / Process Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 rounded-full bg-primary text-white font-extrabold text-lg flex items-center justify-center mb-6 shadow-md shadow-primary/20">
                1
              </div>
              <h3 className="text-lg font-bold mb-2">Create Profile & Skills</h3>
              <p className="text-sm text-base-content/75 max-w-xs leading-relaxed">
                Sign up, input your credentials, verify your student email, and complete your multi-step onboarding wizard.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 rounded-full bg-accent text-white font-extrabold text-lg flex items-center justify-center mb-6 shadow-md shadow-accent/20">
                2
              </div>
              <h3 className="text-lg font-bold mb-2">Post Team or Role</h3>
              <p className="text-sm text-base-content/75 max-w-xs leading-relaxed">
                Create a team project, input required skills, post open recruitment roles, and specify team sizes and visibility.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 rounded-full bg-success text-white font-extrabold text-lg flex items-center justify-center mb-6 shadow-md shadow-success/20">
                3
              </div>
              <h3 className="text-lg font-bold mb-2">Recruit & Collaborate</h3>
              <p className="text-sm text-base-content/75 max-w-xs leading-relaxed">
                Receive match scores, invite student candidates directly, review incoming applications, and collaborate in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
