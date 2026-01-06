import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../contexts/ToastContext';
import { useAppData } from '../contexts/AppDataContext';
import { downloadDataAsFile, importDataFromFile } from '../utils/dataExport';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataExportModal: React.FC<DataExportModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const { clearAllData } = useAppData();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      downloadDataAsFile();
      showToast('資料匯出成功！', 'success');
      onClose();
    } catch (error) {
      showToast('資料匯出失敗', 'error');
    }
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      showToast('請選擇檔案', 'warning');
      return;
    }

    setIsImporting(true);
    try {
      const result = await importDataFromFile(file);
      if (result.success) {
        showToast('資料匯入成功！請重新整理頁面', 'success');
        // 延遲關閉，讓使用者看到訊息
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        showToast(result.error || '資料匯入失敗', 'error');
      }
    } catch (error) {
      showToast('資料匯入失敗', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('確定要清除所有資料嗎？此操作無法復原！')) {
      clearAllData();
      showToast('所有資料已清除', 'success');
      onClose();
    }
  };

  // 使用 Portal 將 Modal 渲染到 body 最外層，避免被其他元素的 stacking context 影響
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ zIndex: 9999 }}
      ></div>
      
      {/* Modal 內容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ zIndex: 10000 }}>
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        {/* Modal 主體 */}
        <div className="p-8">
          {/* 標題 */}
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
            資料備份與還原
          </h2>

          {/* 匯出區塊 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-download text-indigo-600"></i>
              匯出資料
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              將所有資料匯出為 JSON 檔案，可用於備份或遷移。
            </p>
            <button
              onClick={handleExport}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              <i className="fa-solid fa-download mr-2"></i>
              下載備份檔案
            </button>
          </div>

          {/* 分隔線 */}
          <div className="border-t border-slate-200 my-6"></div>

          {/* 匯入區塊 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-upload text-green-600"></i>
              匯入資料
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              從備份檔案還原資料。匯入後會覆蓋現有資料。
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  匯入中...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-upload mr-2"></i>
                  選擇備份檔案
                </>
              )}
            </button>
          </div>

          {/* 分隔線 */}
          <div className="border-t border-slate-200 my-6"></div>

          {/* 清除資料區塊 */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-trash text-red-600"></i>
              清除資料
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              清除所有本地儲存的資料。此操作無法復原，請謹慎使用。
            </p>
            <button
              onClick={handleClearAll}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
            >
              <i className="fa-solid fa-trash mr-2"></i>
              清除所有資料
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DataExportModal;

