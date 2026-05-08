export const CHECKLIST_STORAGE_KEY = 'nexus_launch_checklist';
export const KPI_STORAGE_KEY = 'nexus_kpi_data';
export const REVENUE_LOG_STORAGE_KEY = 'nexus_revenue_log';
export const MONTHLY_TARGET_KEY = 'nexus_monthly_target';
export const YOUTUBE_STORAGE_KEY = 'nexus_youtube_channel';
export const CALENDAR_STORAGE_KEY = 'nexus_content_calendar';

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
}
