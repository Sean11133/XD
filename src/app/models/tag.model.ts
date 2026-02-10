// ==========================================
// Tag Model — 標籤類型定義
// ==========================================

/** 標籤類型 — 三種可用標籤 */
export enum TagType {
  Urgent = 'Urgent',
  Work = 'Work',
  Personal = 'Personal',
}

/** 標籤顏色對應 */
export const TAG_COLORS: Record<TagType, string> = {
  [TagType.Urgent]: '#e74c3c', // 紅色
  [TagType.Work]: '#3498db', // 藍色
  [TagType.Personal]: '#2ecc71', // 綠色
};
