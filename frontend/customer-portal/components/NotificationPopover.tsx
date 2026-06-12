"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Clock, Package, AlertTriangle, Info, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";

type NotificationType = "BOOKING" | "PAYMENT" | "SYSTEM" | "ALERT" | "BROADCAST";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuthStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    
    fetchNotifications();

    // Listen to socket for new notifications
    let socket: any;
    import('socket.io-client').then(({ io }) => {
      socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        auth: { token: user.firebaseUid } // or however auth is handled, but maybe just global for now
      });
      socket.on('notification', (newNotif: any) => {
        setNotifications((prev) => [{
          id: newNotif.id || Date.now().toString(),
          title: newNotif.title,
          body: newNotif.body,
          type: newNotif.data?.type || 'SYSTEM',
          isRead: false,
          createdAt: new Date().toISOString()
        }, ...prev]);
      });
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
      const { auth } = await import('@/lib/firebase');
      const token = await auth.currentUser?.getIdToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    notifications.filter(n => !n.isRead).forEach(n => markAsRead(n.id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'BOOKING': return <Package className="w-4 h-4 text-blue-500" />;
      case 'PAYMENT': return <Check className="w-4 h-4 text-green-500" />;
      case 'ALERT': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'BROADCAST': return <Info className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--bg-primary)]"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-primary)] border border-[var(--border-subtle)] shadow-2xl rounded-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-[var(--brand-primary)] hover:underline font-medium">
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)]">
                  <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)]">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-4 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}
                    >
                      <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-white dark:bg-[var(--bg-primary)] shadow-sm' : 'bg-[var(--bg-secondary)]'}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm ${!notif.isRead ? 'font-bold text-[var(--text-primary)]' : 'font-medium text-[var(--text-secondary)]'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap ml-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-xs ${!notif.isRead ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'} line-clamp-2 leading-relaxed`}>
                          {notif.body}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between ml-2">
                        {!notif.isRead && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500 mb-2"></div>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                          className="flex-shrink-0 p-1 rounded text-[var(--text-muted)] hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Mark as read and remove"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-[var(--border-subtle)] text-center bg-[var(--bg-secondary)]">
              <button className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium transition-colors">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
