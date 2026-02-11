import type { FileSystemNode } from '../structural/file-system-node.model';

// ==========================================
// Strategy Pattern — 排序策略介面
// 定義排序演算法的統一介面，讓排序邏輯可抽換
// ==========================================

export interface ISortStrategy {
  /** 排序名稱（供 UI / Console 顯示） */
  readonly name: string;

  /** 對節點陣列進行排序（回傳新陣列，不改變原陣列） */
  sort(nodes: FileSystemNode[]): FileSystemNode[];
}
