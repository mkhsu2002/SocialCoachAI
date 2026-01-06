/**
 * 重試機制工具
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  backoff: 'exponential',
  onRetry: () => {},
};

/**
 * 延遲函數
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 計算重試延遲時間
 */
function calculateDelay(attempt: number, baseDelay: number, backoff: 'linear' | 'exponential'): number {
  if (backoff === 'exponential') {
    return baseDelay * Math.pow(2, attempt);
  }
  return baseDelay * (attempt + 1);
}

/**
 * 帶重試機制的函數執行器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // 如果是最後一次嘗試，直接拋出錯誤
      if (attempt === opts.maxRetries) {
        throw lastError;
      }

      // 執行重試回調
      opts.onRetry(attempt + 1, lastError);

      // 計算延遲時間
      const delayTime = calculateDelay(attempt, opts.retryDelay, opts.backoff);
      await delay(delayTime);
    }
  }

  throw lastError || new Error('Retry failed');
}

