
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { UserProfile, DayPlan, DailyInspiration, MemoryEntry, AppState, DayOfWeek } from '../types';
import { useApiKey } from '../contexts/ApiKeyContext';
import { useToast } from '../contexts/ToastContext';
import { generateDailyInspirations } from '../services/geminiService';
import { handleError } from '../utils/errorHandler';
import { getDailyInspirations, setDailyInspirations } from '../utils/dailyInspirationsStorage';
import LoadingSpinner from '../components/LoadingSpinner';

interface DashboardViewProps {
  profile: UserProfile;
  schedule: DayPlan[];
  memories: MemoryEntry[];
  onNavigate: (state: AppState) => void;
  onAddMemory: (content: string, category: MemoryEntry['category']) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ profile, schedule, memories, onNavigate, onAddMemory }) => {
  const { apiKey } = useApiKey();
  const { showToast } = useToast();
  const [inspirations, setInspirations] = useState<DailyInspiration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [todayPlan, setTodayPlan] = useState<DayPlan | null>(null);

  // 取得今天星期幾 (Monday, Tuesday...) - 使用 useMemo 快取
  const todayDayName = useMemo<DayOfWeek>(() => {
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  useEffect(() => {
    // 檢查是否有課表
    if (schedule.length > 0) {
      const plan = schedule.find(d => d.day === todayDayName);
      setTodayPlan(plan || null);
    }
  }, [schedule, todayDayName]);

  // 載入今日已儲存的靈感
  useEffect(() => {
    const savedInspirations = getDailyInspirations();
    if (savedInspirations.length > 0) {
      setInspirations(savedInspirations);
    }
  }, []);

  const fetchInspirations = useCallback(async () => {
    if (!todayPlan) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateDailyInspirations(profile, todayPlan, memories, apiKey);
      setInspirations(data);
      // 儲存到 localStorage，避免切換畫面時消失
      setDailyInspirations(data);
      showToast('靈感生成成功！', 'success');
    } catch (err) {
      const errorMessage = handleError(err, {
        defaultMessage: '靈感生成失敗，請檢查 API Key 是否已設定'
      });
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [todayPlan, profile, memories, apiKey, showToast]);

  // 如果沒有課表，引導去設定
  if (schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="bg-indigo-50 p-6 rounded-full mb-6 w-24 h-24 flex items-center justify-center">
            <i className="fa-solid fa-clipboard-list text-4xl text-indigo-600"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">尚未設定週課表</h2>
        <p className="text-slate-600 mb-8 max-w-md">
          為了提供精準的每日建議，教練需要先為你規劃一週的經營戰略。
        </p>
        <button
          onClick={() => onNavigate(AppState.SCHEDULE_SETUP)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
        >
          前往制定課表
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 relative">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">👋 {profile.fanPageName}，早安！</h2>
        <p className="text-slate-500">今天是 {new Date().toLocaleDateString()}，讓我們來看看今天的任務。</p>
      </header>

      {/* 今日策略卡片 */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-xl text-white mb-10 border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <i className="fa-solid fa-calendar-check text-9xl"></i>
        </div>
        
        {todayPlan ? (
             <div className="relative z-10">
                <div className="inline-block bg-indigo-500/20 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-indigo-500/30">
                    今日課表
                </div>
                <h3 className="text-3xl font-bold mb-2 text-white">{todayPlan.type}</h3>
                <p className="text-slate-400 text-lg mb-8 flex items-center gap-2">
                    <i className="fa-solid fa-crosshairs text-indigo-400"></i>
                    目的：{todayPlan.purpose}
                </p>
                
                {inspirations.length === 0 ? (
                    <button
                        onClick={fetchInspirations}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/50 flex items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span>思考中...</span>
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-lightbulb"></i> 給我 3 個發文靈感
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={fetchInspirations}
                        disabled={loading}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                        <i className="fa-solid fa-rotate"></i> 換一批靈感
                    </button>
                )}
             </div>
        ) : (
            <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">今天休息日？</h3>
                <p className="text-slate-400">課表中今天沒有安排任務，如果想加強經營，請調整課表。</p>
                 <button
                    onClick={() => onNavigate(AppState.SCHEDULE_SETUP)}
                    className="mt-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
                 >
                    調整課表
                 </button>
            </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-xl"></i>
          {error}
        </div>
      )}

      {/* 靈感列表 */}
      {inspirations.length > 0 && (
        <div className="mb-12 animate-[fadeIn_0.5s_ease-out]">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles text-amber-500"></i>
                為你精選的靈感
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {inspirations.map((insp, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="mb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Option {idx + 1}</span>
                            <h4 className="text-xl font-bold text-indigo-700 mt-1">{insp.idea}</h4>
                        </div>
                        <div className="flex-1 space-y-3">
                             <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-xs text-slate-500 font-bold mb-1">建議形式</p>
                                <p className="text-sm text-slate-700">{insp.formatSuggestion}</p>
                             </div>
                             <div>
                                <p className="text-xs text-slate-500 font-bold mb-1">Hook 範例</p>
                                <p className="text-sm text-slate-800 italic">"{insp.hook}"</p>
                             </div>
                        </div>
                        <button 
                            onClick={() => onAddMemory(`採用靈感：${insp.idea}`, 'insight')}
                            className="mt-6 w-full py-2 border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                            <i className="fa-solid fa-check mr-2"></i>決定做這個
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Floating Action Button for Guide */}
      <button
        onClick={() => setShowGuide(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all z-40 group flex items-center gap-2 pr-6"
      >
        <div className="w-8 h-8 flex items-center justify-center">
            <i className="fa-solid fa-book-open text-xl"></i>
        </div>
        <span className="font-bold">實戰指南</span>
      </button>

      {/* Guide Modal (保持不變，但為節省篇幅省略內容，僅保留結構) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowGuide(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden relative shadow-2xl flex flex-col">
            {/* ... Guide content same as previous ... */}
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-graduation-cap text-indigo-600"></i>
                  社群經營實戰指南
                </h3>
              </div>
              <button onClick={() => setShowGuide(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-8">
              {/* 基礎概念 */}
              <section>
                <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-lightbulb text-amber-500"></i>
                  基礎概念
                </h4>
                <div className="space-y-3 text-slate-700">
                  <p className="leading-relaxed">
                    社群經營不是單純的發文，而是建立與粉絲的深度連結。成功的社群經營需要<strong className="text-indigo-600">策略規劃</strong>、<strong className="text-indigo-600">內容品質</strong>和<strong className="text-indigo-600">持續互動</strong>。
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>明確的定位能幫助你吸引對的受眾</li>
                    <li>內容要有價值，不只是推銷產品</li>
                    <li>與粉絲互動，建立真實的連結</li>
                    <li>保持一致性，讓品牌形象清晰</li>
                  </ul>
                </div>
              </section>

              {/* 內容策略 */}
              <section>
                <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-chess text-indigo-500"></i>
                  內容策略
                </h4>
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <h5 className="font-bold text-indigo-900 mb-2">1. 內容類型平衡</h5>
                    <p className="text-sm text-indigo-800">
                      建議每週內容包含：<strong>40% 價值型內容</strong>（教學、乾貨）、<strong>30% 互動型內容</strong>（投票、問答）、<strong>30% 人設型內容</strong>（幕後、生活感）。
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                    <h5 className="font-bold text-amber-900 mb-2">2. Hook 的重要性</h5>
                    <p className="text-sm text-amber-800">
                      前 3 秒決定用戶是否停留。使用<strong>疑問句</strong>、<strong>數字</strong>、<strong>對比</strong>或<strong>故事開頭</strong>來吸引注意力。
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h5 className="font-bold text-green-900 mb-2">3. 內容規劃</h5>
                    <p className="text-sm text-green-800">
                      使用<strong>週課表</strong>規劃內容，確保每天都有明確的主題和目的。避免臨時起意，保持內容的連貫性和策略性。
                    </p>
                  </div>
                </div>
              </section>

              {/* 演算法優化 */}
              <section>
                <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-green-500"></i>
                  演算法優化
                </h4>
                <div className="space-y-3 text-slate-700">
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <div>
                      <strong>互動率優先：</strong>回覆留言、按讚、分享比粉絲數更重要
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <div>
                      <strong>發布時機：</strong>觀察粉絲活躍時間，在高峰時段發布
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <div>
                      <strong>避免降權：</strong>不要使用過多 Hashtag、避免過度推銷、不要買粉絲
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <div>
                      <strong>影片優先：</strong>影片內容通常獲得更高的觸及率和互動
                    </div>
                  </div>
                </div>
              </section>

              {/* 互動技巧 */}
              <section>
                <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-comments text-blue-500"></i>
                  互動技巧
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h5 className="font-bold text-slate-900 mb-2">💬 留言回覆</h5>
                    <p className="text-sm text-slate-600">
                      24 小時內回覆留言，使用個人化回應，讓粉絲感受到被重視
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h5 className="font-bold text-slate-900 mb-2">📊 投票互動</h5>
                    <p className="text-sm text-slate-600">
                      使用投票功能了解粉絲偏好，增加互動率的同時收集數據
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h5 className="font-bold text-slate-900 mb-2">🎁 限時活動</h5>
                    <p className="text-sm text-slate-600">
                      定期舉辦小活動、抽獎或限時優惠，增加粉絲參與度
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h5 className="font-bold text-slate-900 mb-2">📸 故事功能</h5>
                    <p className="text-sm text-slate-600">
                      善用限時動態分享日常，增加與粉絲的親近感
                    </p>
                  </div>
                </div>
              </section>

              {/* 常見錯誤 */}
              <section>
                <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
                  常見錯誤與避免方法
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <i className="fa-solid fa-xmark text-red-600 mt-1"></i>
                    <div>
                      <strong className="text-red-900">過度推銷：</strong>
                      <p className="text-sm text-red-800 mt-1">每篇都是產品廣告，粉絲會感到疲乏。建議 80% 價值內容，20% 推廣內容。</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <i className="fa-solid fa-xmark text-red-600 mt-1"></i>
                    <div>
                      <strong className="text-red-900">不一致的風格：</strong>
                      <p className="text-sm text-red-800 mt-1">今天搞笑、明天嚴肅，粉絲會感到困惑。建立明確的品牌調性並保持一致。</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <i className="fa-solid fa-xmark text-red-600 mt-1"></i>
                    <div>
                      <strong className="text-red-900">忽略數據：</strong>
                      <p className="text-sm text-red-800 mt-1">不分析哪些內容表現好，無法優化策略。定期檢視數據，調整內容方向。</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 成長建議 */}
              <section>
                <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-rocket text-purple-500"></i>
                  持續成長建議
                </h4>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg border border-indigo-200">
                  <ol className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-3">
                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <div>
                        <strong>建立素材庫：</strong>平時收集靈感、素材和角色設定，發文時就不會沒有靈感
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <div>
                        <strong>記錄成長筆記：</strong>記錄經營洞察、里程碑和用戶回饋，建立長期記憶
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <div>
                        <strong>定期檢視策略：</strong>每週或每月檢視內容表現，調整週課表和內容方向
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                      <div>
                        <strong>保持耐心：</strong>社群經營是長期投資，需要時間累積信任和影響力
                      </div>
                    </li>
                  </ol>
                </div>
              </section>

              {/* 工具推薦 */}
              <section>
                <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-toolbox text-slate-500"></i>
                  善用工具
                </h4>
                <div className="text-slate-700 space-y-2">
                  <p>本應用程式提供以下功能幫助你更有效率地經營社群：</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>週課表規劃：</strong>AI 協助規劃一週內容策略</li>
                    <li><strong>每日靈感生成：</strong>根據課表自動生成發文靈感</li>
                    <li><strong>素材庫管理：</strong>儲存靈感、素材和角色設定</li>
                    <li><strong>AI 教練對話：</strong>隨時詢問經營問題，獲得專業建議</li>
                    <li><strong>成長筆記：</strong>記錄重要洞察和里程碑</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(DashboardView);
