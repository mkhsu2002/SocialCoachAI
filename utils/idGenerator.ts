/**
 * ID 生成工具
 * 提供安全的唯一 ID 生成方法
 */

/**
 * 生成唯一 ID
 * 優先使用 crypto.randomUUID()，如果不支援則使用時間戳 + 隨機數
 */
export function generateId(): string {
  // 檢查是否支援 crypto.randomUUID
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: 使用時間戳 + 隨機數
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * 生成簡短的唯一 ID（適用於不需要 UUID 格式的場景）
 */
export function generateShortId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

