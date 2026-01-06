/**
 * 每日靈感儲存工具
 * 以日期為 key 儲存每日生成的靈感
 */

import { DailyInspiration } from '../types';
import { safeJsonParse } from './typeGuards';
import { isDailyInspirationArray } from './typeGuards';

const STORAGE_KEY_PREFIX = 'daily_inspirations_';

/**
 * 取得今天的日期字串（YYYY-MM-DD）
 */
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 取得指定日期的靈感
 */
export function getDailyInspirations(date?: string): DailyInspiration[] {
  const dateKey = date || getTodayKey();
  const storageKey = `${STORAGE_KEY_PREFIX}${dateKey}`;
  const data = localStorage.getItem(storageKey);
  
  if (!data) return [];

  try {
    const parsed = safeJsonParse<DailyInspiration[]>(data, []);
    if (isDailyInspirationArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('解析每日靈感失敗:', error);
    return [];
  }
}

/**
 * 儲存指定日期的靈感
 */
export function setDailyInspirations(inspirations: DailyInspiration[], date?: string): void {
  const dateKey = date || getTodayKey();
  const storageKey = `${STORAGE_KEY_PREFIX}${dateKey}`;
  
  if (!isDailyInspirationArray(inspirations)) {
    console.warn('靈感資料格式無效');
    return;
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(inspirations));
  } catch (error) {
    console.error('儲存每日靈感失敗:', error);
  }
}

/**
 * 清除指定日期的靈感
 */
export function clearDailyInspirations(date?: string): void {
  const dateKey = date || getTodayKey();
  const storageKey = `${STORAGE_KEY_PREFIX}${dateKey}`;
  localStorage.removeItem(storageKey);
}

/**
 * 清除所有過期靈感（保留最近 7 天）
 */
export function cleanExpiredInspirations(): void {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 清除 7 天前的靈感
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      const dateStr = key.replace(STORAGE_KEY_PREFIX, '');
      const date = new Date(dateStr);
      if (date < sevenDaysAgo) {
        localStorage.removeItem(key);
      }
    }
  }
}

