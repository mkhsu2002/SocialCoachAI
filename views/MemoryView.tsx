
import React, { useState } from 'react';
import { MemoryEntry } from '../types';

interface MemoryViewProps {
  memories: MemoryEntry[];
  onAdd: (content: string, category: MemoryEntry['category']) => void;
  onDelete: (id: string) => void;
}

const MemoryView: React.FC<MemoryViewProps> = ({ memories, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryEntry['category']>('insight');

  const handleAdd = () => {
    if (!newContent.trim()) return;
    onAdd(newContent, newCategory);
    setNewContent('');
    setIsAdding(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">教練的成長筆記 🧠</h2>
          <p className="text-slate-500">這是教練記住的關鍵洞察與經營里程碑。</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2"
        >
          <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>
          {isAdding ? '取消' : '手動紀錄'}
        </button>
      </header>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 mb-8 shadow-md">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">類別</label>
              <select
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
              >
                <option value="insight">經營洞察</option>
                <option value="milestone">重要里程碑</option>
                <option value="feedback">用戶回饋</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">紀錄內容</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-24 text-sm"
                placeholder="例如：這週發現晚上 10 點發文互動率最高..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700"
            >
              儲存至教練大腦
            </button>
          </div>
        </div>
      )}

      {memories.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <i className="fa-solid fa-brain text-4xl text-slate-300 mb-4"></i>
          <p className="text-slate-500">教練的大腦目前還是空的。開始對話或手動紀錄吧！</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-10">
          {memories.map((m) => (
            <div key={m.id} className="relative pl-8 group">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-500"></div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${
                    m.category === 'insight' ? 'bg-blue-100 text-blue-700' :
                    m.category === 'milestone' ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700'
                  }`}>
                    {m.category === 'insight' ? '經營洞察' : m.category === 'milestone' ? '重要里程碑' : '用戶回饋'}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">{new Date(m.date).toLocaleDateString()}</span>
                    <button 
                      onClick={() => onDelete(m.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryView;
