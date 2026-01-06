/**
 * localStorage 封裝服務
 * 提供統一的資料存取介面，包含錯誤處理與資料驗證
 */

import { UserProfile, ResourceItem, MemoryEntry, DayPlan } from '../types';
import { 
  isUserProfile, 
  isResourceItem, 
  isMemoryEntry, 
  isDayPlanArray,
  safeJsonParse 
} from './typeGuards';

/**
 * Storage Keys 常數
 */
export const STORAGE_KEYS = {
  PROFILE: 'coach_profile',
  VAULT: 'coach_vault',
  MEMORIES: 'coach_memories',
  SCHEDULE: 'coach_schedule',
} as const;

/**
 * Storage 錯誤類別
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public key: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * 檢查 localStorage 是否可用
 */
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全讀取 localStorage
 */
function safeGetItem(key: string): string | null {
  if (!isStorageAvailable()) {
    console.warn(`localStorage 不可用，無法讀取 ${key}`);
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`讀取 localStorage 失敗 (${key}):`, error);
    throw new StorageError(`無法讀取儲存資料: ${key}`, key, error);
  }
}

/**
 * 安全寫入 localStorage
 */
function safeSetItem(key: string, value: string): void {
  if (!isStorageAvailable()) {
    console.warn(`localStorage 不可用，無法儲存 ${key}`);
    return;
  }

  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`寫入 localStorage 失敗 (${key}):`, error);
    // 檢查是否為儲存空間不足
    if (error instanceof DOMException && error.code === 22) {
      throw new StorageError(`儲存空間不足，無法儲存 ${key}`, key, error);
    }
    throw new StorageError(`無法儲存資料: ${key}`, key, error);
  }
}

/**
 * 安全刪除 localStorage
 */
function safeRemoveItem(key: string): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`刪除 localStorage 失敗 (${key}):`, error);
    // 刪除失敗通常不影響功能，只記錄警告
  }
}

/**
 * Profile 相關操作
 */
export const profileStorage = {
  get(): UserProfile | null {
    const data = safeGetItem(STORAGE_KEYS.PROFILE);
    if (!data) return null;

    try {
      const parsed = safeJsonParse<UserProfile>(data, null);
      if (parsed && isUserProfile(parsed)) {
        return parsed;
      }
      console.warn('Profile 資料格式無效，已清除');
      this.remove();
      return null;
    } catch (error) {
      console.error('解析 Profile 資料失敗:', error);
      this.remove();
      return null;
    }
  },

  set(profile: UserProfile): void {
    if (!isUserProfile(profile)) {
      throw new StorageError('Profile 資料格式無效', STORAGE_KEYS.PROFILE);
    }
    safeSetItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  remove(): void {
    safeRemoveItem(STORAGE_KEYS.PROFILE);
  },
};

/**
 * Vault 相關操作
 */
export const vaultStorage = {
  get(): ResourceItem[] {
    const data = safeGetItem(STORAGE_KEYS.VAULT);
    if (!data) return [];

    try {
      const parsed = safeJsonParse<ResourceItem[]>(data, []);
      if (Array.isArray(parsed)) {
        // 驗證每個項目
        const validItems = parsed.filter(item => isResourceItem(item));
        if (validItems.length !== parsed.length) {
          console.warn('部分 Vault 資料格式無效，已過濾');
          // 儲存清理後的資料
          this.set(validItems);
        }
        return validItems;
      }
      console.warn('Vault 資料格式無效，已清除');
      this.remove();
      return [];
    } catch (error) {
      console.error('解析 Vault 資料失敗:', error);
      this.remove();
      return [];
    }
  },

  set(items: ResourceItem[]): void {
    if (!Array.isArray(items)) {
      throw new StorageError('Vault 資料必須是陣列', STORAGE_KEYS.VAULT);
    }
    safeSetItem(STORAGE_KEYS.VAULT, JSON.stringify(items));
  },

  remove(): void {
    safeRemoveItem(STORAGE_KEYS.VAULT);
  },
};

/**
 * Memories 相關操作
 */
export const memoriesStorage = {
  get(): MemoryEntry[] {
    const data = safeGetItem(STORAGE_KEYS.MEMORIES);
    if (!data) return [];

    try {
      const parsed = safeJsonParse<MemoryEntry[]>(data, []);
      if (Array.isArray(parsed)) {
        // 驗證每個項目
        const validItems = parsed.filter(item => isMemoryEntry(item));
        if (validItems.length !== parsed.length) {
          console.warn('部分 Memories 資料格式無效，已過濾');
          this.set(validItems);
        }
        return validItems;
      }
      console.warn('Memories 資料格式無效，已清除');
      this.remove();
      return [];
    } catch (error) {
      console.error('解析 Memories 資料失敗:', error);
      this.remove();
      return [];
    }
  },

  set(memories: MemoryEntry[]): void {
    if (!Array.isArray(memories)) {
      throw new StorageError('Memories 資料必須是陣列', STORAGE_KEYS.MEMORIES);
    }
    safeSetItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  },

  remove(): void {
    safeRemoveItem(STORAGE_KEYS.MEMORIES);
  },
};

/**
 * Schedule 相關操作
 */
export const scheduleStorage = {
  get(): DayPlan[] {
    const data = safeGetItem(STORAGE_KEYS.SCHEDULE);
    if (!data) return [];

    try {
      const parsed = safeJsonParse<DayPlan[]>(data, []);
      if (isDayPlanArray(parsed)) {
        return parsed;
      }
      console.warn('Schedule 資料格式無效，已清除');
      this.remove();
      return [];
    } catch (error) {
      console.error('解析 Schedule 資料失敗:', error);
      this.remove();
      return [];
    }
  },

  set(schedule: DayPlan[]): void {
    if (!isDayPlanArray(schedule)) {
      throw new StorageError('Schedule 資料格式無效', STORAGE_KEYS.SCHEDULE);
    }
    safeSetItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  },

  remove(): void {
    safeRemoveItem(STORAGE_KEYS.SCHEDULE);
  },
};

/**
 * 清除所有資料
 */
export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    safeRemoveItem(key);
  });
}

