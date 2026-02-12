import { FileNode } from './file-system-node.model';
import type { IVisitor } from '../behavioral/visitor.interface';
import { formatSize } from './format-size.util';

/**
 * Composite Pattern — Leaf（Word 文件）
 */
export class WordFile extends FileNode {
  constructor(
    name: string,
    sizeKB: number,
    public pages: number,
    createdAt?: Date,
  ) {
    super(name, sizeKB, createdAt);
  }

  getIcon(): string {
    return '📄';
  }

  getTypeLabel(): string {
    return '[Word 檔案]';
  }

  getDetails(): string {
    return `(頁數: ${this.pages}, 大小: ${formatSize(this.sizeKB)})`;
  }

  accept(visitor: IVisitor): void {
    visitor.visitWordFile(this);
  }
}
