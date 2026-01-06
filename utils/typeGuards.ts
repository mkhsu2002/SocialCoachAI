import { UserProfile, DayPlan, DailyInspiration, MemoryEntry, ResourceItem, ResourceItemType, DayOfWeek, DAY_ORDER } from '../types';

/**
 * 型別守衛函數
 */

export function isUserProfile(obj: unknown): obj is UserProfile {
  if (!obj || typeof obj !== 'object') return false;
  const profile = obj as Record<string, unknown>;
  return (
    typeof profile.fanPageName === 'string' &&
    typeof profile.positioning === 'string' &&
    typeof profile.destination === 'string' &&
    typeof profile.targetAudience === 'string' &&
    typeof profile.targetRegion === 'string' &&
    typeof profile.additionalNotes === 'string'
  );
}

/**
 * 檢查是否為有效的 DayOfWeek
 */
export function isDayOfWeek(value: unknown): value is DayOfWeek {
  return typeof value === 'string' && DAY_ORDER.includes(value as DayOfWeek);
}

export function isDayPlan(obj: unknown): obj is DayPlan {
  if (!obj || typeof obj !== 'object') return false;
  const plan = obj as Record<string, unknown>;
  return (
    isDayOfWeek(plan.day) &&
    typeof plan.type === 'string' &&
    typeof plan.purpose === 'string' &&
    (plan.priority === 'required' || plan.priority === 'optional')
  );
}

export function isDayPlanArray(arr: unknown): arr is DayPlan[] {
  return Array.isArray(arr) && arr.every(isDayPlan);
}

export function isDailyInspiration(obj: unknown): obj is DailyInspiration {
  if (!obj || typeof obj !== 'object') return false;
  const insp = obj as Record<string, unknown>;
  return (
    typeof insp.idea === 'string' &&
    typeof insp.hook === 'string' &&
    typeof insp.formatSuggestion === 'string'
  );
}

export function isDailyInspirationArray(arr: unknown): arr is DailyInspiration[] {
  return Array.isArray(arr) && arr.every(isDailyInspiration);
}

export function isMemoryEntry(obj: unknown): obj is MemoryEntry {
  if (!obj || typeof obj !== 'object') return false;
  const entry = obj as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.date === 'string' &&
    typeof entry.content === 'string' &&
    (entry.category === 'insight' || entry.category === 'milestone' || entry.category === 'feedback')
  );
}

const VALID_RESOURCE_TYPES: ResourceItemType[] = [
  'inspiration', 'asset', 'character_design', 'story', 'quote',
  'tutorial', 'behind_scenes', 'interaction', 'promotion', 'news', 'review', 'other'
];

export function isResourceItem(obj: unknown): obj is ResourceItem {
  if (!obj || typeof obj !== 'object') return false;
  const item = obj as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.content === 'string' &&
    typeof item.createdAt === 'string' &&
    VALID_RESOURCE_TYPES.includes(item.type as ResourceItemType) &&
    (item.isUsed === undefined || typeof item.isUsed === 'boolean') &&
    (item.usedAt === undefined || typeof item.usedAt === 'string')
  );
}

/**
 * 安全解析 JSON
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch {
    return fallback;
  }
}

