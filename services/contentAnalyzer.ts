/**
 * 內容分析服務
 * 使用 AI 將長文本、文件內容等拆解成多個素材項目
 */

import { GoogleGenAI, Type } from "@google/genai";
import { ResourceItem, ResourceItemType, RESOURCE_TYPE_LABELS } from "../types";
import { AppError, formatApiError, isRetryableError } from "../utils/errorHandler";
import { withRetry } from "../utils/retry";
import { safeJsonParse } from "../utils/typeGuards";

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
 * 分析內容並拆解成多個素材
 */
export async function analyzeAndSplitContent(
  content: string,
  apiKey: string | null
): Promise<Omit<ResourceItem, 'id' | 'createdAt'>[]> {
  const ai = createAIInstance(apiKey);

  const systemInstruction = `你是一位專業的社群經營內容分析師。請將用戶提供的內容（可能是文章、筆記、文件等）拆解成多個獨立的素材項目。

每個素材項目應該：
1. 有明確的標題（簡潔、具體）
2. 有完整的內容描述（包含關鍵資訊）
3. 有適當的類型分類

可用的類型分類：
- inspiration: 經營靈感（經營策略、靈感想法、內容規劃）
- asset: 發文素材（具體的發文素材、文案、圖片描述）
- character_design: 角色設定/圖稿（角色設定、人物描述、世界觀設定）
- story: 故事/劇情（故事內容、劇情發展、情節設計）
- quote: 金句/名言（勵志語錄、經典名言、金句）
- tutorial: 教學/乾貨（教學內容、知識分享、實用技巧）
- behind_scenes: 幕後花絮（製作過程、幕後故事、日常分享）
- interaction: 互動內容（問答、投票、討論話題）
- promotion: 推廣/活動（促銷活動、推廣內容、行銷活動）
- news: 新聞/時事（時事新聞、行業動態、熱點話題）
- review: 評價/心得（產品評價、使用心得、體驗分享）
- other: 其他（不屬於以上分類的內容）

拆解原則：
- 如果內容包含多個主題或段落，應該拆解成多個素材
- 每個素材應該是獨立的、可單獨使用的
- 保持原內容的關鍵資訊和上下文
- 標題要具體且有意義，不要使用「素材1」、「內容1」等泛用名稱
- 根據內容性質選擇最適合的類型分類

請以 JSON 陣列格式回覆，每個項目包含 title、content、type 三個欄位。`;

  const prompt = `請分析以下內容，並將其拆解成多個素材項目：

${content}

請以 JSON 陣列格式回覆，格式如下：
[
  {
    "title": "素材標題",
    "content": "素材內容描述",
    "type": "inspiration" | "asset" | "character_design" | "story" | "quote" | "tutorial" | "behind_scenes" | "interaction" | "promotion" | "news" | "review" | "other"
  },
  ...
]`;

  const RESOURCE_SCHEMA = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: '素材標題' },
        content: { type: Type.STRING, description: '素材內容描述' },
        type: { 
          type: Type.STRING, 
          description: '素材類型',
          enum: ['inspiration', 'asset', 'character_design', 'story', 'quote', 'tutorial', 'behind_scenes', 'interaction', 'promotion', 'news', 'review', 'other']
        }
      },
      required: ['title', 'content', 'type']
    }
  };

  return withRetry(
    async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: RESOURCE_SCHEMA
        }
      });

      const result = safeJsonParse<Omit<ResourceItem, 'id' | 'createdAt'>[]>(
        response.text || '[]',
        []
      );

      // 驗證結果
      if (!Array.isArray(result)) {
        throw new AppError('API 回應格式錯誤：預期為陣列', 'INVALID_RESPONSE', false);
      }

      // 驗證每個項目
      const validTypes: ResourceItemType[] = ['inspiration', 'asset', 'character_design', 'story', 'quote', 'tutorial', 'behind_scenes', 'interaction', 'promotion', 'news', 'review', 'other'];
      const validItems: Omit<ResourceItem, 'id' | 'createdAt'>[] = [];
      for (const item of result) {
        if (
          typeof item.title === 'string' &&
          typeof item.content === 'string' &&
          validTypes.includes(item.type as ResourceItemType)
        ) {
          validItems.push({
            title: item.title.trim(),
            content: item.content.trim(),
            type: item.type as ResourceItemType
          });
        }
      }

      if (validItems.length === 0) {
        throw new AppError('無法從內容中提取有效素材', 'NO_VALID_ITEMS', false);
      }

      return validItems;
    },
    {
      maxRetries: 3,
      retryDelay: 1000,
      backoff: 'exponential'
    }
  ).catch(error => {
    throw new AppError(
      formatApiError(error) || '內容分析失敗',
      'CONTENT_ANALYSIS_ERROR',
      isRetryableError(error)
    );
  });
}

