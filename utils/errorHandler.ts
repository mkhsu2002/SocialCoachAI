import { ToastType } from '../contexts/ToastContext';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  toastType?: ToastType;
  defaultMessage?: string;
  onError?: (error: Error) => void;
}

/**
 * 統一錯誤處理函數
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): string {
  const {
    showToast = false,
    toastType = 'error',
    defaultMessage = '發生錯誤，請稍後再試',
    onError
  } = options;

  let errorMessage = defaultMessage;
  let errorToHandle: Error;

  // 處理不同類型的錯誤
  if (error instanceof AppError) {
    errorToHandle = error;
    errorMessage = error.message;
  } else if (error instanceof Error) {
    errorToHandle = error;
    errorMessage = error.message || defaultMessage;
  } else if (typeof error === 'string') {
    errorToHandle = new Error(error);
    errorMessage = error;
  } else {
    errorToHandle = new Error(String(error));
    errorMessage = defaultMessage;
  }

  // 記錄錯誤
  console.error('Error handled:', errorToHandle);

  // 執行自訂錯誤處理
  if (onError) {
    onError(errorToHandle);
  }

  return errorMessage;
}

/**
 * 判斷錯誤是否可重試
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.retryable;
  }
  
  if (error instanceof Error) {
    // 網路錯誤通常可重試
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('timeout') ||
           message.includes('fetch');
  }
  
  return false;
}

/**
 * 錯誤訊息與解決建議的對應
 */
interface ErrorInfo {
  message: string;
  suggestion?: string;
  action?: string;
}

const ERROR_MESSAGES: Array<{ pattern: RegExp; info: ErrorInfo }> = [
  {
    pattern: /api.*key|apikey|authentication|unauthorized/i,
    info: {
      message: 'API Key 未設定或無效',
      suggestion: '請前往設定頁面檢查並更新您的 Gemini API Key',
      action: '前往設定',
    },
  },
  {
    pattern: /network|fetch|connection|offline/i,
    info: {
      message: '網路連線問題',
      suggestion: '請檢查您的網路連線，或稍後再試',
      action: '重試',
    },
  },
  {
    pattern: /timeout|timed out/i,
    info: {
      message: '請求逾時',
      suggestion: '伺服器回應時間過長，請稍後再試',
      action: '重試',
    },
  },
  {
    pattern: /quota|limit|rate limit|429/i,
    info: {
      message: 'API 使用額度已達上限',
      suggestion: '您已達到 API 使用限制，請稍後再試或檢查您的 API 配額',
      action: '稍後再試',
    },
  },
  {
    pattern: /invalid.*response|parse.*error|json/i,
    info: {
      message: '資料格式錯誤',
      suggestion: '伺服器回應格式異常，請稍後再試',
      action: '重試',
    },
  },
  {
    pattern: /storage|localstorage|quota exceeded/i,
    info: {
      message: '儲存空間不足',
      suggestion: '瀏覽器儲存空間已滿，請清理瀏覽器快取或刪除部分資料',
      action: '清理資料',
    },
  },
];

/**
 * 格式化 API 錯誤訊息（友善版本）
 */
export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    
    // 尋找匹配的錯誤模式
    for (const { pattern, info } of ERROR_MESSAGES) {
      if (pattern.test(message)) {
        return info.message;
      }
    }
    
    // 如果沒有匹配，返回原始訊息或預設訊息
    return message || 'API 請求失敗，請稍後再試';
  }
  
  return '發生未知錯誤，請稍後再試';
}

/**
 * 取得錯誤的詳細資訊（包含建議）
 */
export function getErrorInfo(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    const message = error.message;
    
    // 尋找匹配的錯誤模式
    for (const { pattern, info } of ERROR_MESSAGES) {
      if (pattern.test(message)) {
        return info;
      }
    }
  }
  
  // 預設錯誤資訊
  return {
    message: '發生錯誤',
    suggestion: '請稍後再試，如果問題持續發生，請聯繫技術支援',
    action: '重試',
  };
}

