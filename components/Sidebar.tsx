
import React, { useState } from 'react';
import { AppState } from '../types';
import { useApiKey } from '../contexts/ApiKeyContext';
import ApiKeySetupModal from './ApiKeySetupModal';
import DataExportModal from './DataExportModal';

interface SidebarProps {
  activeState: AppState;
  onNavigate: (state: AppState) => void;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeState, onNavigate, userName }) => {
  const { isApiKeySet } = useApiKey();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  
  const navItems = [
    { id: AppState.DASHBOARD, label: '每日任務', icon: 'fa-calendar-day' },
    { id: AppState.SCHEDULE_SETUP, label: '經營課表', icon: 'fa-table-list' },
    { id: AppState.STRATEGY, label: '教練對話', icon: 'fa-comments' },
    { id: AppState.VAULT, label: '素材庫', icon: 'fa-box-archive' },
    { id: AppState.MEMORY, label: '成長筆記', icon: 'fa-brain' },
    { id: AppState.ONBOARDING, label: '基本設定', icon: 'fa-gear' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <i className="fa-solid fa-rocket"></i> 社群陪跑教練
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-slate-500">為 1,000+ 創作者而生</p>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">v0.3</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeState === item.id
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-900 truncate">{userName || '創作者'}</p>
            <p className="text-xs text-slate-500">已準備好突破！</p>
          </div>
        </div>
        
        {/* API Key 設定按鈕 */}
        <button
          onClick={() => setShowApiKeyModal(true)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
            isApiKeySet 
              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <i className={`fa-solid ${isApiKeySet ? 'fa-check-circle' : 'fa-key'}`}></i>
          <span className="font-medium">
            {isApiKeySet ? 'API Key 已設定' : '設定 API Key'}
          </span>
        </button>

        {/* 資料備份按鈕 */}
        <button
          onClick={() => setShowDataExportModal(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
        >
          <i className="fa-solid fa-database"></i>
          <span className="font-medium">資料備份</span>
        </button>
      </div>

      {/* API Key 設定 Modal */}
      <ApiKeySetupModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)}
      />

      {/* 資料匯出/匯入 Modal */}
      <DataExportModal 
        isOpen={showDataExportModal} 
        onClose={() => setShowDataExportModal(false)}
      />
    </aside>
  );
};

export default Sidebar;
