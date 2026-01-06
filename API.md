# API 文件

## 概述

本文件說明 SocialCoachAI 專案中的 API 服務與工具函數。

## 服務 API

### Gemini Service (`services/geminiService.ts`)

#### `generateWeeklyPlan(profile, apiKey)`

產生一週課表。

**參數：**
- `profile: UserProfile` - 使用者資料
- `apiKey: string | null` - Gemini API Key

**回傳：** `Promise<DayPlan[]>`

**範例：**
```typescript
const schedule = await generateWeeklyPlan(profile, apiKey);
```

#### `generateDailyInspirations(profile, dayPlan, memories, apiKey)`

根據當日課表產生 3 個靈感。

**參數：**
- `profile: UserProfile` - 使用者資料
- `dayPlan: DayPlan` - 當日課表
- `memories: MemoryEntry[]` - 記憶資料
- `apiKey: string | null` - Gemini API Key

**回傳：** `Promise<DailyInspiration[]>`

**範例：**
```typescript
const inspirations = await generateDailyInspirations(profile, todayPlan, memories, apiKey);
```

#### `getGeneralCoaching(profile, message, memories, apiKey)`

取得一般教練建議。

**參數：**
- `profile: UserProfile` - 使用者資料
- `message: string` - 使用者訊息
- `memories: MemoryEntry[]` - 記憶資料
- `apiKey: string | null` - Gemini API Key

**回傳：** `Promise<string>`

**範例：**
```typescript
const reply = await getGeneralCoaching(profile, userMessage, memories, apiKey);
```

## 工具 API

### Storage Service (`utils/storageService.ts`)

#### `profileStorage`

Profile 資料操作。

**方法：**
- `get(): UserProfile | null` - 取得 Profile
- `set(profile: UserProfile): void` - 設定 Profile
- `remove(): void` - 刪除 Profile

**範例：**
```typescript
const profile = profileStorage.get();
profileStorage.set(newProfile);
profileStorage.remove();
```

#### `vaultStorage`

Vault 資料操作。

**方法：**
- `get(): ResourceItem[]` - 取得所有 Vault 項目
- `set(items: ResourceItem[]): void` - 設定 Vault 項目
- `remove(): void` - 刪除所有 Vault 項目

#### `memoriesStorage`

Memories 資料操作。

**方法：**
- `get(): MemoryEntry[]` - 取得所有 Memories
- `set(memories: MemoryEntry[]): void` - 設定 Memories
- `remove(): void` - 刪除所有 Memories

#### `scheduleStorage`

Schedule 資料操作。

**方法：**
- `get(): DayPlan[]` - 取得 Schedule
- `set(schedule: DayPlan[]): void` - 設定 Schedule
- `remove(): void` - 刪除 Schedule

### Error Handler (`utils/errorHandler.ts`)

#### `handleError(error, options)`

統一錯誤處理函數。

**參數：**
- `error: unknown` - 錯誤物件
- `options: ErrorHandlerOptions` - 選項

**回傳：** `string` - 錯誤訊息

**範例：**
```typescript
const errorMessage = handleError(error, {
  defaultMessage: '發生錯誤',
  showToast: true,
});
```

#### `formatApiError(error)`

格式化 API 錯誤訊息。

**參數：**
- `error: unknown` - 錯誤物件

**回傳：** `string` - 格式化的錯誤訊息

#### `getErrorInfo(error)`

取得錯誤詳細資訊。

**參數：**
- `error: unknown` - 錯誤物件

**回傳：** `ErrorInfo` - 錯誤資訊物件

### Request Manager (`utils/requestManager.ts`)

#### `requestManager.getOrCreate(key, requestFn, timeout)`

取得或建立請求（自動去重）。

**參數：**
- `key: string` - 請求鍵值
- `requestFn: () => Promise<T>` - 請求函數
- `timeout?: number` - 超時時間（預設 5 分鐘）

**回傳：** `Promise<T>`

**範例：**
```typescript
const result = await requestManager.getOrCreate(
  'cache-key',
  () => fetchData(),
  60000
);
```

### API Cache (`utils/apiCache.ts`)

#### `apiCache.get<T>(key)`

取得快取資料。

**參數：**
- `key: string` - 快取鍵值

**回傳：** `T | null`

#### `apiCache.set<T>(key, data, ttl)`

設定快取資料。

**參數：**
- `key: string` - 快取鍵值
- `data: T` - 資料
- `ttl?: number` - 過期時間（毫秒，預設 5 分鐘）

#### `apiCache.clear(key?)`

清除快取。

**參數：**
- `key?: string` - 快取鍵值（不提供則清除所有）

### ID Generator (`utils/idGenerator.ts`)

#### `generateId()`

生成唯一 ID。

**回傳：** `string` - UUID 格式的 ID

**範例：**
```typescript
const id = generateId(); // "550e8400-e29b-41d4-a716-446655440000"
```

#### `generateShortId()`

生成簡短唯一 ID。

**回傳：** `string` - 簡短格式的 ID

### API Key Validator (`utils/apiKeyValidator.ts`)

#### `validateApiKeyFormat(key)`

驗證 API Key 格式。

**參數：**
- `key: string` - API Key

**回傳：** `{ valid: boolean; error?: string }`

**範例：**
```typescript
const validation = validateApiKeyFormat(apiKey);
if (!validation.valid) {
  console.error(validation.error);
}
```

#### `maskApiKey(key, visibleChars)`

遮罩 API Key。

**參數：**
- `key: string` - API Key
- `visibleChars?: number` - 可見字元數（預設 4）

**回傳：** `string` - 遮罩後的 API Key

**範例：**
```typescript
const masked = maskApiKey('AIzaSyAbCdEf1234567890'); // "AIza**************7890"
```

## Context API

### AppDataContext (`contexts/AppDataContext.tsx`)

#### `useAppData()`

取得應用程式資料 Hook。

**回傳：** `AppDataContextType`

**屬性：**
- `profile: UserProfile | null` - 使用者資料
- `setProfile(profile: UserProfile): void` - 設定 Profile
- `vault: ResourceItem[]` - Vault 資料
- `addVaultItem(item): void` - 新增 Vault 項目
- `deleteVaultItem(id): void` - 刪除 Vault 項目
- `memories: MemoryEntry[]` - Memories 資料
- `addMemory(content, category): void` - 新增 Memory
- `deleteMemory(id): void` - 刪除 Memory
- `schedule: DayPlan[]` - Schedule 資料
- `setSchedule(schedule): void` - 設定 Schedule
- `isLoading: boolean` - 載入狀態

**範例：**
```typescript
const { profile, vault, addVaultItem } = useAppData();
```

### ApiKeyContext (`contexts/ApiKeyContext.tsx`)

#### `useApiKey()`

取得 API Key Hook。

**回傳：** `ApiKeyContextType`

**屬性：**
- `apiKey: string | null` - API Key
- `setApiKey(key: string): void` - 設定 API Key
- `clearApiKey(): void` - 清除 API Key
- `isApiKeySet: boolean` - API Key 是否已設定

### ToastContext (`contexts/ToastContext.tsx`)

#### `useToast()`

取得 Toast Hook。

**回傳：** `ToastContextType`

**方法：**
- `showToast(message, type?, duration?): void` - 顯示 Toast

**範例：**
```typescript
const { showToast } = useToast();
showToast('操作成功！', 'success');
```

## Hooks API

### useOnlineStatus (`hooks/useOnlineStatus.ts`)

#### `useOnlineStatus()`

檢測網路連線狀態。

**回傳：** `{ isOnline: boolean; wasOffline: boolean }`

**範例：**
```typescript
const { isOnline, wasOffline } = useOnlineStatus();
if (!isOnline) {
  console.log('目前處於離線狀態');
}
```

## 型別定義

### UserProfile

```typescript
interface UserProfile {
  fanPageName: string;
  positioning: string;
  destination: string;
  targetAudience: string;
  targetRegion: string; // 目標區域，預設為「台灣」
  additionalNotes: string; // 補充說明：可填寫更多粉專關聯的作品或品牌的描述
}
```

### DayPlan

```typescript
interface DayPlan {
  day: DayOfWeek;
  type: string;
  purpose: string;
  priority: 'required' | 'optional'; // required: 首要行程（週一、三、五、日）, optional: 建議備選（週二、四、六）
}
```

### ResourceItem

```typescript
interface ResourceItem {
  id: string;
  type: 'inspiration' | 'asset' | 'character_design';
  title: string;
  content: string;
  createdAt: string;
}
```

### MemoryEntry

```typescript
interface MemoryEntry {
  id: string;
  date: string;
  category: 'insight' | 'milestone' | 'feedback';
  content: string;
}
```

## 錯誤處理

所有 API 函數都可能拋出 `AppError`：

```typescript
class AppError extends Error {
  code?: string;
  retryable: boolean;
}
```

使用 `handleError()` 統一處理錯誤：

```typescript
try {
  const result = await someApiCall();
} catch (error) {
  const message = handleError(error, {
    defaultMessage: '操作失敗',
  });
  showToast(message, 'error');
}
```

