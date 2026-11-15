import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertTriangle, Check, Info } from 'lucide-react';

export type ToastType = 'locked' | 'warning' | 'info' | 'success';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  timestamp: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class CyberToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private maxToasts = 3;

  public subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l([...this.toasts]));
  }

  public show(toast: { message: string; type?: ToastType; duration?: number }) {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const duration = toast.duration ?? 2200;
    const newItem: ToastItem = {
      ...toast,
      id,
      timestamp: Date.now(),
      duration,
    };

    // Keep up to maxToasts, adding new item to the stack
    this.toasts = [...this.toasts.slice(-(this.maxToasts - 1)), newItem];
    this.notify();

    // Auto dismiss after duration
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  public locked(message: string, duration = 2200) {
    this.show({ message, type: 'locked', duration });
  }

  public warning(message: string, duration = 2200) {
    this.show({ message, type: 'warning', duration });
  }

  public success(message: string, duration = 2200) {
    this.show({ message, type: 'success', duration });
  }

  public info(message: string, duration = 2200) {
    this.show({ message, type: 'info', duration });
  }

  public remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const cyberToast = new CyberToastManager();

export const CyberToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return cyberToast.subscribe((updated) => {
      setToasts(updated);
    });
  }, []);

  return (
    <div
      style={{
        zIndex: 9999,
        position: 'fixed',
        top: '68px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '360px',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const isLocked = toast.type === 'locked';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          let bg = 'linear-gradient(135deg, rgba(20, 8, 22, 0.96) 0%, rgba(32, 10, 20, 0.98) 100%)';
          let borderColor = 'rgba(244, 63, 94, 0.65)';
          let shadow = '0 0 18px rgba(244, 63, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
          let IconComp = Lock;
          let iconBg = 'rgba(244, 63, 94, 0.2)';
          let iconBorder = 'rgba(244, 63, 94, 0.55)';
          let iconColor = '#fb7185';
          let dotColor = '#f43f5e';

          if (isSuccess) {
            bg = 'linear-gradient(135deg, rgba(8, 24, 20, 0.96) 0%, rgba(10, 36, 24, 0.98) 100%)';
            borderColor = 'rgba(16, 185, 129, 0.65)';
            shadow = '0 0 18px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
            IconComp = Check;
            iconBg = 'rgba(16, 185, 129, 0.2)';
            iconBorder = 'rgba(16, 185, 129, 0.55)';
            iconColor = '#34d399';
            dotColor = '#10b981';
          } else if (isWarning) {
            bg = 'linear-gradient(135deg, rgba(24, 18, 8, 0.96) 0%, rgba(36, 22, 10, 0.98) 100%)';
            borderColor = 'rgba(245, 158, 11, 0.65)';
            shadow = '0 0 18px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
            IconComp = AlertTriangle;
            iconBg = 'rgba(245, 158, 11, 0.2)';
            iconBorder = 'rgba(245, 158, 11, 0.55)';
            iconColor = '#fbbf24';
            dotColor = '#f59e0b';
          } else if (!isLocked) {
            bg = 'linear-gradient(135deg, rgba(8, 16, 32, 0.96) 0%, rgba(10, 24, 44, 0.98) 100%)';
            borderColor = 'rgba(0, 247, 255, 0.65)';
            shadow = '0 0 18px rgba(0, 247, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
            IconComp = Info;
            iconBg = 'rgba(0, 247, 255, 0.2)';
            iconBorder = 'rgba(0, 247, 255, 0.55)';
            iconColor = '#00f7ff';
            dotColor = '#00f7ff';
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.88, transition: { duration: 0.4, ease: 'easeOut' } }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              onClick={() => cyberToast.remove(toast.id)}
              style={{
                background: bg,
                border: `1.5px solid ${borderColor}`,
                boxShadow: shadow,
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
              }}
              className="pointer-events-auto cursor-pointer select-none px-3 py-2 flex items-center justify-between gap-2.5 max-w-full shadow-2xl active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Icon Box */}
                <div
                  style={{
                    backgroundColor: iconBg,
                    border: `1px solid ${iconBorder}`,
                    boxShadow: `0 0 8px ${iconBorder}`,
                    color: iconColor,
                  }}
                  className="w-5.5 h-5.5 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <IconComp className="w-3 h-3 stroke-[2.5]" />
                </div>

                {/* Message */}
                <span className="font-ui font-bold text-xs text-white tracking-wide truncate">
                  {toast.message}
                </span>
              </div>

              {/* Status Pulse Dot */}
              <div className="flex items-center gap-1 flex-shrink-0 pl-1">
                <span
                  style={{ backgroundColor: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
