
import React, { useState, useEffect, useRef } from 'react';
import { AppState } from './types';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import OfflineIndicator from './components/OfflineIndicator';
import OnboardingView from './views/OnboardingView';
import DashboardView from './views/DashboardView';
import VaultView from './views/VaultView';
import StrategyChatView from './views/StrategyChatView';
import MemoryView from './views/MemoryView';
import ScheduleSetupView from './views/ScheduleSetupView';

/**
 * App 內容組件（使用 AppData Context）
 */
const AppContent: React.FC = () => {
  const [activeState, setActiveState] = useState<AppState>(AppState.ONBOARDING);
  const hasInitialized = useRef(false);
  const { 
    profile, 
    setProfile, 
    vault, 
    addVaultItem,
    addVaultItems,
    updateVaultItem,
    deleteVaultItem, 
    memories, 
    addMemory, 
    deleteMemory, 
    schedule, 
    setSchedule,
    isLoading 
  } = useAppData();

  // 只在首次載入時，如果有 Profile，才導向 Dashboard
  useEffect(() => {
    if (!isLoading && !hasInitialized.current) {
      hasInitialized.current = true;
      if (profile) {
        setActiveState(AppState.DASHBOARD);
      }
    }
  }, [profile, isLoading]);

  const handleSaveProfile = (newProfile: NonNullable<typeof profile>) => {
    setProfile(newProfile);
    // 新用戶填完資料後，直接引導至課表設定
    setActiveState(AppState.SCHEDULE_SETUP);
  };

  const handleSaveSchedule = (newSchedule: typeof schedule) => {
    setSchedule(newSchedule);
    // 設定完課表後，進入 Dashboard
    setActiveState(AppState.DASHBOARD);
  };

  // 載入中顯示
  if (isLoading) {
    return <LoadingSpinner fullScreen text="載入中..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="flex flex-1">
        {profile && (
          <Sidebar 
            activeState={activeState} 
            onNavigate={setActiveState} 
            userName={profile.fanPageName}
          />
        )}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-20 md:pb-0">
          {activeState === AppState.ONBOARDING && (
            <OnboardingView onSave={handleSaveProfile} initialProfile={profile || undefined} />
          )}
          
          {profile && (
            <>
              {activeState === AppState.SCHEDULE_SETUP && (
                <ScheduleSetupView 
                  profile={profile} 
                  schedule={schedule} 
                  onSaveSchedule={handleSaveSchedule} 
                />
              )}
              {activeState === AppState.DASHBOARD && (
                <DashboardView 
                  profile={profile} 
                  schedule={schedule}
                  memories={memories}
                  vault={vault}
                  onNavigate={setActiveState}
                  onAddMemory={addMemory}
                  onUpdateVaultItem={updateVaultItem}
                />
              )}
              {activeState === AppState.VAULT && (
                <VaultView 
                  items={vault} 
                  onAdd={addVaultItem}
                  onAddMultiple={addVaultItems}
                  onUpdate={updateVaultItem}
                  onDelete={deleteVaultItem} 
                />
              )}
              {activeState === AppState.STRATEGY && (
                <StrategyChatView 
                  profile={profile} 
                  memories={memories} 
                  onAddMemory={addMemory}
                />
              )}
              {activeState === AppState.MEMORY && (
                <MemoryView 
                  memories={memories} 
                  onAdd={addMemory} 
                  onDelete={deleteMemory} 
                />
              )}
            </>
          )}

          {!profile && activeState !== AppState.ONBOARDING && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 text-center">
                FlyPig 社群自媒體 AI 陪跑教練
              </h1>
              <button 
                onClick={() => setActiveState(AppState.ONBOARDING)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-medium"
              >
                請先完成基礎設定
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50">
        <button onClick={() => setActiveState(AppState.DASHBOARD)} className={`flex flex-col items-center gap-1 ${activeState === AppState.DASHBOARD ? 'text-indigo-600' : 'text-slate-400'}`}>
          <i className="fa-solid fa-calendar-day text-lg"></i>
          <span className="text-[10px]">任務</span>
        </button>
        <button onClick={() => setActiveState(AppState.SCHEDULE_SETUP)} className={`flex flex-col items-center gap-1 ${activeState === AppState.SCHEDULE_SETUP ? 'text-indigo-600' : 'text-slate-400'}`}>
          <i className="fa-solid fa-table-list text-lg"></i>
          <span className="text-[10px]">課表</span>
        </button>
        <button onClick={() => setActiveState(AppState.STRATEGY)} className={`flex flex-col items-center gap-1 ${activeState === AppState.STRATEGY ? 'text-indigo-600' : 'text-slate-400'}`}>
          <i className="fa-solid fa-comments text-lg"></i>
          <span className="text-[10px]">對話</span>
        </button>
        <button onClick={() => setActiveState(AppState.ONBOARDING)} className={`flex flex-col items-center gap-1 ${activeState === AppState.ONBOARDING ? 'text-indigo-600' : 'text-slate-400'}`}>
          <i className="fa-solid fa-gear text-lg"></i>
          <span className="text-[10px]">設定</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="hidden md:block w-full bg-white border-t border-slate-200 py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-2">
          <p className="text-sm text-slate-600">
            Copyright © 2025{' '}
            <a 
              href="https://flypigai.icareu.tw/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              FlyPig AI
            </a>
            . All rights reserved.
          </p>
          <p className="text-xs text-slate-400">
            Version <span className="font-medium text-slate-500">v0.4</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

/**
 * App 根組件（提供所有 Context）
 */
const App: React.FC = () => {
  return (
    <ApiKeyProvider>
      <ToastProvider>
        <AppDataProvider>
          <OfflineIndicator />
          <AppContent />
        </AppDataProvider>
      </ToastProvider>
    </ApiKeyProvider>
  );
};

export default App;
