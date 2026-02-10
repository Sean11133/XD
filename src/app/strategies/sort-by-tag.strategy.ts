import type { FileSystemNode } from '../models/file-system-node.model';
import type { ISortStrategy } from './sort-strategy.interface';

// ==========================================
// Strategy Pattern — Concrete Strategy
// 依標籤數量排序（有標籤的排前面）
// ==========================================

export class SortByTagStrategy implements ISortStrategy {
  readonly name: string;

  constructor(private ascending = true) {
    this.name = `標籤${ascending ? '升冪 ↑' : '降冪 ↓'}`;
  }

  sort(nodes: FileSystemNode[]): FileSystemNode[] {
    return [...nodes].sort((a, b) => {
      const countA = a.tags.size;
      const countB = b.tags.size;

      // 先比標籤數量
      if (countA !== countB) {
        const result = countA - countB;
        return this.ascending ? result : -result;
      }

      // 數量相同時，依標籤名稱字典序（取第一個）
      const firstA = a.getTagsArray()[0] ?? '';
      const firstB = b.getTagsArray()[0] ?? '';
      const result = String(firstA).localeCompare(String(firstB));
      return this.ascending ? result : -result;
    });
  }
}
