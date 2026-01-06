import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserProfile, ResourceItem, MemoryEntry, DayPlan } from '../types';
import { 
  profileStorage, 
  vaultStorage, 
  memoriesStorage, 
  scheduleStorage 
} from '../utils/storageService';
import { generateId } from '../utils/idGenerator';
import { useToast } from './ToastContext';

interface AppDataContextType {
  // Profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  
  // Vault
  vault: ResourceItem[];
  addVaultItem: (item: Omit<ResourceItem, 'id' | 'createdAt'>) => void;
  updateVaultItem: (id: string, updates: Partial<ResourceItem>) => void;
  deleteVaultItem: (id: string) => void;
  
  // Memories
  memories: MemoryEntry[];
  addMemory: (content: string, category: MemoryEntry['category']) => void;
  updateMemory: (id: string, updates: Partial<MemoryEntry>) => void;
  deleteMemory: (id: string) => void;
  
  // Schedule
  schedule: DayPlan[];
  setSchedule: (schedule: DayPlan[]) => void;
  updateScheduleDay: (day: DayPlan['day'], updates: Partial<DayPlan>) => void;
  
  // 載入狀態
  isLoading: boolean;
  
  // 清除所有資料
  clearAllData: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [vault, setVaultState] = useState<ResourceItem[]>([]);
  const [memories, setMemoriesState] = useState<MemoryEntry[]>([]);
  const [schedule, setScheduleState] = useState<DayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 載入初始資料
  useEffect(() => {
    try {
      const loadedProfile = profileStorage.get();
      const loadedVault = vaultStorage.get();
      const loadedMemories = memoriesStorage.get();
      const loadedSchedule = scheduleStorage.get();

      setProfileState(loadedProfile);
      setVaultState(loadedVault);
      setMemoriesState(loadedMemories);
      setScheduleState(loadedSchedule);
    } catch (error) {
      console.error('載入應用程式資料失敗:', error);
      showToast('載入資料時發生錯誤', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Profile 操作
  const setProfile = useCallback((newProfile: UserProfile) => {
    try {
      profileStorage.set(newProfile);
      setProfileState(newProfile);
    } catch (error) {
      console.error('儲存 Profile 失敗:', error);
      showToast('儲存設定失敗', 'error');
      throw error;
    }
  }, [showToast]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...updates });
  }, [profile, setProfile]);

  // Vault 操作
  const addVaultItem = useCallback((item: Omit<ResourceItem, 'id' | 'createdAt'>) => {
    const newItem: ResourceItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    try {
      const updatedVault = [newItem, ...vault];
      vaultStorage.set(updatedVault);
      setVaultState(updatedVault);
    } catch (error) {
      console.error('新增 Vault 項目失敗:', error);
      showToast('新增素材失敗', 'error');
      throw error;
    }
  }, [vault]);

  const updateVaultItem = useCallback((id: string, updates: Partial<ResourceItem>) => {
    try {
      const updatedVault = vault.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      vaultStorage.set(updatedVault);
      setVaultState(updatedVault);
    } catch (error) {
      console.error('更新 Vault 項目失敗:', error);
      showToast('更新素材失敗', 'error');
      throw error;
    }
  }, [vault]);

  const deleteVaultItem = useCallback((id: string) => {
    try {
      const updatedVault = vault.filter(item => item.id !== id);
      vaultStorage.set(updatedVault);
      setVaultState(updatedVault);
    } catch (error) {
      console.error('刪除 Vault 項目失敗:', error);
      showToast('刪除素材失敗', 'error');
      throw error;
    }
  }, [vault]);

  // Memories 操作
  const addMemory = useCallback((content: string, category: MemoryEntry['category']) => {
    const newMemory: MemoryEntry = {
      id: generateId(),
      date: new Date().toISOString(),
      category,
      content,
    };
    try {
      const updatedMemories = [newMemory, ...memories];
      memoriesStorage.set(updatedMemories);
      setMemoriesState(updatedMemories);
    } catch (error) {
      console.error('新增 Memory 失敗:', error);
      showToast('新增筆記失敗', 'error');
      throw error;
    }
  }, [memories]);

  const updateMemory = useCallback((id: string, updates: Partial<MemoryEntry>) => {
    try {
      const updatedMemories = memories.map(m => 
        m.id === id ? { ...m, ...updates } : m
      );
      memoriesStorage.set(updatedMemories);
      setMemoriesState(updatedMemories);
    } catch (error) {
      console.error('更新 Memory 失敗:', error);
      showToast('更新筆記失敗', 'error');
      throw error;
    }
  }, [memories]);

  const deleteMemory = useCallback((id: string) => {
    try {
      const updatedMemories = memories.filter(m => m.id !== id);
      memoriesStorage.set(updatedMemories);
      setMemoriesState(updatedMemories);
    } catch (error) {
      console.error('刪除 Memory 失敗:', error);
      showToast('刪除筆記失敗', 'error');
      throw error;
    }
  }, [memories]);

  // Schedule 操作
  const setSchedule = useCallback((newSchedule: DayPlan[]) => {
    try {
      scheduleStorage.set(newSchedule);
      setScheduleState(newSchedule);
    } catch (error) {
      console.error('儲存 Schedule 失敗:', error);
      showToast('儲存課表失敗', 'error');
      throw error;
    }
  }, [showToast]);

  const updateScheduleDay = useCallback((day: DayPlan['day'], updates: Partial<DayPlan>) => {
    try {
      const updatedSchedule = schedule.map(plan => 
        plan.day === day ? { ...plan, ...updates } : plan
      );
      scheduleStorage.set(updatedSchedule);
      setScheduleState(updatedSchedule);
    } catch (error) {
      console.error('更新 Schedule 失敗:', error);
      showToast('更新課表失敗', 'error');
      throw error;
    }
  }, [schedule]);

  // 清除所有資料
  const clearAllData = useCallback(() => {
    try {
      profileStorage.remove();
      vaultStorage.remove();
      memoriesStorage.remove();
      scheduleStorage.remove();
      setProfileState(null);
      setVaultState([]);
      setMemoriesState([]);
      setScheduleState([]);
      showToast('所有資料已清除', 'success');
    } catch (error) {
      console.error('清除資料失敗:', error);
      showToast('清除資料失敗', 'error');
    }
  }, [showToast]);

  const value: AppDataContextType = {
    profile,
    setProfile,
    updateProfile,
    vault,
    addVaultItem,
    updateVaultItem,
    deleteVaultItem,
    memories,
    addMemory,
    updateMemory,
    deleteMemory,
    schedule,
    setSchedule,
    updateScheduleDay,
    isLoading,
    clearAllData,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

