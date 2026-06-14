import React from 'react';
import { useAuth } from '../Context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, PlusCircle, Search, HelpCircle, Layers } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-base-content">Hello, {user.firstName}! 👋</h1>
          <p className="text-sm text-base-content/60 mt-1">Welcome back. Here is your team recruitment summary.</p>
        </div>
        
        <div className="flex gap-2">
          <Link to="/teams" className="btn btn-outline btn-sm rounded-xl">
            Browse Teams
          </Link>
          <button className="btn btn-primary btn-sm rounded-xl inline-flex items-center gap-1">
            <PlusCircle size={14} /> Create Team
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Active Teams */}
          <div className="card bg-base-100 border border-border p-6 rounded-2xl gap-4">
            <h2 className="text-lg font-bold">Your Teams</h2>
            <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
              <Layers size={32} className="text-base-content/30 mx-auto mb-2" />
              <p className="text-sm text-base-content/60 font-medium">You are not currently in any teams.</p>
              <button className="btn btn-primary btn-sm rounded-xl mt-4">
                Build a Team
              </button>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card bg-base-100 border border-border p-6 rounded-2xl gap-4">
            <h2 className="text-lg font-bold flex items-center justify-between">
              <span>Recommended Teammates</span>
              <Link to="/discover" className="text-xs font-semibold text-primary hover:underline">View All</Link>
            </h2>
            <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
              <Sparkles size={32} className="text-base-content/30 mx-auto mb-2" />
              <p className="text-sm text-base-content/60 font-medium">No recommendations available yet.</p>
              <p className="text-xs text-base-content/40 mt-1">Complete your skills and bio to get smart matching results.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar info */}
        <div className="flex flex-col gap-6">
          {/* Hackathons */}
          <div className="card bg-base-100 border border-border p-6 rounded-2xl gap-4">
            <h2 className="text-lg font-bold">Upcoming Hackathons</h2>
            <div className="text-center py-6 border border-border rounded-xl bg-surface">
              <Calendar size={28} className="text-base-content/30 mx-auto mb-2" />
              <p className="text-xs text-base-content/60 font-medium">No hackathons listed yet.</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card bg-base-100 border border-border p-6 rounded-2xl gap-4">
            <h2 className="text-lg font-bold">Platform Stats</h2>
            <div className="stats stats-vertical shadow border border-border rounded-xl">
              <div className="stat">
                <div className="stat-title text-xs">Match Score</div>
                <div className="stat-value text-2xl text-primary">{user.matchScore || 0}</div>
                <div className="stat-desc text-[10px]">Based on skill alignment</div>
              </div>
              <div className="stat">
                <div className="stat-title text-xs">Hackathons Attended</div>
                <div className="stat-value text-2xl">{user.hackathonsAttended || 0}</div>
                <div className="stat-desc text-[10px]">Self-reported count</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
