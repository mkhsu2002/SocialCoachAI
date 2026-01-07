<div align="center">
  <h1>🚀 社群陪跑教練</h1>
  <p>為 1,000+ 創作者而生的智能社群經營助手</p>
  <p>
    <img src="https://img.shields.io/badge/version-0.3-blue" alt="Version" />
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
    <img src="https://img.shields.io/badge/React-19.2.3-blue" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.8.2-blue" alt="TypeScript" />
  </p>
</div>

## 📖 關於專案

**社群陪跑教練** 是一個專為社群經營者打造的 AI 輔助工具，幫助創作者規劃內容策略、生成發文靈感、管理素材庫，並提供專業的經營建議。透過 Google Gemini AI 的強大能力，讓您的社群經營更有效率、更有策略。

### ✨ 主要功能

#### 🎯 每日任務規劃
- AI 根據您的定位、目標與每週課表，自動生成每日發文靈感
- 每次生成 3 個靈感提案，可隨時換一批
- **智能素材匹配**：自動從素材庫中隨機選擇未使用的素材來生成靈感
- **靈感編輯器**：選擇靈感後可編輯發文內容，支援草稿儲存
- **AI 生成貼文**：一鍵生成完整貼文內容，參考您的粉專定位與小編人設
- **已貼文功能**：標記已貼文後，內容自動轉移至成長筆記作為歷史紀錄

#### 📅 週課表管理
- 規劃一週的內容排程，確保內容多樣化與策略性
- 支援「首要行程」（週一、三、五、日）與「建議備選」（週二、四、六）
- AI 智慧生成課表，根據您的定位與目標自動規劃內容類型與目的
- 支援目標區域設定（台灣、香港、澳門等），客製化內容策略

#### 💬 AI 教練對話
- 隨時詢問經營問題，獲得專業建議與洞察
- 根據您的基本設定（定位、目標、受眾等）提供客製化建議
- 對話內容可自動儲存至成長筆記

#### 📦 素材庫管理
- **多元素材類型**：支援 12 種素材類型（經營靈感、發文素材、角色設定、故事、金句、教學、幕後花絮、互動內容、推廣活動、新聞時事、評價心得、其他）
- **多種新增方式**：
  - 手動輸入
  - 貼上文字內容，AI 自動分析拆解成多個素材
  - 上傳文件（.txt, .md, .json），AI 自動解析
  - 輸入網址，AI 自動抓取內容並分析
- **AI 內容分析**：自動將長篇內容拆解成多個相關素材提案
- **衍生素材功能**：基於現有素材，從不同面向探討運用，生成多種變體
- **素材管理**：檢視、編輯、標記已使用、刪除功能
- **智能搜尋**：快速搜尋素材標題、內容或類型

#### 🧠 成長筆記
- 記錄經營洞察、里程碑與用戶回饋，建立長期記憶
- 分類管理：洞察、里程碑、回饋
- 智能搜尋：快速搜尋筆記內容、類別或日期
- 時間軸顯示，清晰呈現成長歷程

#### 🔍 智能搜尋
- 快速搜尋素材與筆記內容
- 即時過濾，相關度排序
- 多欄位搜尋支援

#### 💾 資料備份與還原
- **完整資料匯出**：包含所有資料類型（設定檔、素材庫、成長筆記、課表、每日靈感、靈感草稿）
- **一鍵備份**：匯出為 JSON 檔案，方便備份與遷移
- **資料還原**：從備份檔案還原所有資料
- **版本相容**：支援舊版備份檔案匯入

#### ⚙️ 基本設定
- 粉專名稱、定位、目標、目標受眾設定
- **目標區域設定**：台灣、香港、澳門等，客製化 AI 內容生成
- **補充說明**：可填寫更多粉專關聯的作品或品牌描述
- **小編人設提示詞**：設定小編的寫作風格、語氣、特色，AI 生成貼文時會參考此設定

## 🆕 v0.3 版本新功能

- ✨ **AI 生成貼文內容**：選擇靈感後可一鍵生成完整貼文，參考粉專定位與小編人設
- 🎨 **小編人設設定**：在基本設定中可設定小編的寫作風格，讓 AI 生成更符合品牌調性的內容
- 🔄 **智能素材匹配**：換一批靈感時，自動從素材庫中隨機選擇未使用的素材來生成靈感
- 📝 **靈感編輯與草稿**：選擇靈感後可編輯發文內容，支援草稿儲存功能
- ✅ **已貼文功能**：標記已貼文後，內容自動轉移至成長筆記作為歷史紀錄
- 📚 **素材庫增強**：
  - AI 內容分析拆解：貼上文字或上傳文件，AI 自動拆解成多個素材
  - 衍生素材功能：基於現有素材，從不同面向探討運用
  - 素材檢視與編輯：完整的素材管理功能
- 💾 **資料備份完善**：匯出功能現在包含每日靈感和靈感草稿
- 🐛 **UI 優化**：修復 Modal 重疊問題，使用 React Portal 確保正確顯示

## 🚀 快速開始

### 必要條件

- Node.js >= 18.0.0
- npm >= 9.0.0
- Gemini API Key ([取得方式](https://aistudio.google.com/app/apikey))

### 安裝步驟

1. **複製專案**
   ```bash
   git clone https://github.com/mkhsu2002/SocialCoachAI.git
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

### 🚀 部署到 Cloudflare Pages（推薦）

本專案建議使用 **Cloudflare Pages** 進行部署，提供免費、快速且穩定的靜態網站託管服務。

#### 快速部署步驟

1. **Fork 專案**到您的 GitHub 帳號
2. **登入 Cloudflare Dashboard** → 選擇 **Pages** → **Create a project**
3. **連接 GitHub 倉庫**並選擇您的 Fork
4. **設定建置配置**：
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
5. **點擊 Deploy**，等待建置完成

> 📖 **詳細部署指南**：請參閱 [DEPLOYMENT.md](./DEPLOYMENT.md) 獲取完整的部署說明與進階設定。

#### 自動部署

- ✅ 每次推送到 `main` 分支會自動觸發生產環境部署
- ✅ 每次建立 Pull Request 會自動建立預覽部署
- ✅ 免費 SSL 憑證與全球 CDN 加速

### 其他部署選項

專案也支援其他部署平台：

- **Netlify**: 專案已配置 `netlify.toml`，可直接部署
- **Vercel**: 支援 Vite 專案，自動偵測配置
- **GitHub Pages**: 需要額外設定，參考 [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

## 🛠️ 開發工具

### 程式碼檢查與格式化

```bash
# 一次性執行所有檢查（推薦，提交 PR 前必執行）
npm run pre-check

# 自動修復所有可修復的問題
npm run pre-check:fix
```

或分別執行：

```bash
# 檢查程式碼風格
npm run lint

# 自動修復
npm run lint:fix

# 格式化程式碼
npm run format

# 檢查格式
npm run format:check
```

## 🎨 技術棧

- **前端框架**: React 19.2.3
- **語言**: TypeScript 5.8.2
- **建置工具**: Vite 6.2.0
- **樣式**: Tailwind CSS 4.1.18
- **AI 服務**: Google Gemini API (gemini-3-flash-preview)
- **狀態管理**: React Context API
- **資料儲存**: localStorage
- **UI 組件**: React Portal (Modal 渲染)

## 📚 文件

- [開發指南](./DEVELOPMENT.md) - 詳細的開發說明與最佳實踐
- [API 文件](./API.md) - 完整的 API 參考文件
- [優化總結](./OPTIMIZATION_SUMMARY.md) - 專案優化項目總結

## 🔒 隱私與安全

- 所有資料儲存在瀏覽器本地（localStorage）
- API Key 僅儲存在本地，不會上傳至伺服器
- 支援資料匯出/匯入功能，方便備份與遷移
- 完整的資料驗證機制，確保資料安全

## 💬 技術支援與討論

如有任何問題、建議或需要技術支援，歡迎加入 FlyPig 專屬 LINE 群組：

👉 [加入 FlyPig LINE 群組](https://line.me/R/ti/g/@icareuec)

## 🔗 推薦同步參考

如果您對 AI 視覺行銷工具感興趣，歡迎同步參考以下相關專案：

- **[AI-PM-Designer-Pro](https://github.com/mkhsu2002/AI-PM-Designer-Pro)** - AI 視覺行銷生產力工具，基於 Google Gemini 2.5 Flash 與 Gemini 3 Pro Image，從產品圖自動生成完整行銷素材包

- **[AI EC SEO Booster](https://github.com/mkhsu2002/AI-EC-SEO-Booster)** - 由 AI 驅動的智能電商市場分析與 SEO 內容策略生成工具，透過 Google Gemini API 提供專業的市場洞察、競爭分析、買家人物誌描繪，並自動生成 SEO 優化的內容策略與前導頁提示詞

- **[AI Digital Portrait Studio](https://github.com/mkhsu2002/AI_Digital_Portrait_Studio)** - 專為電商設計的 AI 人像圖片生成工具，免去繁複的手動輸入提示詞，整合 Gemini 影像模型與 Firebase，一鍵生成多視角專業人像商品圖，支援自訂風格、背景、姿態等參數

## ☕ 請我喝杯咖啡

如果這個專案對您有幫助，歡迎請我喝杯咖啡：

👉 [Buy me a coffee](https://buymeacoffee.com/mkhsu2002w)

您的支持是我持續開發的動力！

## 📧 聯絡我們

若需協助委外部署或客製化選項開發（例如新增場景、人物姿態），歡迎聯絡：

- **Email**: flypig@icareu.tw
- **LINE ID**: icareuec

## 🤝 貢獻

我們非常歡迎您的貢獻！無論是回報 Bug、提出新功能建議，還是提交程式碼改進，您的參與都讓這個專案變得更好。

### 🚀 快速開始貢獻

1. **Fork 專案** - 在 GitHub 上 Fork 本專案
2. **建立分支** - 建立您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. **提交變更** - 提交您的改動 (`git commit -m 'feat: Add some AmazingFeature'`)
4. **推送分支** - 推送到您的 Fork (`git push origin feature/AmazingFeature`)
5. **建立 PR** - 開啟 Pull Request 並描述您的改動

> 💡 **為什麼要貢獻？** 維護自己的 Fork 很累，而且容易與主線脫節。透過 Pull Request 將您的改動合併回主線，您可以持續享受主線的更新與改進，減少維護成本！

### 📋 貢獻指南

詳細的貢獻指南請參閱 [CONTRIBUTING.md](./CONTRIBUTING.md)，包含：
- 🐛 如何回報 Bug
- 💡 如何提交新功能建議
- 🛠️ 開發環境設置步驟
- ✅ PR 提交檢核表
- 📝 程式碼風格指南

### 🎯 Roadmap

以下是目前急需幫助的功能與改進項目，歡迎貢獻！

#### 🔥 高優先級
- [ ] 🔍 **搜尋功能優化** - 改進搜尋效能與準確度
- [ ] 🎨 **UI/UX 優化** - 提升使用者體驗與無障礙性
- [ ] 📱 **響應式設計** - 優化行動裝置顯示效果
- [ ] 🧪 **測試覆蓋** - 增加單元測試與整合測試

#### 💡 中優先級
- [ ] 📖 **文件完善** - 補充 API 文件與使用範例
- [ ] 🌐 **多語言支援** - 實作 i18n 國際化
- [ ] ⚡ **效能優化** - 改進快取策略與載入速度
- [ ] 🔐 **安全性增強** - 加強資料驗證與錯誤處理

#### 🎨 低優先級
- [ ] 🎭 **主題切換** - 支援深色/淺色主題
- [ ] 📊 **數據分析** - 新增使用統計與分析功能
- [ ] 🔔 **通知系統** - 提醒功能與通知中心
- [ ] 🎯 **快捷鍵** - 鍵盤快捷鍵支援

> 💬 如果您有其他想法，歡迎在 [Issues](https://github.com/mkhsu2002/SocialCoachAI/issues) 中提出討論！

### 👥 Contributors

感謝所有為這個專案做出貢獻的開發者！

<!-- 這裡會自動顯示貢獻者列表 -->
<a href="https://github.com/mkhsu2002/SocialCoachAI/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mkhsu2002/SocialCoachAI" />
</a>

每一位貢獻者都是這個專案的重要一員。您的參與讓這個專案變得更好，也幫助了更多社群經營者。🙏

## 📄 授權條款

本專案採用 MIT 授權。您可以自由使用、修改與自建部署。

**Open sourced by [FlyPig AI](https://flypigai.icareu.tw/)**

詳細授權條款請參閱：[MIT_LICENSE.md](./MIT_LICENSE.md)
