import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Users, FolderKanban, ShieldCheck } from 'lucide-react';

export const TeamCard = ({ team }) => {
  const getProjectTypeColor = (type) => {
    switch (type) {
      case 'hackathon': return 'badge-primary';
      case 'fyp': return 'badge-secondary';
      case 'startup': return 'badge-accent';
      case 'research': return 'badge-warning';
      default: return 'badge-ghost';
    }
  };

  return (
    <div className="card bg-base-100 border border-border shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between gap-4">
      {/* Header Info */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-3 items-center">
          <div className="avatar">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              {team.avatarURL ? (
                <img src={team.avatarURL} alt={team.name} />
              ) : (
                <FolderKanban size={20} />
              )}
            </div>
          </div>
          <div>
            <Link to={`/teams/${team.slug}`} className="font-extrabold text-base-content hover:text-primary transition-colors text-base line-clamp-1">
              {team.name}
            </Link>
            <span className={`badge badge-sm uppercase font-semibold text-[9px] px-2 rounded-md ${getProjectTypeColor(team.projectType)}`}>
              {team.projectType}
            </span>
          </div>
        </div>

        {/* Member Count Badge */}
        <div className="badge border border-border bg-base-200 text-xs font-semibold py-3 px-3 rounded-xl gap-1 shrink-0">
          <Users size={12} className="text-base-content/60" /> 
          <span>{team.members ? team.members.length : 0}/{team.maxSize}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-base-content/75 line-clamp-3 leading-relaxed">
        {team.description}
      </p>

      {/* Open Roles Badges */}
      {team.openRoles && team.openRoles.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          <span className="text-[10px] uppercase font-bold text-base-content/40 tracking-wider">Recruiting Roles:</span>
          <div className="flex flex-wrap gap-1 max-h-[50px] overflow-hidden">
            {team.openRoles.map((role, idx) => (
              <span key={idx} className="badge badge-sm border border-accent/20 bg-accent/5 text-accent font-semibold text-[9px] rounded-lg">
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info: Leader */}
      <div className="flex justify-between items-center gap-3 pt-3 border-t border-border mt-2">
        <div className="flex items-center gap-2">
          <div className="avatar">
            <div className="w-6 h-6 rounded-full border border-border">
              <img 
                src={team.leader?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + (team.leader?.firstName || 'Leader')} 
                alt="Leader avatar" 
              />
            </div>
          </div>
          <span className="text-[11px] text-base-content/60 font-semibold truncate max-w-[120px]">
            {team.leader?.firstName} {team.leader?.lastName}
          </span>
          <ShieldCheck size={11} className="text-primary" />
        </div>

        <Link to={`/teams/${team.slug}`} className="btn btn-primary btn-sm rounded-xl font-bold text-xs px-4">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TeamCard;
