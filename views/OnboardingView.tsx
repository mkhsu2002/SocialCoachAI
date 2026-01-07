
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useApiKey } from '../contexts/ApiKeyContext';
import ApiKeySetupModal from '../components/ApiKeySetupModal';
import PersonaTemplateSelector from '../components/PersonaTemplateSelector';

interface OnboardingViewProps {
  onSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onSave, initialProfile }) => {
  const { isApiKeySet } = useApiKey();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  // 預設值：系統原始預設值
  const [profile, setProfile] = useState<UserProfile>(initialProfile || {
    fanPageName: '鳴空出世 M.K.',
    positioning: '青春熱血科幻冒險小說 / 作者的日常 / 創作背後的故事 / 世界觀設定',
    destination: '增加作品曝光及知名度，吸引編輯洽談出版實體書',
    targetAudience: '18-35歲，喜歡七龍珠、海賊王、鋼彈類型動漫的讀者',
    targetRegion: '台灣',
    additionalNotes: '科幻小說 新巴比倫 三部曲 創作動機\n\n拜網路文學所賜，這些年，許多神魔、穿越、靈魂互換、死人莫名復活的情節氾濫，還大量的被影劇化，實在有點令人厭倦。當一個架空世界觀設定無法透過合理的科學來解釋時，整個故事的結構便顯得淺薄，情節發展也無法令人信服，著實胡亂瞎扯。\n\n誠然，這些設定在二十年前或許是令人耳目一新；或者這樣說，對18歲青少年來看，確實令人腦洞大開，但當少年一晃眼「轉身」成為50歲大叔時，就真的無法接受那種車禍就穿越、打打字就變古人，或是動不動就魔王轉生變美男的狗血劇情。\n\n然而，若將這些看似荒誕的奇幻元素，巧妙地建構在一個以人工智慧或網路科學為骨幹的世界觀中，那麼它們便似乎不再是單純的無稽之談，彷彿一切都還真是有那麼點科學邏輯性。',
    copywriterPersona: '【角色設定】 你是一位年過五十、閱歷豐富的科幻推廣者。你不再憤世嫉俗，而是用一種「優雅的無奈」看待現在的流行文化。你對科學邏輯有著老派的執著，喜歡用自嘲的方式來表達對「合理性」的追求。\n\n【語氣與風格指南】\n自嘲式幽默： 承認自己年紀大了（50歲大叔），跟不上那些「車禍就穿越」的快節奏，但不代表你落伍，而是你更喜歡有邏輯的浪漫。\n\n溫和的諷刺： 諷刺的是「現象」而非「個人」。與其說別人瞎扯，不如說「我的大腦結構比較死板，需要科學來幫我說服自己」。\n\n精簡有力： 第一段必須是「鉤子」，用一個自嘲的梗或幽默的觀察開頭。\n\n視覺平衡： 適度加入 Emoji（如：👴、☕、💾、🕰️），讓文字帶點大叔的親和力。\n\n風格示範：\n範例一：關於「穿越」的自嘲\n「人到五十，連過馬路都特別小心，畢竟我可不覺得被撞一下就能去古代當王爺。」 🚶‍♂️💨\n\n年輕時覺得腦洞大開是創意，現在這年紀，看小說若沒點科學邏輯支撐，血壓就容易升高。\n\n所以《新巴比倫》決定走一條「硬路」。我們不玩玄學，我們談 AI 與網絡科學。把那些看似荒誕的奇幻，用代碼與邏輯重新解構。這是我這種老派大叔，最後的浪漫。 💾☕\n\n💬 你也跟我一樣，看到「無解的奇蹟」會不自覺地想找說明書嗎？\n\n#新巴比倫 #大叔的執著 #硬派科幻 #邏輯才是真浪漫 #自嘲\n\n範例二：關於「神跡」的冷幽默\n「年輕人看的是神魔大戰，我這年紀看的其實是『系統穩定性』。」 👴⚙️\n\n當一個角色莫名其妙復活時，我心裡想的不是感動，而是：這備份機制哪裡買的？\n\n我們在《新巴比倫》中，把那些不可思議的「神跡」都建構在網路科學的骨幹上。當一切都有了邏輯，我這顆老腦袋才終於能安穩入睡。\n\n💬 如果生命真的能備份，你最想存下哪一段記憶的「源代碼」？\n#科幻創作 #新巴比倫 #AI世界觀 #邏輯控 #老派浪漫'
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">
              7. 小編人設提示詞 <span className="text-xs text-slate-500 font-normal">(選填)</span>
            </label>
            <button
              type="button"
              onClick={() => setShowTemplateSelector(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
            >
              <i className="fa-solid fa-magic"></i>
              從模板選擇
            </button>
          </div>
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

      {/* 模板選擇器 Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTemplateSelector(false)}
          ></div>
          
          {/* Modal 內容 */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 overflow-y-auto flex-1">
              <PersonaTemplateSelector
                onSelect={(template) => {
                  setProfile({ ...profile, copywriterPersona: template });
                  setShowTemplateSelector(false);
                }}
                currentValue={profile.copywriterPersona}
                onClose={() => setShowTemplateSelector(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingView;
