/**
 * 網址內容抓取工具
 * 使用 Gemini API 抓取並分析網頁內容
 */

import { GoogleGenAI } from "@google/genai";
import { AppError, formatApiError, isRetryableError } from "./errorHandler";
import { withRetry } from "./retry";

/**
 * 建立 AI 實例
 */
function createAIInstance(apiKey: string | null): GoogleGenAI {
  const key = apiKey || process.env.API_KEY || process.env.GEMINI_API_KEY || '';
  if (!key) {
    throw new AppError('Gemini API Key 未設定，請先設定 API Key', 'API_KEY_MISSING', false);
  }
  return new GoogleGenAI({ apiKey: key });
}

/**
 * 驗證 URL 格式
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 從網址抓取內容並生成摘要
 * 注意：由於 CORS 限制，此功能需要用戶提供網頁內容或使用代理服務
 * 目前實作使用 Gemini API 分析網址並生成建議
 */
export async function extractContentFromUrl(
  url: string,
  apiKey: string | null
): Promise<{
  title: string;
  content: string;
  summary?: string;
}> {
  if (!isValidUrl(url)) {
    throw new AppError('無效的網址格式', 'INVALID_URL', false);
  }

  const ai = createAIInstance(apiKey);

  return withRetry(
    async () => {
      // 使用 Gemini API 分析網址並提供建議
      // 注意：由於瀏覽器 CORS 限制，無法直接抓取網頁內容
      // 此功能會根據網址生成一個建議的標題和內容模板
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `請根據以下網址，生成一個適合儲存為社群經營素材的內容摘要。

網址：${url}

請分析這個網址可能包含的內容類型（文章、影片、圖片、產品頁面等），並提供：
1. 建議的標題（根據網址推測）
2. 內容摘要模板（200-300字，說明這個網址可能包含的內容類型與重點）
3. 關鍵資訊提示

請以 JSON 格式回覆：
{
  "title": "建議標題",
  "summary": "內容摘要與說明",
  "keyPoints": ["關鍵點1", "關鍵點2", ...],
  "contentType": "內容類型（如：文章、影片、產品頁面等）"
}`,
        config: {
          systemInstruction: '你是一位專業的內容分析師，能夠根據網址推測內容類型並生成適合社群經營的素材摘要。',
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      const title = result.title || new URL(url).hostname.replace('www.', '');
      const summary = result.summary || `來自 ${url} 的內容`;
      const keyPoints = result.keyPoints || [];
      
      return {
        title,
        content: `${summary}\n\n${keyPoints.length > 0 ? '關鍵重點：\n' + keyPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n') : ''}\n\n來源：${url}`,
        summary,
      };
    },
    {
      maxRetries: 2,
      retryDelay: 1000,
      backoff: 'exponential'
    }
  ).catch(error => {
    throw new AppError(
      formatApiError(error) || '無法分析網址內容，請檢查 API Key 是否已設定',
      'URL_EXTRACTION_ERROR',
      isRetryableError(error)
    );
  });
}

