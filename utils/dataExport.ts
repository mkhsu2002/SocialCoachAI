/**
 * 資料匯出/匯入工具
 */

import { UserProfile, ResourceItem, MemoryEntry, DayPlan, DailyInspiration } from '../types';
import { 
  profileStorage, 
  vaultStorage, 
  memoriesStorage, 
  scheduleStorage 
} from './storageService';

export interface ExportData {
  version: string;
  exportDate: string;
  profile: UserProfile | null;
  vault: ResourceItem[];
  memories: MemoryEntry[];
  schedule: DayPlan[];
  dailyInspirations: Record<string, DailyInspiration[]>; // 以日期為 key 的每日靈感
  inspirationDrafts: Record<string, string>; // 以索引為 key 的靈感草稿
}

const CURRENT_VERSION = '1.0.0';

/**
 * 取得所有每日靈感資料
 */
function getAllDailyInspirations(): Record<string, DailyInspiration[]> {
  const result: Record<string, DailyInspiration[]> = {};
  const prefix = 'daily_inspirations_';
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const dateKey = key.replace(prefix, '');
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              result[dateKey] = parsed;
            }
          } catch (error) {
            console.warn(`解析每日靈感失敗 (${dateKey}):`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('讀取每日靈感失敗:', error);
  }
  
  return result;
}

/**
 * 取得所有靈感草稿資料
 */
function getAllInspirationDrafts(): Record<string, string> {
  const result: Record<string, string> = {};
  const prefix = 'inspiration_draft_';
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const indexKey = key.replace(prefix, '');
        const data = localStorage.getItem(key);
        if (data) {
          result[indexKey] = data;
        }
      }
    }
  } catch (error) {
    console.error('讀取靈感草稿失敗:', error);
  }
  
  return result;
}

/**
 * 匯出所有資料
 */
export function exportAllData(): ExportData {
  return {
    version: CURRENT_VERSION,
    exportDate: new Date().toISOString(),
    profile: profileStorage.get(),
    vault: vaultStorage.get(),
    memories: memoriesStorage.get(),
    schedule: scheduleStorage.get(),
    dailyInspirations: getAllDailyInspirations(),
    inspirationDrafts: getAllInspirationDrafts(),
  };
}

/**
 * 匯出資料為 JSON 字串
 */
export function exportDataAsJson(): string {
  const data = exportAllData();
  return JSON.stringify(data, null, 2);
}

/**
 * 下載資料為 JSON 檔案
 */
export function downloadDataAsFile(filename?: string): void {
  const json = exportDataAsJson();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `social-coach-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 驗證匯入資料格式
 */
export function validateImportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const exportData = data as Record<string, unknown>;

  // 檢查必要欄位
  if (typeof exportData.version !== 'string') {
    return false;
  }

  if (typeof exportData.exportDate !== 'string') {
    return false;
  }

  // Profile 可以是 null 或物件
  if (exportData.profile !== null && typeof exportData.profile !== 'object') {
    return false;
  }

  // 其他欄位必須是陣列
  if (!Array.isArray(exportData.vault)) {
    return false;
  }

  if (!Array.isArray(exportData.memories)) {
    return false;
  }

  if (!Array.isArray(exportData.schedule)) {
    return false;
  }

  // dailyInspirations 和 inspirationDrafts 是可選的（向後相容）
  if (exportData.dailyInspirations !== undefined && typeof exportData.dailyInspirations !== 'object') {
    return false;
  }

  if (exportData.inspirationDrafts !== undefined && typeof exportData.inspirationDrafts !== 'object') {
    return false;
  }

  return true;
}

/**
 * 匯入資料
 */
export function importData(data: ExportData): {
  success: boolean;
  error?: string;
} {
  try {
    // 驗證資料格式
    if (!validateImportData(data)) {
      return {
        success: false,
        error: '資料格式無效',
      };
    }

    // 匯入資料（使用 storageService 的驗證機制）
    if (data.profile) {
      try {
        profileStorage.set(data.profile);
      } catch (error) {
        console.warn('匯入 Profile 失敗:', error);
      }
    }

    try {
      vaultStorage.set(data.vault);
    } catch (error) {
      console.warn('匯入 Vault 失敗:', error);
    }

    try {
      memoriesStorage.set(data.memories);
    } catch (error) {
      console.warn('匯入 Memories 失敗:', error);
    }

    try {
      scheduleStorage.set(data.schedule);
    } catch (error) {
      console.warn('匯入 Schedule 失敗:', error);
    }

    // 匯入每日靈感（如果有的話）
    if (data.dailyInspirations && typeof data.dailyInspirations === 'object') {
      try {
        Object.entries(data.dailyInspirations).forEach(([dateKey, inspirations]) => {
          if (Array.isArray(inspirations)) {
            const storageKey = `daily_inspirations_${dateKey}`;
            localStorage.setItem(storageKey, JSON.stringify(inspirations));
          }
        });
      } catch (error) {
        console.warn('匯入每日靈感失敗:', error);
      }
    }

    // 匯入靈感草稿（如果有的話）
    if (data.inspirationDrafts && typeof data.inspirationDrafts === 'object') {
      try {
        Object.entries(data.inspirationDrafts).forEach(([indexKey, draft]) => {
          if (typeof draft === 'string') {
            const storageKey = `inspiration_draft_${indexKey}`;
            localStorage.setItem(storageKey, draft);
          }
        });
      } catch (error) {
        console.warn('匯入靈感草稿失敗:', error);
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '匯入失敗',
    };
  }
}

/**
 * 從 JSON 字串匯入資料
 */
export function importDataFromJson(json: string): {
  success: boolean;
  error?: string;
} {
  try {
    const data = JSON.parse(json);
    return importData(data);
  } catch (error) {
    return {
      success: false,
      error: 'JSON 格式錯誤',
    };
  }
}

/**
 * 從檔案匯入資料
 */
export function importDataFromFile(file: File): Promise<{
  success: boolean;
  error?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        resolve(importDataFromJson(text));
      } else {
        resolve({
          success: false,
          error: '無法讀取檔案',
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: '讀取檔案失敗',
      });
    };

    reader.readAsText(file);
  });
}

