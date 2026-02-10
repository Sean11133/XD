import type { FileSystemNode } from '../models/file-system-node.model';
import type { ISortStrategy } from './sort-strategy.interface';

// ==========================================
// Strategy Pattern — Concrete Strategy
// 依大小排序（KB）
// ==========================================

export class SortBySizeStrategy implements ISortStrategy {
  readonly name: string;

  constructor(private ascending = true) {
    this.name = `大小${ascending ? '升冪 ↑' : '降冪 ↓'}`;
  }

  sort(nodes: FileSystemNode[]): FileSystemNode[] {
    return [...nodes].sort((a, b) => {
      const result = a.getSizeKB() - b.getSizeKB();
      return this.ascending ? result : -result;
    });
  }
}
