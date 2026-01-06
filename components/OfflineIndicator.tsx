import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const OfflineIndicator: React.FC = () => {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (isOnline && !wasOffline) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all ${
        isOnline
          ? 'bg-green-500 text-white animate-[slideDown_0.3s_ease-out]'
          : 'bg-red-500 text-white animate-[slideDown_0.3s_ease-out]'
      }`}
    >
      <div className="flex items-center gap-2">
        <i className={`fa-solid ${isOnline ? 'fa-wifi' : 'fa-wifi-slash'}`}></i>
        <span className="font-medium text-sm">
          {isOnline ? '網路連線已恢復' : '目前處於離線狀態'}
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;

