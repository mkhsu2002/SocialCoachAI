/**
 * 生成貼文內容服務
 * 根據靈感和用戶設定生成完整的貼文內容
 */

import { GoogleGenAI } from "@google/genai";
import { UserProfile, DailyInspiration } from "../types";
import { AppError, formatApiError, isRetryableError } from "../utils/errorHandler";
import { withRetry } from "../utils/retry";

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
 * 根據靈感生成完整的貼文內容
 */
export async function generatePostContent(
  inspiration: DailyInspiration,
  profile: UserProfile,
  apiKey: string | null
): Promise<string> {
  const ai = createAIInstance(apiKey);

  // 準備小編人設提示詞
  const personaPrompt = profile.copywriterPersona 
    ? `\n【小編人設】\n${profile.copywriterPersona}\n\n請嚴格按照以上小編人設來撰寫貼文內容，確保語氣、風格、特色都符合人設設定。`
    : '';

  const systemInstruction = `你是一位專業的社群經營內容撰寫專家。請根據用戶提供的靈感和基本設定，生成一篇完整的社群貼文內容。

【用戶基本設定】
- 粉專名稱：${profile.fanPageName}
- 內容定位：${profile.positioning}
- 目標受眾：${profile.targetAudience}
- 經營目的：${profile.destination}
- 目標區域：${profile.targetRegion}
${profile.additionalNotes ? `- 補充說明：${profile.additionalNotes}` : ''}
${personaPrompt}

【靈感資訊】
- 靈感主題：${inspiration.idea}
- Hook 開場：${inspiration.hook}
- 建議形式：${inspiration.formatSuggestion}

【撰寫要求】
1. 使用繁體中文撰寫
2. 開場必須使用或參考提供的 Hook：「${inspiration.hook}」
3. 內容要符合「${inspiration.idea}」這個主題
4. 呈現形式要符合「${inspiration.formatSuggestion}」的建議
5. 內容要吸引目標受眾「${profile.targetAudience}」
6. 語氣要符合目標區域「${profile.targetRegion}」的習慣
7. 內容長度適中，適合社群平台發文（約 200-500 字）
8. 可以適當使用 Emoji 增加親和力
9. 結尾要有明確的 CTA（呼籲行動）
${profile.copywriterPersona ? '10. 嚴格遵循小編人設的語氣和風格' : ''}

請生成一篇完整、可直接使用的貼文內容。`;

  const prompt = `請根據以上資訊，生成一篇完整的社群貼文內容。`;

  return withRetry(
    async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction
        }
      });

      const generatedContent = response.text || '';
      
      if (!generatedContent.trim()) {
        throw new AppError('AI 生成內容為空', 'EMPTY_RESPONSE', false);
      }

      return generatedContent.trim();
    },
    {
      maxRetries: 3,
      retryDelay: 1000,
      backoff: 'exponential'
    }
  ).catch(error => {
    throw new AppError(
      formatApiError(error) || '生成貼文內容失敗',
      'POST_GENERATION_ERROR',
      isRetryableError(error)
    );
  });
}

