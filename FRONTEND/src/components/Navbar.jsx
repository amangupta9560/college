import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';
import { useTheme } from '../Context/ThemeContext.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import { Sun, Moon, LogOut, User as UserIcon, Settings, Layers, LogIn } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="navbar bg-base-100 shadow-md sticky top-0 z-50 px-4 md:px-8 border-b border-border transition-colors duration-200">
      <div className="navbar-start">
        <Link to="/" className="text-xl font-bold flex items-center gap-2 text-primary">
          <span className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center">
            <Layers size={18} />
          </span>
          <span className="font-extrabold tracking-tight">HackMatch</span>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        {user && (
          <ul className="menu menu-horizontal px-1 gap-2 font-medium">
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/discover">Discover</Link></li>
            <li><Link to="/teams">Teams</Link></li>
            <li><Link to="/hackathons">Hackathons</Link></li>
            <li><Link to="/projects">Projects</Link></li>
          </ul>
        )}
      </div>

      <div className="navbar-end gap-3">
        {/* Theme Toggler */}
        <button 
          onClick={toggleTheme} 
          className="btn btn-ghost btn-circle text-base-content/80 hover:text-base-content"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {user ? (
          <>
            {/* Notification Bell */}
            <NotificationDropdown />

            {/* User Dropdown */}
            <div className="dropdown dropdown-end">
              <div tabindex="0" role="button" className="btn btn-ghost btn-circle avatar border border-border">
                <div className="w-10 rounded-full">
                  <img 
                    alt="User Avatar" 
                    src={user.avatar || 'https://res.cloudinary.com/dgtyqhtor/image/upload/v1700000000/default-avatar.png'} 
                    onError={(e) => {
                      e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.firstName;
                    }}
                  />
                </div>
              </div>
              <ul tabindex="0" className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow border border-border">
                <li className="px-4 py-2 font-semibold text-base-content border-b border-border mb-1">
                  <p className="truncate text-xs text-base-content/60">Logged in as</p>
                  <p className="truncate text-sm">{user.firstName} {user.lastName}</p>
                </li>
                <li><Link to="/profile"><UserIcon size={14} /> My Profile</Link></li>
                <li><Link to="/settings"><Settings size={14} /> Account Settings</Link></li>
                <div className="divider my-1"></div>
                <li><button onClick={handleLogout} className="text-error"><LogOut size={14} /> Logout</button></li>
              </ul>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm text-base-content/80 hover:text-base-content">
              <LogIn size={16} className="mr-1" /> Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm rounded-lg">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
