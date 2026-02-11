import type { FileSystemNode } from '../structural/file-system-node.model';

// ==========================================
// Observer Pattern — Event Model
// 定義搜尋過程中 Subject 發出的事件類型
// ==========================================

/** 事件種類 */
export type SearchEventType = 'visiting' | 'matched' | 'complete';

/** 搜尋事件（Subject 通知 Observer 的資料結構） */
export interface SearchEvent {
  type: SearchEventType;
  node?: FileSystemNode;
  message: string;
}
