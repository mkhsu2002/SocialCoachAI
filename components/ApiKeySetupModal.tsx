import React, { useState } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import { validateApiKeyFormat } from '../utils/apiKeyValidator';

interface ApiKeySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const ApiKeySetupModal: React.FC<ApiKeySetupModalProps> = ({ isOpen, onClose, onSave }) => {
  const { apiKey, setApiKey } = useApiKey();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmedKey = inputKey.trim();
    
    // 驗證 API Key 格式
    const validation = validateApiKeyFormat(trimmedKey);
    if (!validation.valid) {
      setError(validation.error || 'API Key 格式無效');
      return;
    }
    
    setApiKey(trimmedKey);
    setError('');
    onSave?.();
    onClose();
  };

  const handleClose = () => {
    setInputKey(apiKey || '');
    setError('');
    setShowKey(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      
      {/* Modal 內容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* 關閉按鈕 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        {/* Modal 主體 */}
        <div className="p-8">
          {/* 圖示 */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-key text-white text-3xl"></i>
            </div>
          </div>

          {/* 標題 */}
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
            Setup Gemini API
          </h2>

          {/* 說明文字 */}
          <div className="space-y-2 mb-6 text-center">
            <p className="text-sm text-slate-600">
              為了確保安全，請使用您自己的 API Key。
            </p>
            <p className="text-sm text-slate-600">
              您的 Key 只會儲存在瀏覽器中，不會上傳至伺服器。
            </p>
          </div>

          {/* 輸入欄位 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              GEMINI API KEY
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setError('');
                }}
                placeholder="輸入您的 Gemini API Key"
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  error ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className={`fa-solid ${showKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* 儲存按鈕 */}
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mb-4"
          >
            開始使用
          </button>

          {/* 取得 Key 連結 */}
          <div className="text-center">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              還沒有 Key? 點此免費獲取
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySetupModal;

