/**
 * 衍生素材服務
 * 從現有素材衍生出不同類型的素材變體
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
 * 從現有素材衍生出多個不同類型的素材變體
 */
export async function deriveResourcesFromItem(
  sourceItem: ResourceItem,
  apiKey: string | null,
  targetTypes?: ResourceItemType[]
): Promise<Omit<ResourceItem, 'id' | 'createdAt'>[]> {
  const ai = createAIInstance(apiKey);

  // 如果沒有指定目標類型，則生成多種不同類型的變體（選擇 3-5 個最相關的類型）
  const allTypes: ResourceItemType[] = [
    'inspiration', 'asset', 'story', 'quote', 'tutorial', 
    'behind_scenes', 'interaction', 'promotion', 'news', 'review'
  ];
  const availableTypes = allTypes.filter(type => type !== sourceItem.type) as ResourceItemType[];
  
  // 根據原始類型選擇最相關的衍生類型
  const typeMapping: Record<ResourceItemType, ResourceItemType[]> = {
    inspiration: ['asset', 'story', 'quote', 'tutorial', 'interaction'],
    asset: ['inspiration', 'story', 'quote', 'promotion', 'interaction'],
    character_design: ['story', 'behind_scenes', 'asset', 'inspiration', 'interaction'],
    story: ['quote', 'asset', 'inspiration', 'behind_scenes', 'review'],
    quote: ['story', 'inspiration', 'asset', 'tutorial', 'interaction'],
    tutorial: ['asset', 'inspiration', 'story', 'interaction', 'review'],
    behind_scenes: ['story', 'asset', 'inspiration', 'interaction', 'news'],
    interaction: ['asset', 'inspiration', 'story', 'promotion', 'quote'],
    promotion: ['asset', 'inspiration', 'interaction', 'news', 'story'],
    news: ['asset', 'inspiration', 'story', 'interaction', 'review'],
    review: ['asset', 'inspiration', 'story', 'tutorial', 'interaction'],
    other: ['asset', 'inspiration', 'story', 'quote', 'tutorial']
  };
  
  const suggestedTypes = typeMapping[sourceItem.type] || availableTypes;
  const typesToGenerate = targetTypes || suggestedTypes.slice(0, 5); // 最多生成 5 個變體

  const systemInstruction = `你是一位專業的社群經營內容創意總監。請根據用戶提供的原始素材，衍生出多個不同類型的素材變體。

原始素材資訊：
- 標題：${sourceItem.title}
- 內容：${sourceItem.content}
- 類型：${RESOURCE_TYPE_LABELS[sourceItem.type]}

任務：
請將這個素材轉換成 ${typesToGenerate.length} 個不同類型的素材變體，每個變體應該：
1. 保持原始素材的核心概念和價值
2. 根據目標類型調整呈現方式和內容重點
3. 標題要具體且符合目標類型的特色
4. 內容要完整且可獨立使用
5. 每個變體都應該有不同的創意角度和呈現方式

類型說明：
${typesToGenerate.map(type => `- ${RESOURCE_TYPE_LABELS[type]}: ${getTypeDescription(type)}`).join('\n')}

衍生原則：
- 如果原始素材是故事，可以衍生出：金句、教學、評價等
- 如果原始素材是教學，可以衍生出：故事、互動、推廣等
- 如果原始素材是金句，可以衍生出：故事、教學、評價等
- 每個變體都應該有獨特的價值和用途
- 保持原素材的核心精神，但用不同方式呈現

請以 JSON 陣列格式回覆，每個項目包含 title、content、type 三個欄位。`;

  const prompt = `請根據以下原始素材，衍生出 ${typesToGenerate.length} 個不同類型的素材變體：

原始素材：
標題：${sourceItem.title}
內容：${sourceItem.content}
類型：${RESOURCE_TYPE_LABELS[sourceItem.type]}

目標類型：${typesToGenerate.map(type => RESOURCE_TYPE_LABELS[type]).join('、')}

請為每個目標類型生成一個素材變體，確保每個變體都有獨特的創意角度和呈現方式。`;

  const DERIVE_SCHEMA = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: '衍生素材標題' },
        content: { type: Type.STRING, description: '衍生素材內容描述' },
        type: { 
          type: Type.STRING, 
          description: '素材類型',
          enum: typesToGenerate
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
          responseSchema: DERIVE_SCHEMA
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
      const validItems: Omit<ResourceItem, 'id' | 'createdAt'>[] = [];
      for (const item of result) {
        if (
          typeof item.title === 'string' &&
          typeof item.content === 'string' &&
          typesToGenerate.includes(item.type as ResourceItemType)
        ) {
          validItems.push({
            title: item.title.trim(),
            content: item.content.trim(),
            type: item.type as ResourceItemType
          });
        }
      }

      if (validItems.length === 0) {
        throw new AppError('無法從素材中衍生有效變體', 'NO_VALID_ITEMS', false);
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
      formatApiError(error) || '衍生素材失敗',
      'DERIVE_RESOURCE_ERROR',
      isRetryableError(error)
    );
  });
}

/**
 * 取得類型描述
 */
function getTypeDescription(type: ResourceItemType): string {
  const descriptions: Record<ResourceItemType, string> = {
    inspiration: '經營策略、靈感想法、內容規劃',
    asset: '具體的發文素材、文案、圖片描述',
    character_design: '角色設定、人物描述、世界觀設定',
    story: '故事內容、劇情發展、情節設計',
    quote: '勵志語錄、經典名言、金句',
    tutorial: '教學內容、知識分享、實用技巧',
    behind_scenes: '製作過程、幕後故事、日常分享',
    interaction: '問答、投票、討論話題',
    promotion: '促銷活動、推廣內容、行銷活動',
    news: '時事新聞、行業動態、熱點話題',
    review: '產品評價、使用心得、體驗分享',
    other: '其他類型的內容'
  };
  return descriptions[type];
}

