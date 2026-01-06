import React, { useState, useEffect } from 'react';
import { ResourceItem, ResourceItemType, RESOURCE_TYPE_LABELS } from '../types';
import { deriveResourcesFromItem } from '../services/deriveResources';
import { useApiKey } from '../contexts/ApiKeyContext';
import { useToast } from '../contexts/ToastContext';
import { handleError } from '../utils/errorHandler';
import LoadingSpinner from './LoadingSpinner';

interface ResourceItemModalProps {
  item: ResourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<ResourceItem>) => void;
  onDelete: (id: string) => void;
  onAdd: (item: Omit<ResourceItem, 'id' | 'createdAt'>) => void;
}

const ResourceItemModal: React.FC<ResourceItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onAdd
}) => {
  const { apiKey } = useApiKey();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<Partial<ResourceItem>>({});
  const [isToggling, setIsToggling] = useState(false);
  const [isDeriving, setIsDeriving] = useState(false);
  const [derivedItems, setDerivedItems] = useState<Omit<ResourceItem, 'id' | 'createdAt'>[]>([]);
  const [showDerived, setShowDerived] = useState(false);

  useEffect(() => {
    if (item) {
      setEditedItem({
        title: item.title,
        content: item.content,
        type: item.type,
        isUsed: item.isUsed || false
      });
      setIsEditing(false);
      setDerivedItems([]);
      setShowDerived(false);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    if (!editedItem.title || !editedItem.content) {
      return;
    }
    onUpdate(item.id, editedItem);
    setIsEditing(false);
  };

  const handleToggleUsed = () => {
    setIsToggling(true);
    const newIsUsed = !item.isUsed;
    onUpdate(item.id, {
      isUsed: newIsUsed,
      usedAt: newIsUsed ? new Date().toISOString() : undefined
    });
    // 短暫延遲後重置動畫狀態
    setTimeout(() => setIsToggling(false), 300);
  };

  const handleDelete = () => {
    if (window.confirm('確定要刪除這個素材嗎？')) {
      onDelete(item.id);
      onClose();
    }
  };

  const handleDeriveResources = async () => {
    if (!item) return;
    setIsDeriving(true);
    try {
      const derived = await deriveResourcesFromItem(item, apiKey);
      setDerivedItems(derived);
      setShowDerived(true);
      showToast(`成功衍生 ${derived.length} 個素材變體！`, 'success');
    } catch (error) {
      const errorMessage = handleError(error, {
        defaultMessage: '衍生素材失敗，請檢查 API Key 是否已設定'
      });
      showToast(errorMessage, 'error');
    } finally {
      setIsDeriving(false);
    }
  };

  const handleAddDerivedItem = (derivedItem: Omit<ResourceItem, 'id' | 'createdAt'>) => {
    onAdd(derivedItem);
    setDerivedItems(prev => prev.filter(item => item !== derivedItem));
    showToast('素材已加入庫房', 'success');
  };

  const handleAddAllDerived = () => {
    if (derivedItems.length === 0) return;
    derivedItems.forEach(item => onAdd(item));
    setDerivedItems([]);
    showToast(`成功加入 ${derivedItems.length} 個衍生素材！`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <span className={`text-xs uppercase font-black px-3 py-1 rounded-md ${
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
              'bg-amber-100 text-amber-700'
            }`}>
              {RESOURCE_TYPE_LABELS[item.type]}
            </span>
            {item.isUsed && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                <i className="fa-solid fa-check-circle mr-1"></i>已使用
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleUsed}
              disabled={isToggling}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 transform ${
                isToggling
                  ? 'scale-95 opacity-75'
                  : 'scale-100 opacity-100 hover:scale-105 active:scale-95'
              } ${
                item.isUsed
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300 shadow-sm hover:shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 shadow-sm hover:shadow-md'
              } disabled:cursor-not-allowed`}
            >
              <i className={`fa-solid ${item.isUsed ? 'fa-check-circle' : 'fa-circle'} mr-1 transition-transform duration-200 ${isToggling ? 'rotate-180' : ''}`}></i>
              {item.isUsed ? '標記未使用' : '標記已使用'}
            </button>
            {!isEditing && (
              <>
                <button
                  onClick={handleDeriveResources}
                  disabled={isDeriving}
                  className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 active:bg-purple-300 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeriving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-1">衍生中...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-magic mr-1"></i>衍生素材
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:bg-indigo-300 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                >
                  <i className="fa-solid fa-edit mr-1"></i>編輯
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
            >
              <i className="fa-solid fa-trash-can mr-1"></i>刪除
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-600 transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">標題</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editedItem.title || ''}
                  onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">類型</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editedItem.type || 'other'}
                  onChange={(e) => setEditedItem({ ...editedItem, type: e.target.value as ResourceItemType })}
                >
                  {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">內容</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-64"
                  value={editedItem.content || ''}
                  onChange={(e) => setEditedItem({ ...editedItem, content: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={!editedItem.title || !editedItem.content}
                  className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  儲存
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedItem({
                      title: item.title,
                      content: item.content,
                      type: item.type,
                      isUsed: item.isUsed || false
                    });
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 font-bold py-2 rounded-lg hover:bg-slate-300"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">
                  建立時間：{new Date(item.createdAt).toLocaleString('zh-TW')}
                  {item.usedAt && (
                    <span className="ml-4">
                      使用時間：{new Date(item.usedAt).toLocaleString('zh-TW')}
                    </span>
                  )}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{item.content}</p>
              </div>

              {/* 衍生素材列表 */}
              {showDerived && derivedItems.length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <i className="fa-solid fa-magic text-purple-600"></i>
                      AI 衍生的素材變體 ({derivedItems.length} 個)
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddAllDerived}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                      >
                        <i className="fa-solid fa-check mr-1"></i>全部加入
                      </button>
                      <button
                        onClick={() => {
                          setShowDerived(false);
                          setDerivedItems([]);
                        }}
                        className="bg-slate-200 text-slate-700 px-3 py-1 rounded-lg hover:bg-slate-300 text-sm font-medium transition-all duration-200"
                      >
                        關閉
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {derivedItems.map((derivedItem, index) => (
                      <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${
                                derivedItem.type === 'character_design' ? 'bg-purple-100 text-purple-700' :
                                derivedItem.type === 'asset' ? 'bg-green-100 text-green-700' :
                                derivedItem.type === 'story' ? 'bg-blue-100 text-blue-700' :
                                derivedItem.type === 'quote' ? 'bg-amber-100 text-amber-700' :
                                derivedItem.type === 'tutorial' ? 'bg-indigo-100 text-indigo-700' :
                                derivedItem.type === 'behind_scenes' ? 'bg-pink-100 text-pink-700' :
                                derivedItem.type === 'interaction' ? 'bg-cyan-100 text-cyan-700' :
                                derivedItem.type === 'promotion' ? 'bg-red-100 text-red-700' :
                                derivedItem.type === 'news' ? 'bg-yellow-100 text-yellow-700' :
                                derivedItem.type === 'review' ? 'bg-teal-100 text-teal-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {RESOURCE_TYPE_LABELS[derivedItem.type]}
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-800 mb-1">{derivedItem.title}</h5>
                            <p className="text-sm text-slate-600 line-clamp-2">{derivedItem.content}</p>
                          </div>
                          <button
                            onClick={() => handleAddDerivedItem(derivedItem)}
                            className="ml-4 bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                          >
                            <i className="fa-solid fa-plus mr-1"></i>加入
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceItemModal;

