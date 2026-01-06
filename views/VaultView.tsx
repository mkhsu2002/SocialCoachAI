
import React, { useState } from 'react';
import { ResourceItem } from '../types';

interface VaultViewProps {
  items: ResourceItem[];
  onAdd: (item: Omit<ResourceItem, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

const VaultView: React.FC<VaultViewProps> = ({ items, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<ResourceItem['type']>('inspiration');

  const handleAdd = () => {
    if (!newTitle || !newContent) return;
    onAdd({ title: newTitle, content: newContent, type: newType });
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

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
                  onChange={(e) => setNewType(e.target.value as any)}
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

      {items.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <i className="fa-solid fa-box-open text-4xl text-slate-300 mb-4"></i>
          <p className="text-slate-500">目前還沒有素材，快來新增第一份靈感吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
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

export default VaultView;
