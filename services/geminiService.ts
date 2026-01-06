
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DailyMission, ResourceItem, MemoryEntry, DayPlan, DailyInspiration } from "../types";
import { apiCache } from "../utils/apiCache";
import { withRetry } from "../utils/retry";
import { AppError, formatApiError, isRetryableError } from "../utils/errorHandler";
import { isDayPlanArray, isDailyInspirationArray, safeJsonParse } from "../utils/typeGuards";

// 建立 AI 實例的函數，接受 API Key 作為參數
function createAIInstance(apiKey: string | null): GoogleGenAI {
  const key = apiKey || process.env.API_KEY || process.env.GEMINI_API_KEY || '';
  if (!key) {
    throw new AppError('Gemini API Key 未設定，請先設定 API Key', 'API_KEY_MISSING', false);
  }
  return new GoogleGenAI({ apiKey: key });
}

// 請求去重機制
const pendingRequests = new Map<string, Promise<unknown>>();

function getCacheKey(prefix: string, params: Record<string, unknown>): string {
  return `${prefix}:${JSON.stringify(params)}`;
}

// 既有的單日任務 Schema (保留相容性)
const MISSION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    topicSuggestion: { type: Type.STRING, description: '今日議題建議' },
    algorithmStrategy: { type: Type.STRING, description: '演算法實戰對策' },
    copywritingTemplate: {
      type: Type.OBJECT,
      properties: {
        hook: { type: Type.STRING, description: '吸睛鉤子 (Hook)' },
        body: { type: Type.STRING, description: '正文大綱' },
        cta: { type: Type.STRING, description: '呼籲行動 (CTA)' }
      },
      required: ['hook', 'body', 'cta']
    },
    assetReminder: { type: Type.STRING, description: '素材提醒' }
  },
  required: ['topicSuggestion', 'algorithmStrategy', 'copywritingTemplate']
};

// 新增：週課表 Schema
const WEEKLY_PLAN_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.STRING, description: '星期幾 (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)' },
      type: { type: Type.STRING, description: '內容類型，需具體且可執行（例如：角色設定公開、連載預告、讀者互動問答、幕後花絮分享等）。內容類型不限於特定分類，可廣泛發想，但需確保多樣性與合理性' },
      purpose: { type: Type.STRING, description: '經營目的，需明確且與整體目標相關（例如：增加互動、建立期待、強化人設、提供價值等）' },
      priority: { 
        type: Type.STRING, 
        description: '優先級：required（首要行程，週一、三、五、日必須包含）或 optional（建議備選，週二、四、六可選）',
        enum: ['required', 'optional']
      }
    },
    required: ['day', 'type', 'purpose', 'priority']
  }
};

// 新增：每日靈感 Schema
const INSPIRATION_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      idea: { type: Type.STRING, description: '靈感概念' },
      hook: { type: Type.STRING, description: '標題/開場白範例' },
      formatSuggestion: { type: Type.STRING, description: '建議呈現形式 (圖文/Reels/限動)' }
    },
    required: ['idea', 'hook', 'formatSuggestion']
  }
};

function getMemoryContext(memories: MemoryEntry[]): string {
  if (memories.length === 0) return "尚無長期記憶紀錄。";
  return `長期記憶紀錄（教練觀察）：\n${memories.slice(-10).map(m => `- [${m.date}] ${m.content}`).join('\n')}`;
}

// 產生一週課表
export async function generateWeeklyPlan(profile: UserProfile, apiKey: string | null): Promise<DayPlan[]> {
  const cacheKey = getCacheKey('weeklyPlan', { 
    positioning: profile.positioning,
    targetAudience: profile.targetAudience,
    destination: profile.destination
  });

  // 檢查快取
  const cached = apiCache.get<DayPlan[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // 檢查是否有進行中的請求
  const pendingRequest = pendingRequests.get(cacheKey);
  if (pendingRequest) {
    return pendingRequest as Promise<DayPlan[]>;
  }

  const requestPromise = withRetry(
    async () => {
      const ai = createAIInstance(apiKey);
      const systemInstruction = `你是一位深耕${profile.targetRegion}市場的專業社群經營教練，擁有豐富的實戰經驗。

【用戶資料】
- 粉專名稱：${profile.fanPageName}
- 內容定位：${profile.positioning}
- 目標受眾：${profile.targetAudience}
- 經營目的：${profile.destination}
- 目標區域：${profile.targetRegion}
${profile.additionalNotes ? `- 補充說明：${profile.additionalNotes}` : ''}

【任務目標】
請為用戶規劃一份「一週內容排程表」，包含每天的「內容類型」、「目的」與「優先級」。

【重要原則】
1. **內容類型設計**：
   - 不限定於特定分類（如互動型、價值型、人設型），可廣泛發想各種創意內容類型
   - 內容類型需具體且可執行，避免過於抽象
   - 確保內容類型多樣化，避免重複或相似
   - 內容類型需符合用戶的定位與目標受眾
   - 考慮${profile.targetRegion}市場的特色與文化

2. **發文頻率與優先級**：
   - **首要行程（required）**：週一、週三、週五、週日必須包含，這些是核心發文日
   - **建議備選（optional）**：週二、週四、週六可選，視情況安排
   - 不一定要每天都有行程，但首要行程必須完整
   - 優先級為 optional 的行程，應提供有價值但非必要的內容

3. **內容多樣性與合理性**：
   - 確保一週內的內容類型不重複
   - 內容需符合用戶的定位與目標受眾
   - 考慮內容之間的邏輯關聯性
   - 確保內容目的明確且與經營目標一致

4. **${profile.targetRegion}市場特色**：
   - 考慮當地文化、語言習慣、節慶活動
   - 了解當地社群的互動模式與偏好
   - 參考當地成功的社群經營案例`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `請根據我的用戶資料，為我生成一份完整的一週社群經營課表。

要求：
1. 內容類型需廣泛發想，不限定於特定分類，但要確保多樣性與合理性
2. 週一、週三、週五、週日為首要行程（priority: required），必須包含
3. 週二、週四、週六為建議備選（priority: optional），可視情況安排
4. 每個內容類型需具體且可執行
5. 每個內容需有明確的經營目的
6. 考慮${profile.targetRegion}市場的特色與文化
7. ${profile.additionalNotes ? `請特別參考補充說明中的資訊：${profile.additionalNotes}` : ''}

請確保課表符合我的定位「${profile.positioning}」與目標受眾「${profile.targetAudience}」，並有助於達成經營目的「${profile.destination}」。`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: WEEKLY_PLAN_SCHEMA
        }
      });

      const result = safeJsonParse<DayPlan[]>(response.text || '[]', []);
      
      // 驗證結果型別
      if (!isDayPlanArray(result)) {
        throw new AppError('API 回應格式錯誤', 'INVALID_RESPONSE', false);
      }

      // 儲存到快取（1小時）
      apiCache.set(cacheKey, result, 60 * 60 * 1000);
      
      return result;
    },
    {
      maxRetries: 3,
      retryDelay: 1000,
      backoff: 'exponential',
      onRetry: (attempt, error) => {
        if (!isRetryableError(error)) {
          throw error;
        }
      }
    }
  ).catch(error => {
    throw new AppError(formatApiError(error), 'WEEKLY_PLAN_ERROR', isRetryableError(error));
  }).finally(() => {
    pendingRequests.delete(cacheKey);
  });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

// 根據當日課表產生 3 個靈感
export async function generateDailyInspirations(
  profile: UserProfile,
  dayPlan: DayPlan,
  memories: MemoryEntry[],
  apiKey: string | null,
  forceRefresh: boolean = false
): Promise<DailyInspiration[]> {
  const cacheKey = getCacheKey('dailyInspirations', {
    day: dayPlan.day,
    type: dayPlan.type,
    purpose: dayPlan.purpose,
    positioning: profile.positioning,
    memoryCount: memories.length
  });

  // 如果強制刷新，先清除快取
  if (forceRefresh) {
    apiCache.clear(cacheKey);
    pendingRequests.delete(cacheKey);
  }

  // 檢查快取（30分鐘）
  const cached = apiCache.get<DailyInspiration[]>(cacheKey);
  if (cached && !forceRefresh) {
    return cached;
  }

  // 檢查是否有進行中的請求
  const pendingRequest = pendingRequests.get(cacheKey);
  if (pendingRequest) {
    return pendingRequest as Promise<DailyInspiration[]>;
  }

  const requestPromise = withRetry(
    async () => {
      const ai = createAIInstance(apiKey);
      const memoryContext = getMemoryContext(memories);
      
      const systemInstruction = `你是一位社群小編靈感助手。
今天是 ${dayPlan.day}。
根據用戶的每週課表，今天的內容類型是：「${dayPlan.type}」，目的是：「${dayPlan.purpose}」。
用戶定位：${profile.positioning}。
${memoryContext}

請提供 3 個具體、有創意的發文靈感，讓用戶可以擇一執行。`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "請給我 3 個今天的發文靈感。",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: INSPIRATION_SCHEMA
        }
      });

      const result = safeJsonParse<DailyInspiration[]>(response.text || '[]', []);
      
      // 驗證結果型別
      if (!isDailyInspirationArray(result)) {
        throw new AppError('API 回應格式錯誤', 'INVALID_RESPONSE', false);
      }

      // 儲存到快取（30分鐘）
      apiCache.set(cacheKey, result, 30 * 60 * 1000);
      
      return result;
    },
    {
      maxRetries: 3,
      retryDelay: 1000,
      backoff: 'exponential',
      onRetry: (attempt, error) => {
        if (!isRetryableError(error)) {
          throw error;
        }
      }
    }
  ).catch(error => {
    throw new AppError(formatApiError(error), 'INSPIRATION_ERROR', isRetryableError(error));
  }).finally(() => {
    pendingRequests.delete(cacheKey);
  });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

// 保留既有函數以相容 DashboardView 的舊邏輯 (或是稍後我們更新 DashboardView)
export async function generateDailyMission(
  profile: UserProfile, 
  vault: ResourceItem[],
  memories: MemoryEntry[],
  apiKey: string | null
): Promise<DailyMission> {
  const ai = createAIInstance(apiKey);
  // ... (舊代碼保持不變，作為 fallback 或特定詳細生成用途)
  // 為了節省空間，這裡省略重複代碼，實際應用中應保留
   const vaultContext = vault.length > 0 
    ? `目前的素材庫內容：\n${vault.map(v => `- [${v.type}] ${v.title}: ${v.content}`).join('\n')}`
    : "素材庫目前為空。";

  const memoryContext = getMemoryContext(memories);

  const systemInstruction = `你是一位專業的繁體中文社群經營陪跑教練。
你的受眾是擁有 1,000 粉絲、正尋求突破的新手經營者。
用戶定位：${profile.positioning}、目的地：${profile.destination}。
${vaultContext}
${memoryContext}
請注意繁體中文市場（台灣/港澳）的語氣、Emoji 使用習慣，並避開 FB/IG 演算法降權地雷。`;

  const prompt = `請為我生成今天的「每日任務」。若有適合的素材請在 assetReminder 提醒。`;

  return withRetry(
    async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: MISSION_SCHEMA
        }
      });

      return safeJsonParse<DailyMission>(response.text || '{}', {
        topicSuggestion: '',
        algorithmStrategy: '',
        copywritingTemplate: { hook: '', body: '', cta: '' }
      });
    },
    {
      maxRetries: 3,
      retryDelay: 1000,
      backoff: 'exponential'
    }
  ).catch(error => {
    throw new AppError(formatApiError(error), 'MISSION_ERROR', isRetryableError(error));
  });
}

export async function getGeneralCoaching(
  profile: UserProfile, 
  message: string,
  memories: MemoryEntry[],
  apiKey: string | null
): Promise<string> {
  const ai = createAIInstance(apiKey);
  const memoryContext = getMemoryContext(memories);
  
  const systemInstruction = `你是一位深耕${profile.targetRegion}市場的親切、專業且具備實戰感的 1對1 社群經營陪跑教練。

【用戶資料】
- 粉專名稱：${profile.fanPageName}
- 內容定位：${profile.positioning}
- 目標受眾：${profile.targetAudience}
- 經營目的：${profile.destination}
- 目標區域：${profile.targetRegion}
${profile.additionalNotes ? `- 補充說明：${profile.additionalNotes}` : ''}

【長期記憶】
${memoryContext}

【對話原則】
1. 使用繁體中文，語氣親切、專業且積極
2. 根據用戶的定位「${profile.positioning}」與目標受眾「${profile.targetAudience}」提供客製化建議
3. 考慮${profile.targetRegion}市場的特色、文化與經營習慣
4. 提供具體、可執行的建議，避免空泛的理論
5. 如果對話中包含值得紀錄為長期記憶的關鍵點（如新的目標、克服的困難、重要洞察），請在回覆中給予鼓勵並主動詢問是否要將其存入成長筆記
6. 結合用戶的經營目的「${profile.destination}」，提供有助於達成目標的建議
${profile.additionalNotes ? `7. 參考補充說明中的資訊，更深入了解用戶的內容風格與品牌特色` : ''}

請以專業但親切的語氣回應，就像一位經驗豐富的陪跑教練，陪伴用戶一起成長。`;

  return withRetry(
    async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: message,
        config: { systemInstruction }
      });
      return response.text || "抱歉，我現在無法回覆。";
    },
    {
      maxRetries: 2,
      retryDelay: 1000,
      backoff: 'exponential'
    }
  ).catch(error => {
    const errorMessage = formatApiError(error);
    throw new AppError(errorMessage, 'COACHING_ERROR', isRetryableError(error));
  });
}
