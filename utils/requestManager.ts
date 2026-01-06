/**
 * API 請求管理工具
 * 處理請求去重、超時清理等功能
 */

interface PendingRequest {
  promise: Promise<unknown>;
  timestamp: number;
  timeoutId?: ReturnType<typeof setTimeout>;
}

class RequestManager {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 分鐘預設超時

  /**
   * 取得或建立請求
   * @param key 請求鍵值
   * @param requestFn 請求函數
   * @param timeout 超時時間（毫秒）
   */
  async getOrCreate<T>(
    key: string,
    requestFn: () => Promise<T>,
    timeout: number = this.DEFAULT_TIMEOUT
  ): Promise<T> {
    // 檢查是否有進行中的請求
    const existing = this.pendingRequests.get(key);
    if (existing) {
      return existing.promise as Promise<T>;
    }

    // 建立新的請求
    const promise = requestFn()
      .finally(() => {
        // 無論成功或失敗都清理
        this.cleanup(key);
      });

    // 設定超時清理
    const timeoutId = setTimeout(() => {
      if (this.pendingRequests.has(key)) {
        console.warn(`請求超時: ${key}`);
        this.cleanup(key);
      }
    }, timeout);

    // 儲存請求資訊
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
      timeoutId,
    });

    return promise;
  }

  /**
   * 清理指定請求
   */
  private cleanup(key: string): void {
    const request = this.pendingRequests.get(key);
    if (request) {
      if (request.timeoutId) {
        clearTimeout(request.timeoutId);
      }
      this.pendingRequests.delete(key);
    }
  }

  /**
   * 清理所有請求
   */
  clearAll(): void {
    for (const [key, request] of this.pendingRequests.entries()) {
      if (request.timeoutId) {
        clearTimeout(request.timeoutId);
      }
    }
    this.pendingRequests.clear();
  }

  /**
   * 清理過期請求（超過指定時間的請求）
   */
  cleanExpired(maxAge: number = 10 * 60 * 1000): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > maxAge) {
        console.warn(`清理過期請求: ${key}`);
        this.cleanup(key);
      }
    }
  }

  /**
   * 取得當前進行中的請求數量
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

export const requestManager = new RequestManager();

// 定期清理過期請求（每 5 分鐘）
if (typeof window !== 'undefined') {
  setInterval(() => {
    requestManager.cleanExpired();
  }, 5 * 60 * 1000);

  // 在頁面卸載時清理所有請求
  window.addEventListener('beforeunload', () => {
    requestManager.clearAll();
  });
}

