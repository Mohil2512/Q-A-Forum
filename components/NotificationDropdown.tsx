'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiX, FiCheck, FiBell, FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import Pusher from 'pusher-js';
import { useSession } from 'next-auth/react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedQuestion?: string;
  relatedAnswer?: string;
}

interface NotificationDropdownProps {
  onClose?: () => void;
  onUpdateCount?: () => void;
}

export default function NotificationDropdown({ onClose, onUpdateCount }: NotificationDropdownProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    fetchNotificationCount();
    // Poll for real-time updates every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchNotificationCount();
    }, 10000);
    // Pusher real-time subscription
    let pusher: Pusher | null = null;
    let channel: any = null;
    if (session?.user?.id) {
      pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: '/api/pusher/auth', // if using private channels
      });
      channel = pusher.subscribe(`user-${session.user.id}`);
      channel.bind('new-notification', (data: any) => {
        setNotifications((prev) => [data.notification, ...prev]);
        setNotificationCount((prev) => prev + 1);
      });
    }
    return () => {
      clearInterval(interval);
      if (pusher && channel) {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      }
    };
  }, [session?.user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.notification-bell-btn')
      ) {
        setIsOpen(false);
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('/api/notifications/count');
      const data = await response.json();
      setNotificationCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      fetchNotificationCount();
      onUpdateCount?.();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      fetchNotificationCount();
      onUpdateCount?.();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'DELETE',
      });
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      fetchNotificationCount();
      onUpdateCount?.();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!next) {
        setOpenMenuId(null);
        onClose?.();
      }
      return next;
    });
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="notification-bell-btn p-2 text-[#c8acd6] hover:text-white transition-colors duration-300 relative"
        type="button"
      >
        <FiBell className="w-5 h-5" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-[#433d8b] to-[#c8acd6] rounded-full text-xs text-[#17153b] flex items-center justify-center px-1 font-medium">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 card z-50" ref={dropdownRef}>
          <div className="flex items-center justify-between p-4 border-b border-[#433d8b]/30">
            <h3 className="text-lg font-semibold gradient-text">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllAsRead}
                className="text-sm text-[#c8acd6] hover:text-white transition-colors duration-300"
              >
                Mark all read
              </button>
              <button
                onClick={handleClose}
                className="text-[#433d8b] hover:text-white transition-colors duration-300"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-[#433d8b]">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-[#433d8b]">No notifications</div>
            ) : (
              <div className="divide-y divide-[#433d8b]/30">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-[#433d8b]/10 transition-colors duration-200 ${
                      !notification.isRead ? 'bg-[#433d8b]/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#c8acd6] mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-[#c8acd6] mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#433d8b]">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          <div className="relative flex items-center gap-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-xs text-[#433d8b] hover:text-[#c8acd6] transition-colors duration-300"
                                title="Mark as read"
                              >
                                <FiCheck className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => setOpenMenuId(openMenuId === notification._id ? null : notification._id)}
                              className="p-1 rounded hover:bg-[#433d8b]/20"
                              title="More actions"
                            >
                              <FiMoreVertical className="w-4 h-4" />
                            </button>
                            {openMenuId === notification._id && (
                              <div className="absolute right-0 top-6 z-10 bg-[#17153b] border border-[#433d8b]/30 rounded shadow-lg min-w-[120px]">
                                {!notification.isRead && (
                                  <button
                                    onClick={() => { markAsRead(notification._id); setOpenMenuId(null); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-[#c8acd6] hover:bg-[#433d8b]/20"
                                  >
                                    Mark as read
                                  </button>
                                )}
                                <button
                                  onClick={() => { deleteNotification(notification._id); setOpenMenuId(null); }}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#433d8b]/20"
                                >
                                  <FiTrash2 className="inline mr-2 w-4 h-4" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {(notification.relatedQuestion || notification.relatedAnswer) && (
                      <div className="mt-2">
                        <Link
                          href={notification.relatedQuestion 
                            ? `/questions/${notification.relatedQuestion}`
                            : `/answers/${notification.relatedAnswer}`
                          }
                          className="text-xs text-[#433d8b] hover:text-[#c8acd6] transition-colors duration-300"
                          onClick={handleClose}
                        >
                          View related content →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-[#433d8b]/30">
              <Link
                href="/notifications"
                className="block text-center text-sm text-[#c8acd6] hover:text-white transition-colors duration-300"
                onClick={handleClose}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 