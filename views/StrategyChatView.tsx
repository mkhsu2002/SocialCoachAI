
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, MemoryEntry } from '../types';
import { useApiKey } from '../contexts/ApiKeyContext';
import { getGeneralCoaching } from '../services/geminiService';

interface Message {
  role: 'user' | 'coach';
  text: string;
}

interface StrategyChatViewProps {
  profile: UserProfile;
  memories: MemoryEntry[];
  onAddMemory: (content: string, category: MemoryEntry['category']) => void;
}

const StrategyChatView: React.FC<StrategyChatViewProps> = ({ profile, memories, onAddMemory }) => {
  const { apiKey } = useApiKey();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'coach', text: `嘿 ${profile.fanPageName}！我是你的專屬陪跑教練。今天有什麼經營上的困擾嗎？✨` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const reply = await getGeneralCoaching(profile, userMsg, memories, apiKey);
      setMessages(prev => [...prev, { role: 'coach', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'coach', text: "教練現在有點忙，請檢查 API Key 是否已設定。" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSave = (text: string) => {
    onAddMemory(text, 'insight');
    alert('已快速存入成長筆記！');
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] py-4 px-4 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed text-sm">{m.text}</div>
            </div>
            {m.role === 'coach' && idx !== 0 && (
              <button 
                onClick={() => handleQuickSave(m.text)}
                className="text-[10px] text-slate-400 mt-1 hover:text-indigo-500 transition-colors flex items-center gap-1"
              >
                <i className="fa-solid fa-bookmark"></i> 儲存此建議
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="mt-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-3 outline-none rounded-xl text-sm"
          placeholder="詢問經營對策..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:bg-slate-300"
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default StrategyChatView;
