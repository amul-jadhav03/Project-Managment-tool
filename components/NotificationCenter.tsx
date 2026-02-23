import React from 'react';
import { Bell, X, Check, Calendar, UserPlus, RefreshCw, Info } from 'lucide-react';
import { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="text-red-500" size={16} />;
      case 'assignment':
        return <UserPlus className="text-blue-500" size={16} />;
      case 'status':
        return <RefreshCw className="text-emerald-500" size={16} />;
      default:
        return <Info className="text-slate-500" size={16} />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-indigo-600 font-medium hover:underline"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto text-slate-200 mb-3" size={48} />
            <p className="text-slate-400 text-sm font-medium">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors relative group ${
                  !notification.read ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  notification.type === 'deadline' ? 'bg-red-50' :
                  notification.type === 'assignment' ? 'bg-blue-50' :
                  notification.type === 'status' ? 'bg-emerald-50' : 'bg-slate-50'
                }`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-sm font-bold truncate ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notification.title}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="mt-2 text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700"
                    >
                      <Check size={10} /> Mark as read
                    </button>
                  )}
                </div>
                {!notification.read && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-600 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClearAll}
            className="text-xs text-slate-500 font-medium hover:text-red-600 transition-colors"
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
};
