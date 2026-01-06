/**
 * API 請求快取工具
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ApiCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 分鐘預設過期時間

  /**
   * 生成快取鍵
   */
  private generateKey(prefix: string, params: Record<string, unknown>): string {
    const paramsStr = JSON.stringify(params);
    return `${prefix}:${paramsStr}`;
  }

  /**
   * 取得快取資料
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // 檢查是否過期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 設定快取資料
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    this.cache.set(key, entry);
  }

  /**
   * 清除快取
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 清除過期快取
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new ApiCache();

// 定期清理過期快取（每 10 分鐘）
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

if (typeof window !== 'undefined') {
  cleanupInterval = setInterval(() => {
    apiCache.cleanExpired();
  }, 10 * 60 * 1000);

  // 在頁面卸載時清理 interval
  window.addEventListener('beforeunload', () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  });
}

/**
 * 手動清理 interval（用於測試或特殊情況）
 */
export function cleanupCacheInterval(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

