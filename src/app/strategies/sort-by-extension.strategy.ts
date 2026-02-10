import { Directory } from '../models/directory.model';
import type { FileSystemNode } from '../models/file-system-node.model';
import type { ISortStrategy } from './sort-strategy.interface';

// ==========================================
// Strategy Pattern — Concrete Strategy
// 依副檔名排序（目錄排在最前，檔案依副檔名字典序）
// ==========================================

export class SortByExtensionStrategy implements ISortStrategy {
  readonly name: string;

  constructor(private ascending = true) {
    this.name = `類型${ascending ? '升冪 ↑' : '降冪 ↓'}`;
  }

  sort(nodes: FileSystemNode[]): FileSystemNode[] {
    return [...nodes].sort((a, b) => {
      const extA = this.getExtension(a);
      const extB = this.getExtension(b);
      const result = extA.localeCompare(extB, 'zh-Hant');
      return this.ascending ? result : -result;
    });
  }

  private getExtension(node: FileSystemNode): string {
    if (node instanceof Directory) return ''; // 目錄無副檔名，排最前
    const dotIndex = node.name.lastIndexOf('.');
    return dotIndex === -1 ? '' : node.name.substring(dotIndex);
  }
}
