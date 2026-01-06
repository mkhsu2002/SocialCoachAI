
import React, { useState, useMemo, useCallback } from 'react';
import { UserProfile, DayPlan, DAY_ORDER, DAY_OF_WEEK_MAP } from '../types';
import { useApiKey } from '../contexts/ApiKeyContext';
import { useToast } from '../contexts/ToastContext';
import { generateWeeklyPlan } from '../services/geminiService';
import { handleError } from '../utils/errorHandler';

interface ScheduleSetupViewProps {
  profile: UserProfile;
  schedule: DayPlan[];
  onSaveSchedule: (schedule: DayPlan[]) => void;
}

const ScheduleSetupView: React.FC<ScheduleSetupViewProps> = ({ profile, schedule, onSaveSchedule }) => {
  const { apiKey } = useApiKey();
  const { showToast } = useToast();
  const [currentSchedule, setCurrentSchedule] = useState<DayPlan[]>(schedule);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const plan = await generateWeeklyPlan(profile, apiKey);
      // Sort plan based on DAY_ORDER
      const sortedPlan = plan.sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
      setCurrentSchedule(sortedPlan);
      setIsEditing(true); // 產生後預設進入編輯模式讓用戶確認
      showToast('課表生成成功！', 'success');
    } catch (error) {
      const errorMessage = handleError(error, {
        defaultMessage: '生成失敗，請檢查 API Key 是否已設定'
      });
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [profile, apiKey, showToast]);

  const handleSave = useCallback(() => {
    onSaveSchedule(currentSchedule);
    setIsEditing(false);
    showToast('課表已儲存', 'success');
  }, [currentSchedule, onSaveSchedule, showToast]);

  const handleEditChange = useCallback((index: number, field: keyof DayPlan, value: string) => {
    setCurrentSchedule(prev => {
      const newSchedule = [...prev];
      newSchedule[index] = { ...newSchedule[index], [field]: value };
      return newSchedule;
    });
  }, []);

  // 如果沒有課表，提示生成
  if (currentSchedule.length === 0 && !loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <i className="fa-solid fa-calendar-days text-5xl text-indigo-200 mb-6"></i>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">制定你的每週經營戰略</h2>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto">
            教練將根據你的「{profile.positioning}」定位與目標，為你規劃一週七天的內容排程。
            這將成為未來每日任務的基礎。
          </p>
          <button
            onClick={handleGenerate}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
            AI 智慧生成課表
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-600 font-medium">教練正在分析你的讀者屬性，規劃最佳發文頻率...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">每週內容排程表</h2>
          <p className="text-slate-500">這是一週的標準作息，每日任務將依此為基礎。</p>
        </div>
        <div className="flex gap-2">
            {isEditing ? (
                 <button
                 onClick={handleSave}
                 className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-all shadow-sm"
               >
                 <i className="fa-solid fa-check mr-2"></i>儲存定案
               </button>
            ) : (
                <button
                onClick={() => setIsEditing(true)}
                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-all"
              >
                <i className="fa-solid fa-pen mr-2"></i>編輯
              </button>
            )}
           
           {isEditing && (
              <button
              onClick={handleGenerate}
              className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-all"
            >
              <i className="fa-solid fa-rotate-right mr-2"></i>重新生成
            </button>
           )}
        </div>
      </header>

      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        <div className="grid grid-cols-12 bg-slate-800 p-4 text-slate-400 text-sm font-bold uppercase tracking-wider border-b border-slate-700">
            <div className="col-span-2">星期</div>
            <div className="col-span-4">內容類型</div>
            <div className="col-span-6">目的</div>
        </div>
        
        <div className="divide-y divide-slate-800">
            {currentSchedule.map((day, index) => (
                <div key={index} className="grid grid-cols-12 p-4 items-center hover:bg-slate-800/50 transition-colors">
                    <div className="col-span-2 text-indigo-400 font-bold">
                        {DAY_OF_WEEK_MAP[day.day] || day.day}
                    </div>
                    <div className="col-span-4 pr-4">
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={day.type}
                                onChange={(e) => handleEditChange(index, 'type', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 text-white px-2 py-1 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        ) : (
                            <span className="text-white font-medium">{day.type}</span>
                        )}
                    </div>
                    <div className="col-span-6">
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={day.purpose}
                                onChange={(e) => handleEditChange(index, 'purpose', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 text-slate-300 px-2 py-1 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        ) : (
                            <span className="text-slate-400 text-sm">{day.purpose}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      {!isEditing && (
          <div className="mt-6 bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
              <i className="fa-solid fa-circle-info mt-1"></i>
              <p className="text-sm">
                  <strong>教練提示：</strong> 設定完成後，請前往「每日任務」查看今天的執行細節。
                  如果需要調整整體策略，隨時可以回來這裡編輯。
              </p>
          </div>
      )}
    </div>
  );
};

export default ScheduleSetupView;
