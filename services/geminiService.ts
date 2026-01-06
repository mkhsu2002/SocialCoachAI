
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DailyMission, ResourceItem, MemoryEntry, DayPlan, DailyInspiration } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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
      day: { type: Type.STRING, description: '星期幾 (Monday, Tuesday...)' },
      type: { type: Type.STRING, description: '內容類型 (例如：角色設定公開)' },
      purpose: { type: Type.STRING, description: '目的 (例如：增加互動)' }
    },
    required: ['day', 'type', 'purpose']
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
export async function generateWeeklyPlan(profile: UserProfile): Promise<DayPlan[]> {
  const systemInstruction = `你是一位專業的社群經營教練。請根據用戶資料，規劃「一週內容排程表」。
用戶定位：${profile.positioning}
目標受眾：${profile.targetAudience}
經營目的：${profile.destination}

請規劃週一到週日每天的「內容類型」與「目的」。
策略須包含：
1. 互動型內容（投票、問答）
2. 價值型內容（教學、乾貨、連載更新）
3. 人設型內容（幕後、生活感）
請確保內容類型多樣化，不要每天都一樣。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "請為我生成一週社群經營課表。",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: WEEKLY_PLAN_SCHEMA
      }
    });
    return JSON.parse(response.text || '[]') as DayPlan[];
  } catch (error) {
    console.error("Error generating weekly plan:", error);
    throw error;
  }
}

// 根據當日課表產生 3 個靈感
export async function generateDailyInspirations(
  profile: UserProfile,
  dayPlan: DayPlan,
  memories: MemoryEntry[]
): Promise<DailyInspiration[]> {
  const memoryContext = getMemoryContext(memories);
  
  const systemInstruction = `你是一位社群小編靈感助手。
今天是 ${dayPlan.day}。
根據用戶的每週課表，今天的內容類型是：「${dayPlan.type}」，目的是：「${dayPlan.purpose}」。
用戶定位：${profile.positioning}。
${memoryContext}

請提供 3 個具體、有創意的發文靈感，讓用戶可以擇一執行。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "請給我 3 個今天的發文靈感。",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: INSPIRATION_SCHEMA
      }
    });
    return JSON.parse(response.text || '[]') as DailyInspiration[];
  } catch (error) {
    console.error("Error generating inspirations:", error);
    throw error;
  }
}

// 保留既有函數以相容 DashboardView 的舊邏輯 (或是稍後我們更新 DashboardView)
export async function generateDailyMission(
  profile: UserProfile, 
  vault: ResourceItem[],
  memories: MemoryEntry[]
): Promise<DailyMission> {
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: MISSION_SCHEMA
      }
    });

    return JSON.parse(response.text || '{}') as DailyMission;
  } catch (error) {
    throw error;
  }
}

export async function getGeneralCoaching(
  profile: UserProfile, 
  message: string,
  memories: MemoryEntry[]
): Promise<string> {
  // ... (保持不變)
    const memoryContext = getMemoryContext(memories);
  const systemInstruction = `你是一位親切、專業且具備實戰感的 1對1 社群經營陪跑教練。
用戶定位：${profile.positioning}
${memoryContext}
請使用繁體中文，語氣積極。如果對話中包含值得紀錄為長期記憶的關鍵點（如新的目標、克服的困難），請在回覆中給予鼓勵並主動詢問是否要將其存入成長筆記。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: { systemInstruction }
    });
    return response.text || "抱歉，我現在無法回覆。";
  } catch (error) {
    console.error("Error in coaching chat:", error);
    return "連線發生錯誤。";
  }
}
