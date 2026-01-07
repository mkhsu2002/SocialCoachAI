# 🎯 功能技術可行性評估報告

本文件評估四個新功能的技術可行性、實施難度、所需資源與風險分析。

---

## 📋 功能清單

1. ✅ **建立不同粉專屬性的小編提示詞模板供選擇參考**
2. 🔄 **同時管理多個粉專，可在不同粉專之間切換**
3. 🔗 **串連 Meta 實現一鍵貼文**
4. 🤖 **定時自動化排程，實現 AI 全自動社群內容經營**

---

## 1️⃣ 小編提示詞模板系統

### 📊 可行性評級：🟢 **高可行性**

### 技術難度：⭐ (1/5) - 低

### 現有基礎
- ✅ `UserProfile.copywriterPersona` 欄位已存在
- ✅ 已有 UI 輸入介面（`OnboardingView`）
- ✅ 已有資料儲存機制（`profileStorage`）

### 實施方案

#### 方案 A：靜態模板庫（推薦）

**優點：**
- 實施簡單快速
- 無需額外儲存空間
- 可以預先設計優質模板

**實作步驟：**

1. **建立模板資料結構**

```typescript
// types.ts (新增)
export interface PersonaTemplate {
  id: string;
  name: string; // 模板名稱，如「親切幽默型」
  category: PersonaCategory; // 分類
  description: string; // 模板描述
  template: string; // 模板內容
  tags: string[]; // 標籤，如 ['幽默', '親切', '互動']
  preview?: string; // 預覽範例
}

export type PersonaCategory = 
  | 'humor'        // 幽默風趣
  | 'professional' // 專業嚴謹
  | 'casual'       // 輕鬆隨性
  | 'literary'     // 文青風格
  | 'enthusiastic' // 熱情活潑
  | 'calm'         // 沉穩內斂
  | 'custom';      // 自訂

export const PERSONA_TEMPLATES: PersonaTemplate[] = [
  {
    id: 'humor-001',
    name: '親切幽默型',
    category: 'humor',
    description: '適合輕鬆、互動性強的粉專',
    template: `【角色設定】你是一位親切幽默的社群小編。

【語氣與風格指南】
- 使用輕鬆、親切的語氣
- 適度使用 Emoji 增加親和力（如：😊、✨、💡）
- 喜歡用問句與讀者互動
- 偶爾分享個人小故事或趣事
- 結尾常用問句或 CTA 引導互動

【風格示範】
「今天想跟大家分享一個小故事... 😊
你也有類似的經驗嗎？留言告訴我吧！💬」`,
    tags: ['幽默', '親切', '互動'],
    preview: '語氣輕鬆幽默，善用 Emoji 和問句與讀者互動...'
  },
  {
    id: 'professional-001',
    name: '專業嚴謹型',
    category: 'professional',
    description: '適合知識型、教育類粉專',
    template: `【角色設定】你是一位專業、嚴謹的內容創作者。

【語氣與風格指南】
- 使用專業、清晰的語氣
- 注重邏輯性和結構性
- 提供有價值的資訊和洞察
- 適度使用數據和案例佐證
- 結尾提供明確的行動建議

【風格示範】
「根據最新研究顯示...
建議你可以嘗試以下方法：
1. ...
2. ...
3. ...」`,
    tags: ['專業', '嚴謹', '知識型'],
    preview: '語氣專業嚴謹，注重邏輯性和資訊價值...'
  },
  // ... 更多模板
];
```

2. **建立模板選擇組件**

```typescript
// components/PersonaTemplateSelector.tsx
import React, { useState } from 'react';
import { PersonaTemplate, PersonaCategory } from '../types';

interface PersonaTemplateSelectorProps {
  onSelect: (template: string) => void;
  currentValue?: string;
}

export const PersonaTemplateSelector: React.FC<PersonaTemplateSelectorProps> = ({
  onSelect,
  currentValue
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PersonaCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PersonaTemplate | null>(null);
  
  const filteredTemplates = selectedCategory === 'all'
    ? PERSONA_TEMPLATES
    : PERSONA_TEMPLATES.filter(t => t.category === selectedCategory);
  
  const handleSelect = (template: PersonaTemplate) => {
    setSelectedTemplate(template);
    onSelect(template.template);
  };
  
  return (
    <div className="space-y-4">
      {/* 分類篩選 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-lg text-sm ${
            selectedCategory === 'all' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          全部
        </button>
        {/* 其他分類按鈕 */}
      </div>
      
      {/* 模板列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            onClick={() => handleSelect(template)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <h3 className="font-semibold text-slate-900">{template.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{template.description}</p>
            <div className="flex gap-1 mt-2">
              {template.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* 預覽 */}
      {selectedTemplate && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold mb-2">模板預覽：</h4>
          <pre className="text-sm whitespace-pre-wrap text-slate-700">
            {selectedTemplate.template}
          </pre>
          {selectedTemplate.preview && (
            <div className="mt-2 text-xs text-slate-500">
              {selectedTemplate.preview}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

3. **整合到 OnboardingView**

```typescript
// views/OnboardingView.tsx (修改)
import { PersonaTemplateSelector } from '../components/PersonaTemplateSelector';

const OnboardingView: React.FC<OnboardingViewProps> = ({ onSave, initialProfile }) => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  return (
    <div>
      {/* ... 其他欄位 ... */}
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          7. 小編人設提示詞 <span className="text-xs text-slate-500 font-normal">(選填)</span>
        </label>
        
        {/* 模板選擇按鈕 */}
        <button
          type="button"
          onClick={() => setShowTemplateSelector(!showTemplateSelector)}
          className="mb-2 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <i className="fa-solid fa-magic mr-1"></i>
          從模板選擇
        </button>
        
        {/* 模板選擇器 */}
        {showTemplateSelector && (
          <div className="mb-4 p-4 border border-slate-200 rounded-lg">
            <PersonaTemplateSelector
              onSelect={(template) => {
                setProfile({ ...profile, copywriterPersona: template });
                setShowTemplateSelector(false);
              }}
              currentValue={profile.copywriterPersona}
            />
          </div>
        )}
        
        <textarea
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32"
          placeholder="描述你的小編寫作風格、語氣、特色等..."
          value={profile.copywriterPersona || ''}
          onChange={(e) => setProfile({ ...profile, copywriterPersona: e.target.value })}
        />
      </div>
    </div>
  );
};
```

#### 方案 B：動態模板庫（進階）

**優點：**
- 可以從後端載入模板
- 支援用戶自訂模板
- 可以根據使用數據優化模板

**缺點：**
- 需要後端 API
- 實施複雜度較高

### 所需資源

- **開發時間**：1-2 天
- **設計時間**：0.5 天（設計模板內容）
- **測試時間**：0.5 天
- **總計**：2-3 天

### 風險評估

- **技術風險**：🟢 極低
- **用戶接受度**：🟢 高（降低使用門檻）
- **維護成本**：🟢 低

### 建議

✅ **強烈建議實施** - 實施簡單、效益高，可以大幅降低用戶使用門檻。

---

## 2️⃣ 多粉專管理系統

### 📊 可行性評級：🟡 **中等可行性**

### 技術難度：⭐⭐⭐ (3/5) - 中高

### 現有基礎
- ⚠️ 目前只支援單一 Profile
- ✅ 已有完整的資料結構
- ✅ 已有 Context 管理機制

### 實施方案

#### 架構設計

**核心概念：多租戶架構（Multi-tenancy）**

每個粉專是一個獨立的「租戶」，擁有自己的：
- Profile
- Vault
- Memories
- Schedule
- Daily Inspirations

#### 資料結構變更

```typescript
// types.ts (新增/修改)

// 粉專 ID 類型
export type FanPageId = string;

// 粉專基本資訊（用於列表顯示）
export interface FanPageSummary {
  id: FanPageId;
  name: string;
  positioning: string;
  avatar?: string; // 頭像 URL（可選）
  lastActiveAt: string; // 最後使用時間
  createdAt: string;
}

// 粉專完整資料
export interface FanPageData {
  id: FanPageId;
  profile: UserProfile;
  vault: ResourceItem[];
  memories: MemoryEntry[];
  schedule: DayPlan[];
  // 其他資料...
}

// 應用程式狀態（修改）
export interface AppState {
  currentFanPageId: FanPageId | null;
  fanPageList: FanPageSummary[];
  // 當前粉專的資料（延遲載入）
  currentFanPageData: FanPageData | null;
}
```

#### 儲存層重構

```typescript
// utils/storageService.ts (重構)

// 舊的儲存方式（單一 Profile）
const STORAGE_KEYS = {
  PROFILE: 'social_coach_profile',
  VAULT: 'social_coach_vault',
  // ...
};

// 新的儲存方式（多粉專）
const MULTI_FANPAGE_STORAGE_KEYS = {
  FANPAGE_LIST: 'social_coach_fanpage_list',
  CURRENT_FANPAGE_ID: 'social_coach_current_fanpage_id',
  FANPAGE_DATA_PREFIX: 'social_coach_fanpage_', // + fanPageId
};

export const multiFanPageStorage = {
  // 取得所有粉專列表
  getFanPageList(): FanPageSummary[] {
    const data = safeGetItem(MULTI_FANPAGE_STORAGE_KEYS.FANPAGE_LIST);
    return data ? safeJsonParse<FanPageSummary[]>(data, []) : [];
  },
  
  // 儲存粉專列表
  setFanPageList(list: FanPageSummary[]): void {
    safeSetItem(MULTI_FANPAGE_STORAGE_KEYS.FANPAGE_LIST, JSON.stringify(list));
  },
  
  // 取得當前粉專 ID
  getCurrentFanPageId(): FanPageId | null {
    return safeGetItem(MULTI_FANPAGE_STORAGE_KEYS.CURRENT_FANPAGE_ID) || null;
  },
  
  // 設定當前粉專 ID
  setCurrentFanPageId(id: FanPageId): void {
    safeSetItem(MULTI_FANPAGE_STORAGE_KEYS.CURRENT_FANPAGE_ID, id);
  },
  
  // 取得特定粉專的完整資料
  getFanPageData(fanPageId: FanPageId): FanPageData | null {
    const key = `${MULTI_FANPAGE_STORAGE_KEYS.FANPAGE_DATA_PREFIX}${fanPageId}`;
    const data = safeGetItem(key);
    return data ? safeJsonParse<FanPageData>(data, null) : null;
  },
  
  // 儲存特定粉專的完整資料
  setFanPageData(fanPageId: FanPageId, data: FanPageData): void {
    const key = `${MULTI_FANPAGE_STORAGE_KEYS.FANPAGE_DATA_PREFIX}${fanPageId}`;
    safeSetItem(key, JSON.stringify(data));
  },
  
  // 刪除粉專資料
  deleteFanPageData(fanPageId: FanPageId): void {
    const key = `${MULTI_FANPAGE_STORAGE_KEYS.FANPAGE_DATA_PREFIX}${fanPageId}`;
    safeRemoveItem(key);
  },
  
  // 遷移舊資料（向後相容）
  migrateOldData(): FanPageId | null {
    const oldProfile = profileStorage.get();
    if (!oldProfile) return null;
    
    // 建立新粉專
    const fanPageId = generateId();
    const fanPageData: FanPageData = {
      id: fanPageId,
      profile: oldProfile,
      vault: vaultStorage.get(),
      memories: memoriesStorage.get(),
      schedule: scheduleStorage.get(),
    };
    
    // 儲存新資料
    this.setFanPageData(fanPageId, fanPageData);
    this.setCurrentFanPageId(fanPageId);
    
    // 更新列表
    const list: FanPageSummary[] = [{
      id: fanPageId,
      name: oldProfile.fanPageName,
      positioning: oldProfile.positioning,
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }];
    this.setFanPageList(list);
    
    // 清除舊資料（可選）
    // profileStorage.remove();
    // vaultStorage.remove();
    // ...
    
    return fanPageId;
  }
};
```

#### Context 重構

```typescript
// contexts/AppDataContext.tsx (重構)

interface AppDataContextType {
  // 多粉專管理
  currentFanPageId: FanPageId | null;
  fanPageList: FanPageSummary[];
  switchFanPage: (fanPageId: FanPageId) => void;
  createFanPage: (profile: UserProfile) => FanPageId;
  deleteFanPage: (fanPageId: FanPageId) => void;
  
  // 當前粉專的資料（保持向後相容的 API）
  profile: UserProfile | null;
  vault: ResourceItem[];
  memories: MemoryEntry[];
  schedule: DayPlan[];
  
  // 操作方法（保持不變）
  setProfile: (profile: UserProfile) => void;
  addVaultItem: (item: Omit<ResourceItem, 'id' | 'createdAt'>) => void;
  // ...
}

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentFanPageId, setCurrentFanPageId] = useState<FanPageId | null>(null);
  const [fanPageList, setFanPageList] = useState<FanPageSummary[]>([]);
  const [currentFanPageData, setCurrentFanPageData] = useState<FanPageData | null>(null);
  
  // 載入粉專列表
  useEffect(() => {
    const list = multiFanPageStorage.getFanPageList();
    setFanPageList(list);
    
    // 如果沒有粉專，嘗試遷移舊資料
    if (list.length === 0) {
      const migratedId = multiFanPageStorage.migrateOldData();
      if (migratedId) {
        setCurrentFanPageId(migratedId);
        loadFanPageData(migratedId);
      }
    } else {
      // 載入最後使用的粉專
      const lastId = multiFanPageStorage.getCurrentFanPageId();
      if (lastId && list.find(f => f.id === lastId)) {
        setCurrentFanPageId(lastId);
        loadFanPageData(lastId);
      } else {
        // 載入第一個粉專
        setCurrentFanPageId(list[0].id);
        loadFanPageData(list[0].id);
      }
    }
  }, []);
  
  // 載入粉專資料
  const loadFanPageData = useCallback((fanPageId: FanPageId) => {
    const data = multiFanPageStorage.getFanPageData(fanPageId);
    if (data) {
      setCurrentFanPageData(data);
      multiFanPageStorage.setCurrentFanPageId(fanPageId);
      
      // 更新列表中的最後使用時間
      setFanPageList(prev => prev.map(f => 
        f.id === fanPageId 
          ? { ...f, lastActiveAt: new Date().toISOString() }
          : f
      ));
    }
  }, []);
  
  // 切換粉專
  const switchFanPage = useCallback((fanPageId: FanPageId) => {
    setCurrentFanPageId(fanPageId);
    loadFanPageData(fanPageId);
  }, [loadFanPageData]);
  
  // 建立新粉專
  const createFanPage = useCallback((profile: UserProfile): FanPageId => {
    const fanPageId = generateId();
    const fanPageData: FanPageData = {
      id: fanPageId,
      profile,
      vault: [],
      memories: [],
      schedule: [],
    };
    
    multiFanPageStorage.setFanPageData(fanPageId, fanPageData);
    
    const summary: FanPageSummary = {
      id: fanPageId,
      name: profile.fanPageName,
      positioning: profile.positioning,
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    setFanPageList(prev => [...prev, summary]);
    multiFanPageStorage.setFanPageList([...fanPageList, summary]);
    
    switchFanPage(fanPageId);
    return fanPageId;
  }, [fanPageList, switchFanPage]);
  
  // 刪除粉專
  const deleteFanPage = useCallback((fanPageId: FanPageId) => {
    multiFanPageStorage.deleteFanPageData(fanPageId);
    setFanPageList(prev => prev.filter(f => f.id !== fanPageId));
    
    // 如果刪除的是當前粉專，切換到其他粉專
    if (currentFanPageId === fanPageId) {
      const remaining = fanPageList.filter(f => f.id !== fanPageId);
      if (remaining.length > 0) {
        switchFanPage(remaining[0].id);
      } else {
        setCurrentFanPageId(null);
        setCurrentFanPageData(null);
      }
    }
  }, [currentFanPageId, fanPageList, switchFanPage]);
  
  // 儲存當前粉專資料（每次操作後自動儲存）
  useEffect(() => {
    if (currentFanPageId && currentFanPageData) {
      multiFanPageStorage.setFanPageData(currentFanPageId, currentFanPageData);
    }
  }, [currentFanPageId, currentFanPageData]);
  
  // 向後相容的 API（從 currentFanPageData 取得）
  const profile = currentFanPageData?.profile || null;
  const vault = currentFanPageData?.vault || [];
  const memories = currentFanPageData?.memories || [];
  const schedule = currentFanPageData?.schedule || [];
  
  // ... 其他操作方法（修改為更新 currentFanPageData）
  
  return (
    <AppDataContext.Provider value={{
      currentFanPageId,
      fanPageList,
      switchFanPage,
      createFanPage,
      deleteFanPage,
      profile,
      vault,
      memories,
      schedule,
      // ... 其他方法
    }}>
      {children}
    </AppDataContext.Provider>
  );
};
```

#### UI 組件

```typescript
// components/FanPageSwitcher.tsx
import React from 'react';
import { useAppData } from '../contexts/AppDataContext';

export const FanPageSwitcher: React.FC = () => {
  const { currentFanPageId, fanPageList, switchFanPage } = useAppData();
  
  return (
    <div className="relative">
      <select
        value={currentFanPageId || ''}
        onChange={(e) => switchFanPage(e.target.value)}
        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      >
        {fanPageList.map(fanPage => (
          <option key={fanPage.id} value={fanPage.id}>
            {fanPage.name}
          </option>
        ))}
      </select>
      
      {/* 新增粉專按鈕 */}
      <button
        onClick={() => {/* 導航到新增粉專頁面 */}}
        className="ml-2 px-3 py-2 bg-indigo-600 text-white rounded-lg"
      >
        <i className="fa-solid fa-plus"></i> 新增粉專
      </button>
    </div>
  );
};
```

### 所需資源

- **開發時間**：5-7 天
  - 資料結構設計：1 天
  - 儲存層重構：1-2 天
  - Context 重構：2-3 天
  - UI 組件開發：1 天
  - 測試與除錯：1 天
- **設計時間**：1 天（UI/UX 設計）
- **測試時間**：2 天
- **總計**：8-10 天

### 風險評估

- **技術風險**：🟡 中等
  - 需要重構現有架構
  - 需要處理資料遷移
  - 需要確保向後相容
- **資料風險**：🟡 中等
  - localStorage 容量限制（每個瀏覽器約 5-10MB）
  - 需要考慮資料備份與還原
- **用戶體驗風險**：🟢 低
  - 功能明確，用戶容易理解

### 限制與考量

1. **localStorage 容量限制**
   - 每個粉專約佔用 100KB-1MB（取決於資料量）
   - 建議限制最多 10-20 個粉專
   - 或考慮使用 IndexedDB

2. **資料同步**
   - 目前是純前端應用，無法跨裝置同步
   - 如需跨裝置同步，需要後端 API

3. **效能考量**
   - 切換粉專時需要載入所有資料
   - 可以考慮延遲載入或虛擬化

### 建議

✅ **建議實施** - 功能價值高，但需要仔細規劃架構變更。建議：
1. 先實施功能 1（模板系統）
2. 再實施功能 2（多粉專管理）
3. 考慮使用 IndexedDB 替代 localStorage（如果資料量大）

---

## 3️⃣ Meta API 一鍵貼文

### 📊 可行性評級：🔴 **低可行性（需要後端）**

### 技術難度：⭐⭐⭐⭐⭐ (5/5) - 極高

### 現有基礎
- ❌ 目前是純前端應用
- ❌ 沒有後端服務
- ❌ 沒有 OAuth 認證機制

### Meta API 要求

#### Facebook Graph API
- **需要後端服務**：OAuth 流程需要 redirect URI
- **需要 App Review**：發布權限需要 Meta 審核
- **需要 Business Verification**：某些權限需要商業驗證

#### Instagram Graph API
- **需要 Facebook Page**：Instagram 帳號必須連結到 Facebook Page
- **需要後端服務**：同上
- **需要 App Review**：發布權限需要審核

### 實施方案

#### 架構設計

```
前端 (React)
  ↓ HTTPS
後端 API (Node.js/Express 或 Serverless)
  ↓ OAuth 2.0
Meta API
```

#### 後端服務需求

**選項 A：Serverless Functions（推薦）**

使用 Cloudflare Workers、Vercel Functions 或 Netlify Functions：

```typescript
// api/auth/meta/callback.ts (Cloudflare Worker)
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    // 交換 access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      body: JSON.stringify({
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });
    
    const { access_token } = await tokenResponse.json();
    
    // 儲存 token（加密後儲存到資料庫或返回給前端）
    // ...
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
```

**選項 B：獨立後端服務**

使用 Node.js + Express：

```typescript
// server/routes/meta/auth.ts
import express from 'express';
import axios from 'axios';

const router = express.Router();

// OAuth 授權 URL
router.get('/auth', (req, res) => {
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${META_APP_ID}&` +
    `redirect_uri=${REDIRECT_URI}&` +
    `scope=pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish&` +
    `response_type=code`;
  
  res.redirect(authUrl);
});

// OAuth 回調
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  // 交換 access token
  const tokenResponse = await axios.post(
    'https://graph.facebook.com/v18.0/oauth/access_token',
    {
      client_id: META_APP_ID,
      client_secret: META_APP_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    }
  );
  
  const { access_token } = tokenResponse.data;
  
  // 儲存 token（加密）
  // ...
  
  res.json({ success: true });
});

// 發布貼文
router.post('/post', async (req, res) => {
  const { accessToken, pageId, message, imageUrl } = req.body;
  
  try {
    // 發布到 Facebook Page
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        message,
        access_token: accessToken,
      }
    );
    
    res.json({ success: true, postId: response.data.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

#### 前端整合

```typescript
// services/metaService.ts
export interface MetaAuthConfig {
  appId: string;
  redirectUri: string;
  scopes: string[];
}

export class MetaService {
  private accessToken: string | null = null;
  
  // 開始 OAuth 流程
  async startAuth(config: MetaAuthConfig): Promise<void> {
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${config.appId}&` +
      `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
      `scope=${config.scopes.join(',')}&` +
      `response_type=code`;
    
    // 開啟新視窗進行授權
    window.open(authUrl, 'Meta Auth', 'width=600,height=700');
  }
  
  // 發布貼文
  async postToPage(
    pageId: string,
    message: string,
    imageUrl?: string
  ): Promise<{ success: boolean; postId?: string }> {
    if (!this.accessToken) {
      throw new Error('未授權，請先完成 OAuth 流程');
    }
    
    // 呼叫後端 API
    const response = await fetch('/api/meta/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: this.accessToken,
        pageId,
        message,
        imageUrl,
      }),
    });
    
    return await response.json();
  }
}
```

#### UI 組件

```typescript
// components/MetaPostButton.tsx
import React, { useState } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { MetaService } from '../services/metaService';

export const MetaPostButton: React.FC<{ content: string }> = ({ content }) => {
  const { profile } = useAppData();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const metaService = new MetaService();
  
  const handleAuth = async () => {
    await metaService.startAuth({
      appId: META_APP_ID,
      redirectUri: `${window.location.origin}/auth/meta/callback`,
      scopes: ['pages_manage_posts', 'pages_read_engagement'],
    });
  };
  
  const handlePost = async () => {
    setIsPosting(true);
    try {
      const result = await metaService.postToPage(
        profile?.metaPageId || '',
        content
      );
      if (result.success) {
        alert('貼文發布成功！');
      }
    } catch (error) {
      alert('發布失敗：' + error.message);
    } finally {
      setIsPosting(false);
    }
  };
  
  return (
    <div>
      {!isAuthorized ? (
        <button onClick={handleAuth} className="bg-blue-600 text-white px-4 py-2 rounded">
          <i className="fa-brands fa-facebook mr-2"></i>
          連結 Meta 帳號
        </button>
      ) : (
        <button
          onClick={handlePost}
          disabled={isPosting}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isPosting ? '發布中...' : '一鍵發布到 Facebook'}
        </button>
      )}
    </div>
  );
};
```

### 所需資源

- **後端開發**：10-15 天
  - OAuth 流程實作：3-5 天
  - API 整合：5-7 天
  - Token 管理與加密：2-3 天
- **前端開發**：3-5 天
- **Meta App 設定**：2-3 天
  - 建立 Meta App
  - 設定 OAuth Redirect URI
  - 申請權限審核
- **測試時間**：5-7 天
- **總計**：20-30 天

### 風險評估

- **技術風險**：🔴 高
  - 需要建立後端服務
  - Meta API 變更頻繁
  - OAuth 流程複雜
- **審核風險**：🔴 高
  - Meta App Review 可能需要數週
  - 需要提供詳細的使用說明
  - 可能被拒絕或要求修改
- **維護成本**：🔴 高
  - 需要維護後端服務
  - 需要處理 API 變更
  - 需要監控 token 過期

### 限制與考量

1. **Meta App Review**
   - 發布權限需要審核
   - 審核時間：2-4 週
   - 可能需要提供示範影片

2. **Token 管理**
   - Access Token 有過期時間
   - 需要實作 Refresh Token 機制
   - 需要安全儲存（加密）

3. **成本**
   - 後端服務成本（Serverless 或 VPS）
   - Meta API 可能有使用限制

4. **隱私與安全**
   - 需要處理用戶資料
   - 需要符合 GDPR、個資法等規範

### 替代方案

**方案 A：使用第三方服務**
- 使用 Zapier、IFTTT 等自動化服務
- 優點：無需後端開發
- 缺點：需要付費、功能受限

**方案 B：瀏覽器擴充功能**
- 開發 Chrome Extension
- 優點：可以在用戶瀏覽器中執行
- 缺點：需要用戶安裝、仍需要 OAuth

### 建議

⚠️ **不建議立即實施** - 需要大量後端開發工作，且需要通過 Meta 審核。建議：
1. 先實施功能 1 和 2
2. 評估用戶需求與商業價值
3. 如果確實需要，考慮使用第三方服務或建立最小可行後端

---

## 4️⃣ 定時自動化排程

### 📊 可行性評級：🔴 **極低可行性（需要完整後端系統）**

### 技術難度：⭐⭐⭐⭐⭐ (5/5) - 極高

### 現有基礎
- ❌ 目前是純前端應用
- ❌ 沒有後端服務
- ❌ 沒有排程系統
- ❌ 沒有資料庫

### 技術需求

#### 核心需求

1. **後端服務**
   - 排程任務執行器（Cron Job）
   - 資料庫儲存排程設定
   - API 管理排程

2. **排程系統**
   - 定時觸發機制
   - 任務佇列管理
   - 錯誤處理與重試

3. **自動化流程**
   - AI 內容生成
   - 內容審核（可選）
   - 自動發布到 Meta

### 實施方案

#### 架構設計

```
前端 (React)
  ↓ API
後端服務 (Node.js)
  ├─ API Server (Express/Fastify)
  ├─ Scheduler (node-cron / Bull)
  ├─ Database (PostgreSQL / MongoDB)
  └─ Queue System (Bull / RabbitMQ)
      ↓
  Meta API / 其他平台 API
```

#### 後端服務架構

```typescript
// server/scheduler/jobRunner.ts
import cron from 'node-cron';
import { generateDailyInspirations } from '../services/aiService';
import { postToMeta } from '../services/metaService';

interface ScheduledPost {
  id: string;
  fanPageId: string;
  schedule: {
    type: 'daily' | 'weekly' | 'custom';
    time: string; // HH:mm
    days?: number[]; // 0-6 (Sunday-Saturday)
  };
  enabled: boolean;
}

export class JobRunner {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  
  // 註冊排程任務
  registerSchedule(post: ScheduledPost): void {
    if (!post.enabled) return;
    
    const cronExpression = this.buildCronExpression(post.schedule);
    
    const task = cron.schedule(cronExpression, async () => {
      try {
        // 1. 取得粉專資料
        const fanPageData = await this.getFanPageData(post.fanPageId);
        
        // 2. 生成內容
        const inspirations = await generateDailyInspirations(
          fanPageData.profile,
          fanPageData.schedule,
          fanPageData.vault,
          fanPageData.memories
        );
        
        // 3. 選擇一個靈感（或使用 AI 選擇）
        const selectedInspiration = this.selectInspiration(inspirations);
        
        // 4. 生成完整貼文
        const postContent = await this.generatePostContent(
          selectedInspiration,
          fanPageData.profile
        );
        
        // 5. 發布到 Meta
        if (fanPageData.metaConnected) {
          await postToMeta(
            fanPageData.metaPageId,
            postContent
          );
        }
        
        // 6. 記錄日誌
        await this.logPost(post.id, postContent);
        
      } catch (error) {
        console.error('排程任務執行失敗:', error);
        // 發送錯誤通知
        await this.sendErrorNotification(post.id, error);
      }
    });
    
    this.jobs.set(post.id, task);
  }
  
  private buildCronExpression(schedule: ScheduledPost['schedule']): string {
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    if (schedule.type === 'daily') {
      // 每天執行：分鐘 小時 * * *
      return `${minutes} ${hours} * * *`;
    } else if (schedule.type === 'weekly' && schedule.days) {
      // 每週特定天執行：分鐘 小時 * * 0-6
      const daysOfWeek = schedule.days.join(',');
      return `${minutes} ${hours} * * ${daysOfWeek}`;
    }
    
    throw new Error('不支援的排程類型');
  }
}
```

#### 資料庫 Schema

```sql
-- PostgreSQL Schema

-- 排程設定表
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY,
  fan_page_id UUID NOT NULL,
  schedule_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'custom'
  schedule_time TIME NOT NULL,
  schedule_days INTEGER[], -- 星期幾（0-6）
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 發布記錄表
CREATE TABLE post_history (
  id UUID PRIMARY KEY,
  scheduled_post_id UUID REFERENCES scheduled_posts(id),
  fan_page_id UUID NOT NULL,
  content TEXT NOT NULL,
  posted_at TIMESTAMP DEFAULT NOW(),
  platform VARCHAR(20), -- 'facebook', 'instagram'
  platform_post_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'success', -- 'success', 'failed', 'pending'
  error_message TEXT
);

-- 粉專 Meta 連線資訊表
CREATE TABLE fan_page_meta_connections (
  id UUID PRIMARY KEY,
  fan_page_id UUID NOT NULL,
  meta_page_id VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL, -- 加密儲存
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### API 端點

```typescript
// server/routes/schedule.ts
import express from 'express';
import { JobRunner } from '../scheduler/jobRunner';

const router = express.Router();
const jobRunner = new JobRunner();

// 建立排程
router.post('/schedule', async (req, res) => {
  const { fanPageId, schedule } = req.body;
  
  // 儲存到資料庫
  const scheduledPost = await db.scheduledPosts.create({
    fanPageId,
    schedule,
    enabled: true,
  });
  
  // 註冊排程任務
  jobRunner.registerSchedule(scheduledPost);
  
  res.json({ success: true, id: scheduledPost.id });
});

// 取得所有排程
router.get('/schedules/:fanPageId', async (req, res) => {
  const schedules = await db.scheduledPosts.findMany({
    where: { fanPageId: req.params.fanPageId },
  });
  
  res.json(schedules);
});

// 更新排程
router.put('/schedule/:id', async (req, res) => {
  const { schedule, enabled } = req.body;
  
  // 更新資料庫
  const updated = await db.scheduledPosts.update({
    where: { id: req.params.id },
    data: { schedule, enabled },
  });
  
  // 重新註冊排程
  jobRunner.unregisterSchedule(req.params.id);
  if (updated.enabled) {
    jobRunner.registerSchedule(updated);
  }
  
  res.json({ success: true });
});

// 刪除排程
router.delete('/schedule/:id', async (req, res) => {
  await db.scheduledPosts.delete({ where: { id: req.params.id } });
  jobRunner.unregisterSchedule(req.params.id);
  
  res.json({ success: true });
});
```

#### 前端整合

```typescript
// components/AutoScheduleManager.tsx
import React, { useState, useEffect } from 'react';
import { useAppData } from '../contexts/AppDataContext';

export const AutoScheduleManager: React.FC = () => {
  const { currentFanPageId } = useAppData();
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (currentFanPageId) {
      loadSchedules();
    }
  }, [currentFanPageId]);
  
  const loadSchedules = async () => {
    const response = await fetch(`/api/schedules/${currentFanPageId}`);
    const data = await response.json();
    setSchedules(data);
  };
  
  const createSchedule = async (schedule: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fanPageId: currentFanPageId,
          schedule,
        }),
      });
      
      if (response.ok) {
        await loadSchedules();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">自動化排程設定</h2>
      
      {/* 排程列表 */}
      {schedules.map(schedule => (
        <div key={schedule.id} className="p-4 border rounded-lg">
          {/* 排程詳細資訊 */}
        </div>
      ))}
      
      {/* 新增排程按鈕 */}
      <button onClick={() => {/* 顯示新增表單 */}}>
        新增排程
      </button>
    </div>
  );
};
```

### 所需資源

- **後端開發**：20-30 天
  - API Server：5-7 天
  - 排程系統：7-10 天
  - 資料庫設計與實作：3-5 天
  - 錯誤處理與監控：5-8 天
- **前端開發**：5-7 天
- **基礎設施設定**：3-5 天
  - 資料庫設定
  - 部署環境
  - 監控系統
- **測試時間**：10-15 天
- **總計**：38-57 天

### 風險評估

- **技術風險**：🔴 極高
  - 需要完整的後端系統
  - 排程系統複雜度高
  - 需要處理各種邊緣情況
- **運維風險**：🔴 極高
  - 需要 24/7 運行的服務
  - 需要監控與告警
  - 需要處理服務中斷
- **成本風險**：🔴 高
  - 後端服務成本
  - 資料庫成本
  - 監控服務成本

### 限制與考量

1. **服務可用性**
   - 後端服務必須 24/7 運行
   - 需要處理服務重啟、更新等情況

2. **錯誤處理**
   - AI 生成失敗
   - Meta API 失敗
   - 網路問題
   - 需要重試機制

3. **內容審核**
   - 自動發布前是否需要人工審核？
   - 如何處理不當內容？

4. **成本控制**
   - AI API 呼叫成本
   - 後端服務成本
   - 資料庫儲存成本

### 替代方案

**方案 A：使用第三方服務**
- 使用 Zapier、IFTTT、Make.com 等
- 優點：無需開發後端
- 缺點：需要付費、功能受限、依賴第三方

**方案 B：瀏覽器擴充功能 + 本地排程**
- 使用瀏覽器擴充功能
- 使用 Chrome Alarms API 進行排程
- 優點：無需後端
- 缺點：需要瀏覽器保持開啟、功能受限

### 建議

❌ **不建議立即實施** - 需要完整的後端系統，開發成本極高。建議：
1. 先實施功能 1、2、3（如果 3 有價值）
2. 評估用戶需求與商業價值
3. 考慮使用第三方服務（Zapier 等）
4. 如果確實需要自建，建議分階段實施：
   - 階段 1：手動排程（用戶設定時間，手動觸發）
   - 階段 2：半自動排程（用戶確認後自動發布）
   - 階段 3：全自動排程（完全自動化）

---

## 📊 總結與建議

### 實施優先順序

1. ✅ **功能 1：小編提示詞模板** - 立即實施
   - 技術難度低
   - 效益高
   - 開發時間短

2. 🔄 **功能 2：多粉專管理** - 短期實施
   - 技術難度中等
   - 功能價值高
   - 需要仔細規劃

3. ⚠️ **功能 3：Meta 一鍵貼文** - 評估後決定
   - 技術難度高
   - 需要後端服務
   - 需要 Meta 審核

4. ❌ **功能 4：自動化排程** - 不建議立即實施
   - 技術難度極高
   - 需要完整後端系統
   - 成本與風險高

### 技術債務考量

實施功能 2、3、4 前，建議先解決以下技術債務：
1. 建立後端服務架構（如果需要功能 3、4）
2. 考慮使用 IndexedDB 替代 localStorage（功能 2）
3. 建立資料備份與還原機制（功能 2）

### 商業價值評估

- **功能 1**：高價值，低成本 ✅
- **功能 2**：高價值，中成本 ✅
- **功能 3**：中高價值，高成本 ⚠️
- **功能 4**：高價值，極高成本 ❌

建議先實施功能 1 和 2，根據用戶反饋再決定是否實施功能 3 和 4。

