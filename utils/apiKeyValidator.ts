/**
 * API Key 驗證工具
 */

/**
 * 驗證 Gemini API Key 格式
 * Gemini API Key 通常以 "AIza" 開頭，長度約 39 字元
 */
export function validateApiKeyFormat(key: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = key.trim();

  if (!trimmed) {
    return {
      valid: false,
      error: 'API Key 不能為空',
    };
  }

  if (trimmed.length < 20) {
    return {
      valid: false,
      error: 'API Key 長度不足，請檢查是否輸入完整',
    };
  }

  if (trimmed.length > 200) {
    return {
      valid: false,
      error: 'API Key 長度過長，請檢查是否輸入錯誤',
    };
  }

  // Gemini API Key 通常以 "AIza" 開頭
  if (!trimmed.startsWith('AIza')) {
    return {
      valid: false,
      error: 'API Key 格式可能不正確，Gemini API Key 通常以 "AIza" 開頭',
    };
  }

  // 檢查是否包含空格
  if (trimmed.includes(' ')) {
    return {
      valid: false,
      error: 'API Key 不應包含空格，請檢查是否複製完整',
    };
  }

  return {
    valid: true,
  };
}

/**
 * 遮罩 API Key（僅顯示前後幾位）
 */
export function maskApiKey(key: string, visibleChars: number = 4): string {
  if (!key || key.length <= visibleChars * 2) {
    return '*'.repeat(key.length);
  }
  const start = key.substring(0, visibleChars);
  const end = key.substring(key.length - visibleChars);
  const masked = '*'.repeat(key.length - visibleChars * 2);
  return `${start}${masked}${end}`;
}

