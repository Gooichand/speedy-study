
import React from 'react';
import { AlertTriangle, Shield, Info, X } from 'lucide-react';
import { useSecurityContext } from '@/contexts/SecurityContext';

const SecurityAlerts: React.FC = () => {
  const { alerts, clearAlerts } = useSecurityContext();

  if (alerts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle size={16} className="text-red-400" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-orange-400" />;
      case 'info':
        return <Info size={16} className="text-blue-400" />;
      default:
        return <Shield size={16} className="text-green-400" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-500/20 border-red-500/50 text-red-100';
      case 'warning':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-100';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-100';
      default:
        return 'bg-green-500/20 border-green-500/50 text-green-100';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-3 rounded-lg border backdrop-blur-sm ${getStyles(alert.type)} animate-slide-in`}
        >
          <div className="flex items-start space-x-2">
            {getIcon(alert.type)}
            <p className="text-sm flex-1">{alert.message}</p>
            <button
              onClick={clearAlerts}
              className="text-current opacity-60 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecurityAlerts;
