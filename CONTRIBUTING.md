# 🤝 貢獻指南

感謝您對 **社群陪跑教練** 的關注！我們非常歡迎您的貢獻。無論是回報 Bug、提出新功能建議，還是提交程式碼改進，您的參與都讓這個專案變得更好。

## 💡 為什麼要貢獻？

維護自己的 Fork 很累，而且容易與主線脫節。透過 Pull Request 將您的改動合併回主線，您可以：
- ✅ 持續享受主線的更新與改進
- ✅ 與社群一起協作，讓專案更完善
- ✅ 獲得貢獻者認證，建立您的開源履歷
- ✅ 減少維護成本，專注於使用而非維護

## 🐛 如何回報 Bug

發現 Bug 了嗎？請協助我們改進！

1. **檢查是否已有相關 Issue**
   - 在 [Issues](https://github.com/mkhsu2002/SocialCoachAI/issues) 中搜尋是否已有類似問題
   - 如果已存在，請在該 Issue 下留言補充資訊

2. **建立新的 Bug Report**
   - 使用 [Bug Report 模板](https://github.com/mkhsu2002/SocialCoachAI/issues/new?template=bug_report.md)
   - 請詳細描述問題，包含：
     - 操作步驟（如何重現）
     - 預期行為
     - 實際行為
     - 環境資訊（瀏覽器、作業系統等）
     - 錯誤訊息或截圖

## 💡 如何提交新功能建議

有好點子嗎？我們很樂意聽聽您的想法！

1. **建立 Feature Request**
   - 使用 [Feature Request 模板](https://github.com/mkhsu2002/SocialCoachAI/issues/new?template=feature_request.md)
   - 清楚說明：
     - 功能需求與使用場景
     - 預期的效益
     - 可能的實作方向（如果有想法）

2. **討論與實作**
   - 我們會在 Issue 中討論可行性
   - 確認後，歡迎您提交 Pull Request 實作

## 🛠️ 開發環境設置

### 必要條件

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 設置步驟

1. **Fork 專案**
   ```bash
   # 在 GitHub 上 Fork 本專案
   ```

2. **複製您的 Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SocialCoachAI.git
   cd SocialCoachAI
   ```

3. **設定上游倉庫**
   ```bash
   git remote add upstream https://github.com/mkhsu2002/SocialCoachAI.git
   ```

4. **安裝依賴**
   ```bash
   npm install
   ```

5. **建立開發分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

6. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

7. **設定環境變數（可選）**
   
   建立 `.env.local` 檔案：
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   
   > 注意：也可以在應用程式中直接設定 API Key

## 📝 開發流程

### 1. 同步主線更新

在開始開發前，確保您的分支是最新的：

```bash
git fetch upstream
git checkout main
git merge upstream/main
git checkout your-feature-branch
git rebase main
```

### 2. 開發與測試

- 撰寫程式碼時，請遵循現有的程式碼風格
- 確保功能正常運作
- 測試不同的使用情境

### 3. 程式碼檢查

提交前，請執行以下檢查：

```bash
# 一次性執行所有檢查（推薦）
npm run pre-check

# 自動修復所有可修復的問題
npm run pre-check:fix
```

或者分別執行：

```bash
# 檢查程式碼風格
npm run lint

# 自動修復可修復的問題
npm run lint:fix

# 檢查程式碼格式
npm run format:check

# 自動格式化（如果需要）
npm run format
```

### 4. 提交變更

使用清晰的 commit message：

```bash
git add .
git commit -m "feat: 新增 XXX 功能"
# 或
git commit -m "fix: 修復 XXX 問題"
```

**Commit Message 規範：**
- `feat:` - 新功能
- `fix:` - Bug 修復
- `docs:` - 文件更新
- `style:` - 程式碼格式調整（不影響功能）
- `refactor:` - 程式碼重構
- `test:` - 測試相關
- `chore:` - 建置流程或工具變更

### 5. 推送並建立 Pull Request

```bash
git push origin your-feature-branch
```

然後在 GitHub 上建立 Pull Request，使用 [PR 模板](https://github.com/mkhsu2002/SocialCoachAI/compare)。

## ✅ Pull Request 檢核表

在提交 PR 前，請確認：

- [ ] 程式碼已通過 `npm run lint` 檢查
- [ ] 程式碼已通過 `npm run format:check` 檢查
- [ ] 已測試功能正常運作
- [ ] 已更新相關文件（如需要）
- [ ] Commit message 符合規範
- [ ] PR 描述清楚說明改動原因與測試方式
- [ ] 已同步主線最新更新

## 🚀 部署測試

本專案建議使用 **Cloudflare Pages** 進行部署測試：

### Cloudflare Pages 部署步驟

1. **登入 Cloudflare Dashboard**
   - 前往 [Cloudflare Pages](https://dash.cloudflare.com/)

2. **建立新專案**
   - 選擇「Create a project」
   - 連接您的 GitHub 帳號
   - 選擇您的 Fork 倉庫

3. **設定建置配置**
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`（或留空）

4. **環境變數（可選）**
   - 如果需要，可以在環境變數中設定 `GEMINI_API_KEY`
   - 但建議在應用程式中設定，因為這是用戶自己的 API Key

5. **部署**
   - 點擊「Save and Deploy」
   - 等待建置完成

### 本地預覽生產版本

```bash
npm run build
npm run preview
```

## 📚 程式碼風格指南

### TypeScript/React

- 使用 TypeScript 的型別系統，避免使用 `any`
- 組件使用函數式寫法
- 使用 React Hooks 管理狀態
- 組件檔案使用 PascalCase 命名
- 工具函數使用 camelCase 命名

### 檔案結構

- 組件放在 `components/` 目錄
- 視圖放在 `views/` 目錄
- 工具函數放在 `utils/` 目錄
- 服務放在 `services/` 目錄
- Context 放在 `contexts/` 目錄
- Hooks 放在 `hooks/` 目錄

### 命名規範

- 組件檔案：`PascalCase.tsx`（如 `ApiKeySetupModal.tsx`）
- 工具函數檔案：`camelCase.ts`（如 `apiCache.ts`）
- 常數檔案：`UPPER_SNAKE_CASE.ts`（如 `API_CONSTANTS.ts`）

## 🎯 優先處理的改進項目

如果您不知道從哪裡開始貢獻，以下是一些急需幫助的項目：

- 🔍 改進搜尋功能的效能與準確度
- 🎨 UI/UX 優化與無障礙性改進
- 📱 響應式設計優化
- 🧪 單元測試與整合測試
- 📖 文件完善與範例補充
- 🌐 多語言支援（i18n）
- ⚡ 效能優化與快取策略改進

更多詳細的 Roadmap 請參考 [README.md](./README.md#-roadmap)。

## 💬 需要幫助？

如果您在貢獻過程中遇到任何問題：

1. 查看 [開發指南](./DEVELOPMENT.md)
2. 查看 [API 文件](./API.md)
3. 在 [Issues](https://github.com/mkhsu2002/SocialCoachAI/issues) 中搜尋相關問題
4. 建立新的 Issue 詢問

## 🙏 感謝您的貢獻！

每一位貢獻者都是這個專案的重要一員。您的參與讓這個專案變得更好，也幫助了更多社群經營者。再次感謝您的支持！

---

**記住：維護自己的 Fork 很累，合併回主線才能長久享受更新！** 🚀

