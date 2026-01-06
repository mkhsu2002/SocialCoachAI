
import React, { useState, useEffect } from 'react';
import { AppState, UserProfile, ResourceItem, MemoryEntry, DayPlan } from './types';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import Sidebar from './components/Sidebar';
import OnboardingView from './views/OnboardingView';
import DashboardView from './views/DashboardView';
import VaultView from './views/VaultView';
import StrategyChatView from './views/StrategyChatView';
import MemoryView from './views/MemoryView';
import ScheduleSetupView from './views/ScheduleSetupView';

const App: React.FC = () => {
  const [activeState, setActiveState] = useState<AppState>(AppState.ONBOARDING);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [vault, setVault] = useState<ResourceItem[]>([]);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [schedule, setSchedule] = useState<DayPlan[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('coach_profile');
    const savedVault = localStorage.getItem('coach_vault');
    const savedMemories = localStorage.getItem('coach_memories');
    const savedSchedule = localStorage.getItem('coach_schedule');
    
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      // 如果有 Profile 但沒有 Schedule，或者有 Schedule，都預設去 Dashboard
      // DashboardView 內部會處理「沒有 Schedule」的狀況
      setActiveState(AppState.DASHBOARD);
    }
    if (savedVault) {
      setVault(JSON.parse(savedVault));
    }
    if (savedMemories) {
      setMemories(JSON.parse(savedMemories));
    }
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    }
  }, []);

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('coach_profile', JSON.stringify(newProfile));
    // 新用戶填完資料後，直接引導至課表設定
    setActiveState(AppState.SCHEDULE_SETUP);
  };

  const handleSaveSchedule = (newSchedule: DayPlan[]) => {
    setSchedule(newSchedule);
    localStorage.setItem('coach_schedule', JSON.stringify(newSchedule));
    // 設定完課表後，進入 Dashboard
    setActiveState(AppState.DASHBOARD);
  };

  const handleAddVaultItem = (item: Omit<ResourceItem, 'id' | 'createdAt'>) => {
    const newItem: ResourceItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updatedVault = [newItem, ...vault];
    setVault(updatedVault);
    localStorage.setItem('coach_vault', JSON.stringify(updatedVault));
  };

  const handleDeleteVaultItem = (id: string) => {
    const updatedVault = vault.filter(v => v.id !== id);
    setVault(updatedVault);
    localStorage.setItem('coach_vault', JSON.stringify(updatedVault));
  };

  const handleAddMemory = (content: string, category: MemoryEntry['category']) => {
    const newMemory: MemoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      category,
      content
    };
    const updatedMemories = [newMemory, ...memories];
    setMemories(updatedMemories);
    localStorage.setItem('coach_memories', JSON.stringify(updatedMemories));
  };

  const handleDeleteMemory = (id: string) => {
    const updatedMemories = memories.filter(m => m.id !== id);
    setMemories(updatedMemories);
    localStorage.setItem('coach_memories', JSON.stringify(updatedMemories));
  };

  return (
    <ApiKeyProvider>
      <div className="flex min-h-screen bg-slate-50">
        {profile && (
          <Sidebar 
            activeState={activeState} 
            onNavigate={setActiveState} 
            userName={profile.fanPageName}
          />
        )}
        
        <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
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
                vault={vault} // 雖然沒用到但接口可能有定義
                onNavigate={setActiveState}
                onAddMemory={handleAddMemory}
              />
            )}
            {activeState === AppState.VAULT && (
              <VaultView items={vault} onAdd={handleAddVaultItem} onDelete={handleDeleteVaultItem} />
            )}
            {activeState === AppState.STRATEGY && (
              <StrategyChatView 
                profile={profile} 
                memories={memories} 
                onAddMemory={handleAddMemory}
              />
            )}
            {activeState === AppState.MEMORY && (
              <MemoryView 
                memories={memories} 
                onAdd={handleAddMemory} 
                onDelete={handleDeleteMemory} 
              />
            )}
          </>
        )}

        {!profile && activeState !== AppState.ONBOARDING && (
          <div className="flex items-center justify-center h-full">
            <button 
              onClick={() => setActiveState(AppState.ONBOARDING)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl"
            >
              請先完成基礎設定
            </button>
          </div>
        )}
      </main>

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
      </div>
    </ApiKeyProvider>
  );
};

export default App;
