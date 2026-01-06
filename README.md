<div align="center">
  <h1>🚀 社群AI陪跑教練</h1>
  <p>為 1,000+ 創作者而生的智能社群經營助手</p>
  <p>
    <img src="https://img.shields.io/badge/version-0.1-blue" alt="Version" />
    <img src="https://img.shields.io/badge/license-Private-red" alt="License" />
    <img src="https://img.shields.io/badge/React-19.2.3-blue" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.8.2-blue" alt="TypeScript" />
  </p>
</div>

## 📖 關於專案

**社群AI陪跑教練** 是一個專為社群經營者打造的 AI 輔助工具，幫助創作者規劃內容策略、生成發文靈感、管理素材庫，並提供專業的經營建議。透過 Gemini AI 的強大能力，讓您的社群經營更有效率、更有策略。

### ✨ 主要功能

- 🎯 **每日任務規劃** - AI 根據您的定位與目標，提供每日發文靈感與策略建議
- 📅 **週課表管理** - 規劃一週的內容排程，確保內容多樣化與策略性
- 💬 **AI 教練對話** - 隨時詢問經營問題，獲得專業建議與洞察
- 📦 **素材庫管理** - 儲存靈感、素材與角色設定，AI 自動匹配發文時機
- 🧠 **成長筆記** - 記錄經營洞察、里程碑與用戶回饋，建立長期記憶
- 🔍 **智能搜尋** - 快速搜尋素材與筆記內容
- 💾 **資料備份** - 匯出/匯入資料，確保資料安全

## 🚀 快速開始

### 必要條件

- Node.js >= 18.0.0
- npm >= 9.0.0
- Gemini API Key ([取得方式](https://aistudio.google.com/app/apikey))

### 安裝步驟

1. **複製專案**
   ```bash
   git clone <repository-url>
   cd SocialCoachAI
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **設定環境變數**（可選）
   
   建立 `.env.local` 檔案：
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   
   > 注意：也可以在應用程式中直接設定 API Key

4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

5. **開啟瀏覽器**
   
   訪問 `http://localhost:3000`

## 📦 建置與部署

### 建置生產版本

```bash
npm run build
```

建置後的檔案會輸出到 `dist/` 目錄。

### 預覽生產版本

```bash
npm run preview
```

## 🛠️ 開發工具

### 程式碼檢查

```bash
# 檢查程式碼風格
npm run lint

# 自動修復
npm run lint:fix
```

### 程式碼格式化

```bash
# 格式化程式碼
npm run format

# 檢查格式
npm run format:check
```

## 📁 專案結構

```
SocialCoachAI/
├── components/          # React 組件
│   ├── ApiKeySetupModal.tsx
│   ├── DataExportModal.tsx
│   ├── LoadingSpinner.tsx
│   ├── OfflineIndicator.tsx
│   ├── SearchInput.tsx
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
│   ├── dataExport.ts
│   ├── errorHandler.ts
│   ├── idGenerator.ts
│   ├── requestManager.ts
│   ├── retry.ts
│   ├── searchUtils.ts
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

## 🎨 技術棧

- **前端框架**: React 19.2.3
- **語言**: TypeScript 5.8.2
- **建置工具**: Vite 6.2.0
- **樣式**: Tailwind CSS 4.1.18
- **AI 服務**: Google Gemini API
- **狀態管理**: React Context API
- **資料儲存**: localStorage

## 📚 文件

- [開發指南](./DEVELOPMENT.md) - 詳細的開發說明與最佳實踐
- [API 文件](./API.md) - 完整的 API 參考文件
- [優化總結](./OPTIMIZATION_SUMMARY.md) - 專案優化項目總結

## 🔒 隱私與安全

- 所有資料儲存在瀏覽器本地（localStorage）
- API Key 僅儲存在本地，不會上傳至伺服器
- 支援資料匯出/匯入功能，方便備份與遷移

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

本專案為私有專案，版權所有。

## 👥 開發團隊

由 [FlyPig AI](https://flypigai.icareu.tw/) 開發與維護

---

<div align="center">
  <p>Copyright © 2025 <a href="https://flypigai.icareu.tw/">FlyPig AI</a>. All rights reserved.</p>
</div>
