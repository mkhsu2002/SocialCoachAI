
import React, { useState, useCallback, memo, useMemo, useRef } from 'react';
import { ResourceItem, ResourceItemType, RESOURCE_TYPE_LABELS } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useApiKey } from '../contexts/ApiKeyContext';
import { searchVaultItems } from '../utils/searchUtils';
import { extractContentFromUrl, isValidUrl } from '../utils/urlContentExtractor';
import { analyzeAndSplitContent } from '../services/contentAnalyzer';
import { readFileContent, validateFileSize, getFileSizeText } from '../utils/fileReader';
import { handleError } from '../utils/errorHandler';
import SearchInput from '../components/SearchInput';
import LoadingSpinner from '../components/LoadingSpinner';
import ResourceItemModal from '../components/ResourceItemModal';

interface VaultViewProps {
  items: ResourceItem[];
  onAdd: (item: Omit<ResourceItem, 'id' | 'createdAt'>) => void;
  onAddMultiple: (items: Omit<ResourceItem, 'id' | 'createdAt'>[]) => void;
  onUpdate: (id: string, updates: Partial<ResourceItem>) => void;
  onDelete: (id: string) => void;
}

type InputMode = 'manual' | 'text' | 'file' | 'url' | 'google' | 'notebooklm';

const VaultView: React.FC<VaultViewProps> = ({ items, onAdd, onAddMultiple, onUpdate, onDelete }) => {
  const { showToast } = useToast();
  const { apiKey } = useApiKey();
  const [isAdding, setIsAdding] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 手動輸入狀態
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<ResourceItem['type']>('inspiration');
  
  // 文字輸入狀態
  const [textInput, setTextInput] = useState('');
  
  // 文件上傳狀態
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // URL 輸入狀態
  const [urlInput, setUrlInput] = useState('');
  
  // Google Drive / NotebookLM 輸入狀態
  const [externalUrl, setExternalUrl] = useState('');
  
  // AI 分析狀態
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<Omit<ResourceItem, 'id' | 'createdAt'>[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isExtractingUrl, setIsExtractingUrl] = useState(false);

  // 搜尋過濾
  const filteredItems = useMemo(() => {
    return searchVaultItems(items, searchQuery);
  }, [items, searchQuery]);

  // 手動新增
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
    const value = e.target.value as ResourceItemType;
    setNewType(value);
  }, []);

  // 從 URL 抓取內容
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
      setTextInput(extracted.content);
      setInputMode('text');
      setUrlInput('');
      showToast('內容抓取成功！請點擊「AI 分析拆解」', 'success');
    } catch (error) {
      const errorMessage = handleError(error, {
        defaultMessage: '無法抓取網址內容，請檢查 API Key 是否已設定'
      });
      showToast(errorMessage, 'error');
    } finally {
      setIsExtractingUrl(false);
    }
  }, [urlInput, apiKey, showToast]);

  // 處理文件上傳
  const handleFileSelect = useCallback(async (file: File) => {
    if (!validateFileSize(file, 5)) {
      showToast('文件大小不能超過 5MB', 'warning');
      return;
    }

    setSelectedFile(file);
    setIsAnalyzing(true);
    try {
      const content = await readFileContent(file);
      setTextInput(content);
      setInputMode('text');
      showToast('文件讀取成功！請點擊「AI 分析拆解」', 'success');
    } catch (error) {
      const errorMessage = handleError(error, {
        defaultMessage: '無法讀取文件內容'
      });
      showToast(errorMessage, 'error');
      setSelectedFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [showToast]);

  // AI 分析拆解內容
  const handleAnalyzeContent = useCallback(async () => {
    const content = textInput.trim();
    if (!content) {
      showToast('請先輸入或上傳內容', 'warning');
      return;
    }

    setIsAnalyzing(true);
    try {
      const items = await analyzeAndSplitContent(content, apiKey);
      setGeneratedItems(items);
      setEditingItemIndex(null);
      showToast(`成功拆解成 ${items.length} 個素材！`, 'success');
    } catch (error) {
      const errorMessage = handleError(error, {
        defaultMessage: '內容分析失敗，請檢查 API Key 是否已設定'
      });
      showToast(errorMessage, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  }, [textInput, apiKey, showToast]);

  // 編輯生成的素材
  const handleEditGeneratedItem = useCallback((index: number, updates: Partial<ResourceItem>) => {
    setGeneratedItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], ...updates };
      return newItems;
    });
  }, []);

  // 刪除生成的素材
  const handleDeleteGeneratedItem = useCallback((index: number) => {
    setGeneratedItems(prev => prev.filter((_, i) => i !== index));
    if (editingItemIndex === index) {
      setEditingItemIndex(null);
    }
  }, [editingItemIndex]);

  // 確認加入所有生成的素材
  const handleConfirmGeneratedItems = useCallback(() => {
    if (generatedItems.length === 0) {
      showToast('沒有可加入的素材', 'warning');
      return;
    }

    // 使用批量加入方法，一次性加入所有素材
    try {
      onAddMultiple(generatedItems);
      setGeneratedItems([]);
      setTextInput('');
      setInputMode('manual');
      setIsAdding(false);
    } catch (error) {
      showToast('加入素材時發生錯誤', 'error');
    }
  }, [generatedItems, onAddMultiple, showToast]);

  // 打開素材詳細檢視
  const handleViewItem = useCallback((item: ResourceItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  // 關閉素材詳細檢視
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(null);
  }, []);

  // 重置表單
  const handleReset = useCallback(() => {
    setInputMode('manual');
    setNewTitle('');
    setNewContent('');
    setTextInput('');
    setUrlInput('');
    setExternalUrl('');
    setSelectedFile(null);
    setGeneratedItems([]);
    setEditingItemIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">素材與靈感庫</h2>
          <p className="text-slate-500">儲存你的創作素材，教練會自動匹配發文時機。</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) {
              handleReset();
            }
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2"
        >
          <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>
          {isAdding ? '取消' : '新增素材'}
        </button>
      </header>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 mb-8 shadow-md">
          <h3 className="font-bold text-slate-800 mb-4">新增內容</h3>
          
          {/* 輸入方式選擇 */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 mb-2">選擇輸入方式</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                onClick={() => setInputMode('manual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  inputMode === 'manual'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <i className="fa-solid fa-keyboard mr-1"></i>手動輸入
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  inputMode === 'text'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <i className="fa-solid fa-paste mr-1"></i>貼上文字
              </button>
              <button
                onClick={() => {
                  setInputMode('file');
                  fileInputRef.current?.click();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  inputMode === 'file'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <i className="fa-solid fa-file-upload mr-1"></i>上傳文件
              </button>
              <button
                onClick={() => setInputMode('url')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  inputMode === 'url'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <i className="fa-solid fa-link mr-1"></i>網址抓取
              </button>
              <button
                onClick={() => setInputMode('google')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  inputMode === 'google'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <i className="fa-brands fa-google-drive mr-1"></i>Google 雲端
              </button>
              <button
                onClick={() => setInputMode('notebooklm')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  inputMode === 'notebooklm'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <i className="fa-solid fa-book mr-1"></i>NotebookLM
              </button>
            </div>
          </div>

          {/* 手動輸入模式 */}
          {inputMode === 'manual' && (
            <div className="space-y-4">
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
                    {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
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
          )}

          {/* 文字輸入模式 */}
          {inputMode === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  <i className="fa-solid fa-paste mr-1"></i>
                  貼上文字內容
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-48"
                  placeholder="貼上要分析的內容（文章、筆記、文件內容等）..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-2">
                  💡 AI 會自動將內容拆解成多個素材項目
                </p>
              </div>
              <button
                onClick={handleAnalyzeContent}
                disabled={isAnalyzing || !textInput.trim()}
                className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>AI 分析中...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-magic"></i>
                    <span>AI 分析拆解</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 文件上傳模式 */}
          {inputMode === 'file' && (
            <div className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.markdown,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                  }}
                />
                {selectedFile ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900">{selectedFile.name}</p>
                        <p className="text-sm text-green-700">{getFileSizeText(selectedFile.size)}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <i className="fa-solid fa-cloud-upload text-4xl text-slate-400 mb-4"></i>
                    <p className="text-slate-600 mb-2">點擊選擇文件或拖放文件到此處</p>
                    <p className="text-xs text-slate-500">支援 .txt, .md, .markdown, .json（最大 5MB）</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      選擇文件
                    </button>
                  </div>
                )}
              </div>
              {textInput && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">文件內容已讀取，請點擊「AI 分析拆解」</p>
                  <button
                    onClick={handleAnalyzeContent}
                    disabled={isAnalyzing}
                    className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>AI 分析中...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-magic"></i>
                        <span>AI 分析拆解</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* URL 輸入模式 */}
          {inputMode === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  <i className="fa-solid fa-link mr-1"></i>
                  輸入網址
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
              </div>
            </div>
          )}

          {/* Google Drive / NotebookLM 輸入模式 */}
          {(inputMode === 'google' || inputMode === 'notebooklm') && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 mb-2">
                  <i className="fa-solid fa-info-circle mr-1"></i>
                  {inputMode === 'google' 
                    ? 'Google 雲端檔案整合功能開發中。目前請先將檔案內容複製貼上，或使用「貼上文字」模式。'
                    : 'NotebookLM 筆記本整合功能開發中。目前請先從 NotebookLM 複製內容，然後使用「貼上文字」模式。'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  <i className="fa-solid fa-paste mr-1"></i>
                  貼上內容
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-48"
                  placeholder="從 Google Drive 或 NotebookLM 複製內容後貼上..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
              </div>
              <button
                onClick={handleAnalyzeContent}
                disabled={isAnalyzing || !textInput.trim()}
                className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>AI 分析中...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-magic"></i>
                    <span>AI 分析拆解</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 生成的素材列表 */}
          {generatedItems.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800">
                  <i className="fa-solid fa-magic mr-2 text-indigo-600"></i>
                  AI 生成的素材 ({generatedItems.length} 個)
                </h4>
                <button
                  onClick={handleConfirmGeneratedItems}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <i className="fa-solid fa-check mr-1"></i>
                  全部加入庫房
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedItems.map((item, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    {editingItemIndex === index ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">標題</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            value={item.title}
                            onChange={(e) => handleEditGeneratedItem(index, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">類型</label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            value={item.type}
                            onChange={(e) => {
                              handleEditGeneratedItem(index, { type: e.target.value as ResourceItemType });
                            }}
                          >
                            {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">內容</label>
                          <textarea
                            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-24"
                            value={item.content}
                            onChange={(e) => handleEditGeneratedItem(index, { content: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingItemIndex(null)}
                            className="flex-1 bg-slate-200 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-300 text-sm"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => {
                              onAdd(item);
                              handleDeleteGeneratedItem(index);
                              showToast('素材已加入庫房', 'success');
                            }}
                            className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-sm"
                          >
                            確認加入
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${
                              item.type === 'character_design' ? 'bg-purple-100 text-purple-700' :
                              item.type === 'asset' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.type === 'character_design' ? '角色設定' : item.type === 'asset' ? '發文素材' : '經營靈感'}
                            </span>
                            <h5 className="font-bold text-slate-800 mt-2">{item.title}</h5>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.content}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => setEditingItemIndex(index)}
                              className="text-indigo-600 hover:text-indigo-800"
                              title="編輯"
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteGeneratedItem(index)}
                              className="text-red-600 hover:text-red-800"
                              title="刪除"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <div 
              key={item.id} 
              onClick={() => handleViewItem(item)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-all group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${
                    item.type === 'character_design' ? 'bg-purple-100 text-purple-700' :
                    item.type === 'asset' ? 'bg-green-100 text-green-700' :
                    item.type === 'story' ? 'bg-blue-100 text-blue-700' :
                    item.type === 'quote' ? 'bg-amber-100 text-amber-700' :
                    item.type === 'tutorial' ? 'bg-indigo-100 text-indigo-700' :
                    item.type === 'behind_scenes' ? 'bg-pink-100 text-pink-700' :
                    item.type === 'interaction' ? 'bg-cyan-100 text-cyan-700' :
                    item.type === 'promotion' ? 'bg-red-100 text-red-700' :
                    item.type === 'news' ? 'bg-yellow-100 text-yellow-700' :
                    item.type === 'review' ? 'bg-teal-100 text-teal-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {RESOURCE_TYPE_LABELS[item.type]}
                  </span>
                  {item.isUsed && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                      <i className="fa-solid fa-check-circle mr-1"></i>已使用
                    </span>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
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

      {/* 素材詳細檢視 Modal */}
      <ResourceItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
};

export default memo(VaultView);
