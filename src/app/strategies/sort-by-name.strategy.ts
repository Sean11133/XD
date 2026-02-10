import type { FileSystemNode } from '../models/file-system-node.model';
import type { ISortStrategy } from './sort-strategy.interface';

// ==========================================
// Strategy Pattern — Concrete Strategy
// 依名稱排序（字典序）
// ==========================================

export class SortByNameStrategy implements ISortStrategy {
  readonly name: string;

  constructor(private ascending = true) {
    this.name = `名稱${ascending ? '升冪 ↑' : '降冪 ↓'}`;
  }

  sort(nodes: FileSystemNode[]): FileSystemNode[] {
    return [...nodes].sort((a, b) => {
      const result = a.name.localeCompare(b.name, 'zh-Hant');
      return this.ascending ? result : -result;
    });
  }
}
