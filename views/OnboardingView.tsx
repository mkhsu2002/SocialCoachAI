
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useApiKey } from '../contexts/ApiKeyContext';
import ApiKeySetupModal from '../components/ApiKeySetupModal';

interface OnboardingViewProps {
  onSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onSave, initialProfile }) => {
  const { isApiKeySet } = useApiKey();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  // 預設值：方便測試使用
  const [profile, setProfile] = useState<UserProfile>(initialProfile || {
    fanPageName: '幻想小說實驗室',
    positioning: '奇幻小說創作 / 寫作幕後 / 世界觀設定',
    destination: '導流至 Penana 觀看連載，累積粉絲出版實體書',
    targetAudience: '18-35歲，喜歡 D&D、日系輕小說、異世界題材的讀者。喜歡看設定集與角色設計圖。',
    targetRegion: '台灣',
    additionalNotes: '',
    copywriterPersona: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* API Key 設定按鈕 */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowApiKeyModal(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isApiKeySet 
              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <i className={`fa-solid ${isApiKeySet ? 'fa-check-circle' : 'fa-key'}`}></i>
          <span className="text-sm font-medium">
            {isApiKeySet ? 'API Key 已設定' : '設定 API Key'}
          </span>
        </button>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900">啟動你的專屬陪跑計劃 🚀</h2>
        <p className="text-slate-600 mt-2">請填寫基本資料，教練將為你量身打造社群突破策略。</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">1. 粉專/帳號名稱</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="例如：小明的小說實驗室"
            value={profile.fanPageName}
            onChange={(e) => setProfile({ ...profile, fanPageName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">2. 內容定位</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="例如：輕小說創作、生活美學、手作教學"
            value={profile.positioning}
            onChange={(e) => setProfile({ ...profile, positioning: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">3. 經營目的（目的地）</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="例如：導流至實體書銷售、增加連載平台點閱、增粉"
            value={profile.destination}
            onChange={(e) => setProfile({ ...profile, destination: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">4. 目標受眾 (TA) 描述</label>
          <textarea
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24"
            placeholder="描述主要讀者的年齡、興趣、痛點（例如：18-25歲，喜歡玄幻小說，常出沒在 Discord）"
            value={profile.targetAudience}
            onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">5. 目標區域</label>
          <select
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={profile.targetRegion}
            onChange={(e) => setProfile({ ...profile, targetRegion: e.target.value })}
          >
            <option value="台灣">台灣</option>
            <option value="香港">香港</option>
            <option value="澳門">澳門</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            6. 補充說明 <span className="text-xs text-slate-500 font-normal">(選填)</span>
          </label>
          <textarea
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24"
            placeholder="可填寫更多粉專關聯的作品或品牌的描述，幫助教練更了解你的內容風格"
            value={profile.additionalNotes}
            onChange={(e) => setProfile({ ...profile, additionalNotes: e.target.value })}
          />
          <p className="text-xs text-slate-500 mt-1">此欄位內容會被 AI 在分析時考慮進去</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            7. 小編人設提示詞 <span className="text-xs text-slate-500 font-normal">(選填)</span>
          </label>
          <textarea
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32"
            placeholder="描述你的小編寫作風格、語氣、特色等（例如：親切幽默、專業嚴謹、輕鬆活潑、文青風格、使用特定口頭禪等）"
            value={profile.copywriterPersona || ''}
            onChange={(e) => setProfile({ ...profile, copywriterPersona: e.target.value })}
          />
          <p className="text-xs text-slate-500 mt-1">
            💡 此設定會影響 AI 生成貼文內容的語氣和風格。例如：「語氣親切幽默，喜歡使用 Emoji，偶爾會分享個人小故事，結尾常用問句與讀者互動」
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          儲存並開始教練陪跑
        </button>
      </form>

      {/* API Key 設定 Modal */}
      <ApiKeySetupModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  );
};

export default OnboardingView;
