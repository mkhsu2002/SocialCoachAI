
export interface UserProfile {
  fanPageName: string;
  positioning: string;
  destination: string;
  targetAudience: string;
  referenceUrl: string;
}

export interface ResourceItem {
  id: string;
  type: 'inspiration' | 'asset' | 'character_design';
  title: string;
  content: string;
  createdAt: string;
}

export interface MemoryEntry {
  id: string;
  date: string;
  category: 'insight' | 'milestone' | 'feedback';
  content: string;
}

export interface DayPlan {
  day: string; // "Monday", "Tuesday"...
  type: string; // e.g., "新章節預告/金句圖"
  purpose: string; // e.g., "吸引讀者期待"
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
