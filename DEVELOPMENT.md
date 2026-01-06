# 開發指南

## 專案架構

### 目錄結構

```
SocialCoachAI/
├── components/          # React 組件
│   ├── ApiKeySetupModal.tsx
│   ├── LoadingSpinner.tsx
│   ├── OfflineIndicator.tsx
│   └── Sidebar.tsx
├── contexts/            # React Context
│   ├── ApiKeyContext.tsx
│   ├── AppDataContext.tsx
│   └── ToastContext.tsx
├── hooks/               # 自訂 Hooks
│   └── useOnlineStatus.ts
├── services/            # API 服務
│   └── geminiService.ts
├── utils/               # 工具函數
│   ├── apiCache.ts
│   ├── apiKeyValidator.ts
│   ├── errorHandler.ts
│   ├── idGenerator.ts
│   ├── requestManager.ts
│   ├── retry.ts
│   ├── storageService.ts
│   └── typeGuards.ts
├── views/               # 頁面視圖
│   ├── DashboardView.tsx
│   ├── MemoryView.tsx
│   ├── OnboardingView.tsx
│   ├── ScheduleSetupView.tsx
│   ├── StrategyChatView.tsx
│   └── VaultView.tsx
├── App.tsx              # 主應用程式
├── types.ts             # TypeScript 型別定義
└── index.tsx            # 應用程式入口
```

## 開發環境設定

### 必要條件

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

應用程式將在 `http://localhost:3000` 啟動。

### 建置生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 程式碼風格

### ESLint

檢查程式碼風格：

```bash
npm run lint
```

自動修復：

```bash
npm run lint:fix
```

### Prettier

格式化程式碼：

```bash
npm run format
```

檢查格式：

```bash
npm run format:check
```

## 核心概念

### 狀態管理

專案使用 Context API 進行狀態管理：

- **ApiKeyContext**: 管理 Gemini API Key
- **AppDataContext**: 管理應用程式資料（Profile, Vault, Memories, Schedule）
- **ToastContext**: 管理通知訊息

### 資料持久化

所有資料儲存在 `localStorage`，透過 `storageService.ts` 統一管理：

- `profileStorage`: Profile 資料
- `vaultStorage`: Vault 資料
- `memoriesStorage`: Memories 資料
- `scheduleStorage`: Schedule 資料

### API 請求

API 請求透過 `geminiService.ts` 處理：

- 自動快取機制（`apiCache.ts`）
- 請求去重機制（`requestManager.ts`）
- 重試機制（`retry.ts`）
- 錯誤處理（`errorHandler.ts`）

## 開發最佳實踐

### 1. 型別安全

- 使用 TypeScript 嚴格模式
- 使用型別守衛函數驗證資料
- 避免使用 `any` 型別

### 2. 錯誤處理

- 使用 `handleError()` 統一處理錯誤
- 提供友善的錯誤訊息
- 記錄錯誤到 console

### 3. 效能優化

- 使用 `React.memo` 優化組件重新渲染
- 使用 `useMemo` 快取計算結果
- 使用 `useCallback` 快取回調函數

### 4. 程式碼組織

- 組件檔案使用 PascalCase 命名
- 工具函數檔案使用 camelCase 命名
- 每個檔案只導出一個主要功能

### 5. 測試

- 為關鍵功能編寫單元測試
- 使用描述性的測試名稱
- 保持測試獨立性

## 新增功能指南

### 新增頁面視圖

1. 在 `views/` 目錄建立新檔案
2. 使用 `useAppData()` Hook 存取資料
3. 在 `App.tsx` 中註冊新路由
4. 在 `Sidebar.tsx` 中加入導航項目

### 新增工具函數

1. 在 `utils/` 目錄建立新檔案
2. 匯出函數並加入 JSDoc 註解
3. 在 `types.ts` 中定義相關型別
4. 加入錯誤處理

### 新增 API 服務

1. 在 `services/` 目錄建立新檔案
2. 使用 `requestManager` 管理請求
3. 使用 `apiCache` 快取結果
4. 使用 `withRetry` 處理重試

## 常見問題

### Q: 如何新增新的資料類型？

A: 
1. 在 `types.ts` 中定義型別
2. 在 `utils/typeGuards.ts` 中加入型別守衛函數
3. 在 `utils/storageService.ts` 中加入儲存操作
4. 在 `contexts/AppDataContext.tsx` 中加入狀態管理

### Q: 如何處理 API 錯誤？

A: 使用 `handleError()` 函數統一處理錯誤，它會：
- 格式化錯誤訊息
- 顯示 Toast 通知
- 記錄錯誤到 console

### Q: 如何優化組件效能？

A:
- 使用 `React.memo` 包裝組件
- 使用 `useMemo` 快取計算結果
- 使用 `useCallback` 快取回調函數
- 避免在 render 中建立新物件

## 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權

本專案為私有專案。

