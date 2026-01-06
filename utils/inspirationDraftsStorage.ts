/**
 * 靈感草稿儲存工具
 * 儲存編輯中的靈感內容草稿
 */

const STORAGE_KEY_PREFIX = 'inspiration_draft_';

/**
 * 取得指定索引的靈感草稿
 */
export function getInspirationDraft(index: number): string | null {
  const storageKey = `${STORAGE_KEY_PREFIX}${index}`;
  const data = localStorage.getItem(storageKey);
  return data || null;
}

/**
 * 儲存指定索引的靈感草稿
 */
export function setInspirationDraft(index: number, content: string): void {
  const storageKey = `${STORAGE_KEY_PREFIX}${index}`;
  try {
    localStorage.setItem(storageKey, content);
  } catch (error) {
    console.error('儲存靈感草稿失敗:', error);
  }
}

/**
 * 清除指定索引的靈感草稿
 */
export function clearInspirationDraft(index: number): void {
  const storageKey = `${STORAGE_KEY_PREFIX}${index}`;
  localStorage.removeItem(storageKey);
}

/**
 * 清除所有靈感草稿
 */
export function clearAllDrafts(): void {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
}

/**
 * 清除過期草稿（保留最近 7 天）
 */
export function cleanExpiredDrafts(): void {
  // 目前草稿沒有時間戳，所以暫時不清除
  // 未來可以添加時間戳來實現過期清理
}

