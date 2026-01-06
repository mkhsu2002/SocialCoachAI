
import React, { useState, useCallback, memo, useMemo } from 'react';
import { ResourceItem } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useApiKey } from '../contexts/ApiKeyContext';
import { searchVaultItems } from '../utils/searchUtils';
import { extractContentFromUrl, isValidUrl } from '../utils/urlContentExtractor';
import { handleError } from '../utils/errorHandler';
import SearchInput from '../components/SearchInput';
import LoadingSpinner from '../components/LoadingSpinner';

interface VaultViewProps {
  items: ResourceItem[];
  onAdd: (item: Omit<ResourceItem, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

const VaultView: React.FC<VaultViewProps> = ({ items, onAdd, onDelete }) => {
  const { showToast } = useToast();
  const { apiKey } = useApiKey();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<ResourceItem['type']>('inspiration');
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isExtractingUrl, setIsExtractingUrl] = useState(false);

  // 搜尋過濾
  const filteredItems = useMemo(() => {
    return searchVaultItems(items, searchQuery);
  }, [items, searchQuery]);

  const handleAdd = useCallback(() => {
    if (!newTitle || !newContent) {
      showToast('請填寫標題和內容', 'warning');
      return;
    }
    onAdd({ title: newTitle, content: newContent, type: newType });
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
    showToast('素材已加入庫房', 'success');
  }, [newTitle, newContent, newType, onAdd, showToast]);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'inspiration' || value === 'asset' || value === 'character_design') {
      setNewType(value);
    }
  }, []);

  const handleExtractFromUrl = useCallback(async () => {
    if (!urlInput.trim()) {
      showToast('請輸入網址', 'warning');
      return;
    }

    if (!isValidUrl(urlInput.trim())) {
      showToast('請輸入有效的網址', 'warning');
      return;
    }

    setIsExtractingUrl(true);
    try {
      const extracted = await extractContentFromUrl(urlInput.trim(), apiKey);
      setNewTitle(extracted.title);
      setNewContent(extracted.content);
      setUrlInput('');
      showToast('內容抓取成功！', 'success');
    } catch (error) {
      const errorMessage = handleError(error, {
        defaultMessage: '無法抓取網址內容，請檢查 API Key 是否已設定'
      });
      showToast(errorMessage, 'error');
    } finally {
      setIsExtractingUrl(false);
    }
  }, [urlInput, apiKey, showToast]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">素材與靈感庫</h2>
          <p className="text-slate-500">儲存你的創作素材，教練會自動匹配發文時機。</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2"
        >
          <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>
          {isAdding ? '取消' : '新增素材'}
        </button>
      </header>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 mb-8 shadow-md">
          <h3 className="font-bold text-slate-800 mb-4">新增內容</h3>
          <div className="space-y-4">
            {/* 網址抓取功能 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                <i className="fa-solid fa-link mr-1"></i>
                從網址自動抓取內容（選填）
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="貼上網址，例如：https://example.com/article"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExtractFromUrl()}
                  disabled={isExtractingUrl}
                />
                <button
                  onClick={handleExtractFromUrl}
                  disabled={isExtractingUrl || !urlInput.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isExtractingUrl ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="text-sm">抓取中...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-download"></i>
                      <span className="text-sm">抓取</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                💡 提示：輸入網址後點擊「抓取」，系統會根據網址生成內容摘要建議。
                <br />
                📝 如需匯入 NotebookLM 筆記本內容，請先從 NotebookLM 複製內容，然後貼到下方「內容描述/筆記」欄位。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">標題</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例如：主角側臉設定圖"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">類型</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newType}
                  onChange={handleTypeChange}
                >
                  <option value="inspiration">經營靈感</option>
                  <option value="asset">發文素材</option>
                  <option value="character_design">角色設定/圖稿</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">內容描述/筆記</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                placeholder="輸入素材細節，方便教練提供建議..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700"
            >
              確認加入庫房
            </button>
          </div>
        </div>
      )}

      {/* 搜尋輸入 */}
      {items.length > 0 && (
        <div className="mb-6">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="搜尋素材標題、內容或類型..."
          />
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <i className="fa-solid fa-box-open text-4xl text-slate-300 mb-4"></i>
          <p className="text-slate-500">目前還沒有素材，快來新增第一份靈感吧！</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <i className="fa-solid fa-magnifying-glass text-4xl text-slate-300 mb-4"></i>
          <p className="text-slate-500">找不到符合「{searchQuery}」的素材</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${
                  item.type === 'character_design' ? 'bg-purple-100 text-purple-700' :
                  item.type === 'asset' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.type === 'character_design' ? '角色設定' : item.type === 'asset' ? '發文素材' : '經營靈感'}
                </span>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">{item.content}</p>
              <p className="text-[10px] text-slate-400">建立時間：{new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(VaultView);
