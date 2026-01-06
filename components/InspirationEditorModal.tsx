import React, { useState, useEffect } from 'react';
import { DailyInspiration, UserProfile } from '../types';
import { generatePostContent } from '../services/generatePostContent';
import { useApiKey } from '../contexts/ApiKeyContext';
import { useToast } from '../contexts/ToastContext';
import { handleError } from '../utils/errorHandler';
import LoadingSpinner from './LoadingSpinner';

interface InspirationEditorModalProps {
  inspiration: DailyInspiration | null;
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  onPost: (content: string) => void;
  draftContent?: string; // 草稿內容（可選）
}

const InspirationEditorModal: React.FC<InspirationEditorModalProps> = ({
  inspiration,
  profile,
  isOpen,
  onClose,
  onSave,
  onPost,
  draftContent
}) => {
  const { apiKey } = useApiKey();
  const { showToast } = useToast();
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (inspiration) {
      // 如果有草稿，使用草稿；否則使用初始模板
      if (draftContent) {
        setEditedContent(draftContent);
      } else {
        const initialContent = `【靈感主題】\n${inspiration.idea}\n\n【Hook 開場】\n${inspiration.hook}\n\n【建議形式】\n${inspiration.formatSuggestion}\n\n【發文內容】\n`;
        setEditedContent(initialContent);
      }
    }
  }, [inspiration, draftContent]);

  if (!isOpen || !inspiration) return null;

  const handleSave = async () => {
    if (!editedContent.trim()) {
      return;
    }
    setIsSaving(true);
    try {
      await onSave(editedContent);
      // 儲存成功後不關閉 Modal，讓用戶可以繼續編輯或標記已貼文
    } catch (error) {
      console.error('儲存失敗:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePost = async () => {
    if (!editedContent.trim()) {
      return;
    }
    setIsPosting(true);
    try {
      await onPost(editedContent);
      // 貼文成功後關閉 Modal
      onClose();
    } catch (error) {
      console.error('標記已貼文失敗:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!inspiration) return;
    setIsGenerating(true);
    try {
      const generated = await generatePostContent(inspiration, profile, apiKey);
      // 將生成的內容插入到編輯區域的「發文內容」部分
      const lines = editedContent.split('\n');
      const contentIndex = lines.findIndex(line => line.includes('【發文內容】'));
      if (contentIndex !== -1) {
        // 找到「發文內容」標記後，清除之後的所有內容，然後插入新生成的內容
        const beforeContent = lines.slice(0, contentIndex + 1).join('\n');
        const newContent = `${beforeContent}\n${generated}`;
        setEditedContent(newContent);
      } else {
        // 如果沒有找到「發文內容」標記，檢查是否有其他標記
        // 如果有「Hook 開場」或「建議形式」，在最後追加；否則直接替換
        if (editedContent.trim() && !editedContent.includes('【')) {
          // 如果已經有內容但不是模板格式，詢問是否替換
          if (window.confirm('是否要用 AI 生成的內容替換現有內容？')) {
            setEditedContent(`【靈感主題】\n${inspiration.idea}\n\n【Hook 開場】\n${inspiration.hook}\n\n【建議形式】\n${inspiration.formatSuggestion}\n\n【發文內容】\n${generated}`);
          } else {
            // 追加到現有內容後面
            setEditedContent(prev => `${prev}\n\n--- AI 生成內容 ---\n${generated}`);
          }
        } else {
          // 使用模板格式
          setEditedContent(`【靈感主題】\n${inspiration.idea}\n\n【Hook 開場】\n${inspiration.hook}\n\n【建議形式】\n${inspiration.formatSuggestion}\n\n【發文內容】\n${generated}`);
        }
      }
      showToast('AI 生成內容成功！', 'success');
    } catch (error) {
      const errorMessage = handleError(error, {
        defaultMessage: 'AI 生成內容失敗，請檢查 API Key 是否已設定'
      });
      showToast(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-edit text-indigo-600"></i>
              編輯發文內容
            </h3>
            <p className="text-sm text-slate-500 mt-1">根據 AI 靈感撰寫你的發文內容</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-600 transition-all duration-200 transform hover:scale-110 active:scale-95"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          {/* 原始靈感資訊（僅供參考） */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb"></i>
              原始靈感
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-bold text-indigo-700">主題：</span>
                <span className="text-indigo-800">{inspiration.idea}</span>
              </div>
              <div>
                <span className="font-bold text-indigo-700">Hook：</span>
                <span className="text-indigo-800 italic">"{inspiration.hook}"</span>
              </div>
              <div>
                <span className="font-bold text-indigo-700">建議形式：</span>
                <span className="text-indigo-800">{inspiration.formatSuggestion}</span>
              </div>
            </div>
          </div>

          {/* 編輯區域 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">
                <i className="fa-solid fa-pen mr-1"></i>
                發文內容
              </label>
              <button
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>AI 生成中...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-magic"></i>
                    <span>AI 生成內容</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-96 font-mono text-sm leading-relaxed"
              placeholder="在這裡撰寫你的發文內容，或點擊「AI 生成內容」讓 AI 幫你撰寫..."
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-2">
              💡 提示：你可以參考上方的原始靈感資訊，然後撰寫適合你風格的發文內容，或使用「AI 生成內容」功能讓 AI 根據你的基本設定和小編人設自動生成
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-200"
          >
            取消
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !editedContent.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {isSaving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                  儲存中...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save mr-1"></i>
                  儲存草稿
                </>
              )}
            </button>
            <button
              onClick={handlePost}
              disabled={isPosting || !editedContent.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
            >
              {isPosting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                  處理中...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check-circle mr-1"></i>
                  已貼文
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspirationEditorModal;

