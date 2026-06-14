import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../Context/AuthContext.jsx';
import Pagination from '../Components/Pagination.jsx';
import { Bell, Check, Trash2, Loader2, CheckCircle2 } from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [success, setSuccess] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/notifications?page=${page}&limit=10`);
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
      setPagination(res.data.data.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setSuccess('All notifications marked as read.');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      // Reload page if current page empties
      if (notifications.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <Bell className="text-primary" size={28} /> Notification Center
          </h1>
          <p className="text-sm text-base-content/60 mt-1">Manage and track your incoming requests and activities.</p>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-outline btn-sm rounded-xl font-bold gap-1 text-xs">
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {success && (
        <div className="alert alert-success rounded-xl py-3 px-4 flex items-center gap-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <span className="text-xs font-medium">{success}</span>
        </div>
      )}

      {/* Main List */}
      <div className="card bg-base-100 border border-border shadow-sm rounded-2xl p-6 min-h-[50vh] flex flex-col transition-colors duration-200">
        {loading ? (
          <div className="flex-grow flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center gap-3 py-20">
            <Bell size={48} className="text-base-content/25 animate-pulse" />
            <h3 className="font-extrabold text-lg">Your inbox is clear</h3>
            <p className="text-sm text-base-content/60 max-w-xs">You have no new notifications. All requests and invites will appear here.</p>
          </div>
        ) : (
          <div className="flex-grow flex flex-col justify-between gap-6">
            <div className="flex flex-col divide-y divide-border">
              {notifications.map((notif) => (
                <div key={notif._id} className={`flex justify-between items-start py-4 first:pt-0 last:pb-0 gap-4 ${!notif.isRead ? 'bg-primary/5 rounded-xl px-4 my-1 border-l-4 border-primary' : 'px-4'}`}>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm">{notif.title}</span>
                      <span className="badge badge-outline border-none text-[8px] font-black uppercase">{notif.type}</span>
                    </div>
                    
                    <p className="text-xs text-base-content/75 leading-relaxed font-normal">{notif.body}</p>
                    
                    <div className="flex gap-4 items-center mt-2 text-[10px] font-semibold text-base-content/40">
                      <span>{new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.link && (
                        <Link to={notif.link} className="text-primary hover:underline font-bold">
                          View details
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0 items-center">
                    {!notif.isRead && (
                      <button 
                        onClick={() => handleMarkRead(notif._id)} 
                        className="btn btn-ghost btn-circle btn-xs text-primary hover:bg-primary/20"
                        title="Mark as Read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notif._id)} 
                      className="btn btn-ghost btn-circle btn-xs text-error hover:bg-error/15"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination 
              pagination={pagination} 
              onPageChange={(p) => setPage(p)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
