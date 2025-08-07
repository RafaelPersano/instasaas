import React, { useEffect } from 'react';
import { AlertTriangleIcon, CheckCircleIcon, XIcon } from '@/components/icons';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000); // Auto-close after 6 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = 'fixed top-5 right-5 z-[100] flex items-center gap-4 p-4 rounded-lg text-white shadow-2xl animate-fade-in-right max-w-md';
  const typeClasses = type === 'error' 
    ? 'bg-red-500' 
    : 'bg-green-500';

  const icon = type === 'error' 
    ? <AlertTriangleIcon className="w-6 h-6 text-white flex-shrink-0" /> 
    : <CheckCircleIcon className="w-6 h-6 text-white flex-shrink-0" />;

  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      {icon}
      <p className="font-medium text-sm">{message}</p>
      <button 
        onClick={onClose} 
        className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0" 
        aria-label="Fechar notificação"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
