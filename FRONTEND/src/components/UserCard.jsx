import React from 'react';
import { Link } from 'react-router-dom';
import { User, Sparkles, MapPin, Briefcase } from 'lucide-react';

export const UserCard = ({ candidate, onInvite }) => {
  const { user, matchScore, breakdown } = candidate;

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'available': return 'bg-success';
      case 'busy': return 'bg-warning';
      case 'not_looking': return 'bg-error';
      default: return 'bg-gray-400';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success border-success/30 bg-success/5';
    if (score >= 50) return 'text-warning border-warning/30 bg-warning/5';
    return 'text-primary border-primary/30 bg-primary/5';
  };

  return (
    <div className="card bg-base-100 border border-border shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between gap-4">
      
      {/* Header Info */}
      <div className="flex justify-between items-start gap-4">
        {/* User Info */}
        <div className="flex gap-3 items-center">
          <div className="avatar relative">
            <div className="w-14 h-14 rounded-full border border-border">
              <img 
                src={user.avatar || 'https://res.cloudinary.com/dgtyqhtor/image/upload/v1700000000/default-avatar.png'} 
                alt={`${user.firstName} ${user.lastName}`} 
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`;
                }}
              />
            </div>
            {/* Availability Badge indicator */}
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getAvailabilityColor(user.availability)}`}></span>
          </div>

          <div>
            <Link to={`/users/${user._id}`} className="font-extrabold text-base-content hover:text-primary transition-colors text-base">
              {user.firstName} {user.lastName}
            </Link>
            <p className="text-xs text-base-content/50 font-semibold">{user.degree} • Year {user.year}</p>
          </div>
        </div>

        {/* Match Score Badge */}
        <div className={`flex flex-col items-center border rounded-xl px-2.5 py-1.5 shrink-0 ${getScoreColor(matchScore)}`}>
          <div className="text-lg font-black tracking-tight">{matchScore}%</div>
          <div className="text-[9px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-0.5"><Sparkles size={8} /> Match</div>
        </div>
      </div>

      {/* College Info */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-base-content/60 font-semibold flex items-center gap-1">
          <MapPin size={12} className="text-primary/70" /> {user.college}
        </span>
        <span className="text-xs text-base-content/60 font-semibold flex items-center gap-1">
          <Briefcase size={12} className="text-primary/70" /> {user.branch}
        </span>
      </div>

      {/* Bio Description */}
      <p className="text-xs text-base-content/70 line-clamp-2 leading-relaxed">
        {user.bio || "No biography provided. This student is ready to collaborate on innovative projects."}
      </p>

      {/* Skills selection */}
      <div className="flex flex-wrap gap-1 mt-1 max-h-[70px] overflow-hidden">
        {user.skills && user.skills.slice(0, 4).map((skillObj, idx) => (
          <span key={idx} className="badge badge-sm bg-base-200 border-none font-semibold text-base-content/80 text-[10px] rounded-lg">
            {skillObj.skill?.name || 'Skill'}
          </span>
        ))}
        {user.skills && user.skills.length > 4 && (
          <span className="badge badge-sm bg-base-200 border-none font-semibold text-base-content/50 text-[10px] rounded-lg">
            +{user.skills.length - 4} more
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-2 pt-3 border-t border-border">
        <Link to={`/users/${user._id}`} className="btn btn-outline btn-sm rounded-xl flex-1 font-bold text-xs">
          View Profile
        </Link>
        <button 
          onClick={() => onInvite(user)} 
          className="btn btn-primary btn-sm rounded-xl flex-1 font-bold text-xs"
        >
          Invite to Team
        </button>
      </div>

    </div>
  );
};

export default UserCard;
