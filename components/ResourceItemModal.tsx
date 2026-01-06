import React, { useState, useEffect } from 'react';
import { ResourceItem, ResourceItemType, RESOURCE_TYPE_LABELS } from '../types';

interface ResourceItemModalProps {
  item: ResourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<ResourceItem>) => void;
  onDelete: (id: string) => void;
}

const ResourceItemModal: React.FC<ResourceItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<Partial<ResourceItem>>({});

  useEffect(() => {
    if (item) {
      setEditedItem({
        title: item.title,
        content: item.content,
        type: item.type,
        isUsed: item.isUsed || false
      });
      setIsEditing(false);
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
    const newIsUsed = !item.isUsed;
    onUpdate(item.id, {
      isUsed: newIsUsed,
      usedAt: newIsUsed ? new Date().toISOString() : undefined
    });
  };

  const handleDelete = () => {
    if (window.confirm('確定要刪除這個素材嗎？')) {
      onDelete(item.id);
      onClose();
    }
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
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                item.isUsed
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <i className={`fa-solid ${item.isUsed ? 'fa-check-circle' : 'fa-circle'} mr-1`}></i>
              {item.isUsed ? '標記未使用' : '標記已使用'}
            </button>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
              >
                <i className="fa-solid fa-edit mr-1"></i>編輯
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              <i className="fa-solid fa-trash-can mr-1"></i>刪除
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceItemModal;

