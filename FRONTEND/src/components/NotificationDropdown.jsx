import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../Context/AuthContext.jsx';
import { useSocket } from '../Context/SocketContext.jsx';

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notifications?limit=5');
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const { socket } = useSocket();

  useEffect(() => {
    fetchNotifications();

    if (socket) {
      const handleNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 5));
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('notification:new', handleNewNotification);

      return () => {
        socket.off('notification:new', handleNewNotification);
      };
    }
  }, [socket]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <button tabindex="0" className="btn btn-ghost btn-circle text-base-content/80 hover:text-base-content">
        <div className="indicator">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="badge badge-xs badge-primary indicator-item p-1.5 font-bold">{unreadCount}</span>
          )}
        </div>
      </button>

      <ul tabindex="0" className="dropdown-content menu bg-base-100 rounded-box z-[50] w-80 p-2 shadow border border-border mt-3 text-xs">
        <div className="flex justify-between items-center px-3 py-2 border-b border-border">
          <span className="font-extrabold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-primary hover:underline font-bold text-[10px] flex items-center gap-0.5">
              <Check size={12} /> Mark all read
            </button>
          )}
        </div>

        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin text-primary" size={20} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-base-content/50 font-semibold">
            No new notifications
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto flex flex-col gap-0.5 py-1">
            {notifications.map((notif) => (
              <li key={notif._id} className="rounded-lg">
                <Link to={notif.link || '/notifications'} className={`flex justify-between items-start gap-2 p-2.5 rounded-lg border border-transparent hover:bg-base-200 transition-colors ${!notif.isRead ? 'bg-primary/5 font-medium' : ''}`}>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-base-content leading-tight">{notif.title}</span>
                    <span className="text-[10px] text-base-content/70 leading-relaxed">{notif.body}</span>
                    <span className="text-[8px] text-base-content/40 mt-1 font-semibold">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <button 
                      onClick={(e) => handleMarkAsRead(notif._id, e)} 
                      className="btn btn-ghost btn-circle btn-xs hover:bg-primary/20 text-primary shrink-0"
                      title="Mark as Read"
                    >
                      <Check size={12} />
                    </button>
                  )}
                </Link>
              </li>
            ))}
          </div>
        )}

        <div className="divider my-0.5"></div>
        
        <li className="w-full text-center">
          <Link to="/notifications" className="text-center text-primary text-[10px] font-bold py-2 justify-center gap-0.5">
            View All Notifications <ArrowRight size={12} />
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default NotificationDropdown;
