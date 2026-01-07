import React, { useState, useMemo } from 'react';
import { PersonaTemplate, FanPageCategory, PersonaStyle, FAN_PAGE_CATEGORY_LABELS, PERSONA_STYLE_LABELS } from '../types';
import { 
  PERSONA_TEMPLATES, 
  getTemplatesByCategoryAndStyle 
} from '../data/personaTemplates';

interface PersonaTemplateSelectorProps {
  onSelect: (template: string) => void;
  currentValue?: string;
  onClose?: () => void;
}

const PersonaTemplateSelector: React.FC<PersonaTemplateSelectorProps> = ({
  onSelect,
  currentValue,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FanPageCategory | 'all'>('all');
  const [selectedStyle, setSelectedStyle] = useState<PersonaStyle | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PersonaTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 篩選模板
  const filteredTemplates = useMemo(() => {
    let templates: PersonaTemplate[] = PERSONA_TEMPLATES;

    // 根據類別篩選
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
    }

    // 根據風格篩選
    if (selectedStyle !== 'all') {
      templates = templates.filter(t => t.style === selectedStyle);
    }

    // 根據搜尋關鍵字篩選
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (t.suitableFor && t.suitableFor.toLowerCase().includes(query))
      );
    }

    return templates;
  }, [selectedCategory, selectedStyle, searchQuery]);

  const handleSelectTemplate = (template: PersonaTemplate) => {
    setSelectedTemplate(template);
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate.template);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleUseCurrentValue = () => {
    if (currentValue) {
      onSelect(currentValue);
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 標題與關閉按鈕 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">選擇小編人設模板</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        )}
      </div>

      {/* 搜尋框 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜尋模板名稱、描述或標籤..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
      </div>

      {/* 分類篩選 */}
      <div className="space-y-3">
        {/* 粉專類別篩選 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">粉專類別</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              全部
            </button>
            {Object.entries(FAN_PAGE_CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as FanPageCategory)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 語氣風格篩選 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">語氣風格</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStyle('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedStyle === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              全部
            </button>
            {Object.entries(PERSONA_STYLE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedStyle(key as PersonaStyle)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedStyle === key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <i className="fa-solid fa-search text-3xl mb-2"></i>
            <p>找不到符合條件的模板</p>
            <p className="text-sm mt-1">試試調整篩選條件或搜尋關鍵字</p>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{template.name}</h4>
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                      {FAN_PAGE_CATEGORY_LABELS[template.category]}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                      {PERSONA_STYLE_LABELS[template.style]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                  {template.suitableFor && (
                    <p className="text-xs text-slate-500 mb-2">
                      <i className="fa-solid fa-lightbulb mr-1"></i>
                      適用於：{template.suitableFor}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedTemplate?.id === template.id && (
                  <div className="ml-2">
                    <i className="fa-solid fa-check-circle text-indigo-600 text-xl"></i>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 預覽區域 */}
      {selectedTemplate && (
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900">模板預覽</h4>
            <button
              onClick={handleApplyTemplate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <i className="fa-solid fa-check mr-1"></i>
              使用此模板
            </button>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <pre className="text-sm whitespace-pre-wrap text-slate-700 font-sans">
              {selectedTemplate.template}
            </pre>
            {selectedTemplate.preview && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 italic">{selectedTemplate.preview}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 使用當前值選項 */}
      {currentValue && currentValue.trim() && (
        <div className="border-t border-slate-200 pt-4">
          <button
            onClick={handleUseCurrentValue}
            className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            保持當前內容
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonaTemplateSelector;

