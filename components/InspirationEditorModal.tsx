import React, { useState, useEffect } from 'react';
import { DailyInspiration } from '../types';

interface InspirationEditorModalProps {
  inspiration: DailyInspiration | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  onPost: (content: string) => void;
  draftContent?: string; // 草稿內容（可選）
}

const InspirationEditorModal: React.FC<InspirationEditorModalProps> = ({
  inspiration,
  isOpen,
  onClose,
  onSave,
  onPost,
  draftContent
}) => {
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

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
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <i className="fa-solid fa-pen mr-1"></i>
              發文內容
            </label>
            <textarea
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-96 font-mono text-sm leading-relaxed"
              placeholder="在這裡撰寫你的發文內容..."
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-2">
              💡 提示：你可以參考上方的原始靈感資訊，然後撰寫適合你風格的發文內容
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

