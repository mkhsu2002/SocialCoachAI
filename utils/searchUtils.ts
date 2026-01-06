/**
 * 搜尋工具函數
 */

import { ResourceItem, MemoryEntry } from '../types';

/**
 * 搜尋 Vault 項目
 */
export function searchVaultItems(
  items: ResourceItem[],
  query: string
): ResourceItem[] {
  if (!query.trim()) {
    return items;
  }

  const lowerQuery = query.toLowerCase();

  return items.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(lowerQuery);
    const contentMatch = item.content.toLowerCase().includes(lowerQuery);
    const typeMatch = item.type.toLowerCase().includes(lowerQuery);
    
    return titleMatch || contentMatch || typeMatch;
  });
}

/**
 * 搜尋 Memory 項目
 */
export function searchMemoryEntries(
  entries: MemoryEntry[],
  query: string
): MemoryEntry[] {
  if (!query.trim()) {
    return entries;
  }

  const lowerQuery = query.toLowerCase();

  return entries.filter(entry => {
    const contentMatch = entry.content.toLowerCase().includes(lowerQuery);
    const categoryMatch = entry.category.toLowerCase().includes(lowerQuery);
    const dateMatch = new Date(entry.date).toLocaleDateString().includes(query);
    
    return contentMatch || categoryMatch || dateMatch;
  });
}

/**
 * 高亮搜尋關鍵字
 */
export function highlightSearchTerm(text: string, query: string): string {
  if (!query.trim()) {
    return text;
  }

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 搜尋並排序（相關度排序）
 */
export function searchAndSort<T extends { title?: string; content: string }>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string
): T[] {
  if (!query.trim()) {
    return items;
  }

  const lowerQuery = query.toLowerCase();

  return items
    .map(item => {
      const text = getSearchableText(item).toLowerCase();
      const title = item.title?.toLowerCase() || '';
      
      // 計算相關度分數
      let score = 0;
      
      // 標題完全匹配 +10
      if (title === lowerQuery) {
        score += 10;
      }
      // 標題包含 +5
      else if (title.includes(lowerQuery)) {
        score += 5;
      }
      
      // 內容完全匹配 +3
      if (text === lowerQuery) {
        score += 3;
      }
      // 內容包含 +1
      else if (text.includes(lowerQuery)) {
        score += 1;
      }
      
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

