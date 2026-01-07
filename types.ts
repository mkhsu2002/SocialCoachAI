
export interface UserProfile {
  fanPageName: string;
  positioning: string;
  destination: string;
  targetAudience: string;
  targetRegion: string; // 目標區域，預設為「台灣」
  additionalNotes: string; // 補充說明：可填寫更多粉專關聯的作品或品牌的描述
  copywriterPersona?: string; // 小編人設提示詞：描述小編的寫作風格、語氣、特色等
}

export type ResourceItemType = 
  | 'inspiration'      // 經營靈感
  | 'asset'            // 發文素材
  | 'character_design'  // 角色設定/圖稿
  | 'story'            // 故事/劇情
  | 'quote'            // 金句/名言
  | 'tutorial'         // 教學/乾貨
  | 'behind_scenes'    // 幕後花絮
  | 'interaction'      // 互動內容
  | 'promotion'        // 推廣/活動
  | 'news'             // 新聞/時事
  | 'review'           // 評價/心得
  | 'other';           // 其他

export const RESOURCE_TYPE_LABELS: Record<ResourceItemType, string> = {
  inspiration: '經營靈感',
  asset: '發文素材',
  character_design: '角色設定/圖稿',
  story: '故事/劇情',
  quote: '金句/名言',
  tutorial: '教學/乾貨',
  behind_scenes: '幕後花絮',
  interaction: '互動內容',
  promotion: '推廣/活動',
  news: '新聞/時事',
  review: '評價/心得',
  other: '其他'
};

export interface ResourceItem {
  id: string;
  type: ResourceItemType;
  title: string;
  content: string;
  createdAt: string;
  isUsed?: boolean; // 是否已使用
  usedAt?: string;  // 使用時間
}

export interface MemoryEntry {
  id: string;
  date: string;
  category: 'insight' | 'milestone' | 'feedback';
  content: string;
}

/**
 * 星期幾的型別定義
 */
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

/**
 * 星期幾的中文對照
 */
export const DAY_OF_WEEK_MAP: Record<DayOfWeek, string> = {
  Monday: '星期一',
  Tuesday: '星期二',
  Wednesday: '星期三',
  Thursday: '星期四',
  Friday: '星期五',
  Saturday: '星期六',
  Sunday: '星期日',
};

/**
 * 星期幾的順序（用於排序）
 */
export const DAY_ORDER: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface DayPlan {
  day: DayOfWeek;
  type: string; // e.g., "新章節預告/金句圖"
  purpose: string; // e.g., "吸引讀者期待"
  priority: 'required' | 'optional'; // required: 首要行程（週一、三、五、日）, optional: 建議備選（週二、四、六）
}

export interface DailyInspiration {
  idea: string;
  hook: string;
  formatSuggestion: string;
}

export interface DailyMission {
  // 舊的結構保留以防報錯，但主要邏輯將轉移到新的靈感生成
  topicSuggestion: string;
  algorithmStrategy: string;
  copywritingTemplate: {
    hook: string;
    body: string;
    cta: string;
  };
  assetReminder?: string;
}

export enum AppState {
  ONBOARDING = 'ONBOARDING',
  SCHEDULE_SETUP = 'SCHEDULE_SETUP', // 新增：課表設定狀態
  DASHBOARD = 'DASHBOARD',
  VAULT = 'VAULT',
  STRATEGY = 'STRATEGY',
  MEMORY = 'MEMORY'
}

/**
 * 粉專類別
 */
export type FanPageCategory = 
  | 'content_creation'  // 內容創作（小說、漫畫、影評、知識分享）
  | 'personal_brand'    // 個人品牌（成長、生活、旅遊、健身）
  | 'business_brand'    // 商業品牌（電商、服務、行銷）
  | 'interest_community' // 興趣社群（動漫、音樂、手作、寵物）
  | 'professional'      // 專業領域（科技、金融、健康、法律）
  | 'other';            // 其他

/**
 * 語氣風格類型
 */
export type PersonaStyle = 
  | 'humor'         // 親切幽默
  | 'professional'  // 專業嚴謹
  | 'casual'        // 輕鬆隨性
  | 'literary'      // 文青風格
  | 'enthusiastic'  // 熱情活潑
  | 'calm';         // 沉穩內斂

/**
 * 小編人設模板
 */
export interface PersonaTemplate {
  id: string;
  name: string; // 模板名稱
  category: FanPageCategory; // 粉專類別
  style: PersonaStyle; // 語氣風格
  description: string; // 模板描述
  template: string; // 模板內容
  tags: string[]; // 標籤
  preview?: string; // 預覽範例（可選）
  suitableFor?: string; // 適用場景說明
}

/**
 * 粉專類別標籤
 */
export const FAN_PAGE_CATEGORY_LABELS: Record<FanPageCategory, string> = {
  content_creation: '內容創作',
  personal_brand: '個人品牌',
  business_brand: '商業品牌',
  interest_community: '興趣社群',
  professional: '專業領域',
  other: '其他'
};

/**
 * 語氣風格標籤
 */
export const PERSONA_STYLE_LABELS: Record<PersonaStyle, string> = {
  humor: '親切幽默',
  professional: '專業嚴謹',
  casual: '輕鬆隨性',
  literary: '文青風格',
  enthusiastic: '熱情活潑',
  calm: '沉穩內斂'
};
