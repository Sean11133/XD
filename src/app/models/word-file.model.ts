import { FileNode } from './file-system-node.model';
import type { IVisitor } from './visitor.interface';

/**
 * Composite Pattern — Leaf（Word 文件）
 */
export class WordFile extends FileNode {
  constructor(
    name: string,
    sizeKB: number,
    public pages: number,
  ) {
    super(name, sizeKB);
  }

  getIcon(): string {
    return '📄';
  }

  getTypeLabel(): string {
    return '[Word 檔案]';
  }

  getDetails(): string {
    return `(頁數: ${this.pages}, 大小: ${this.sizeKB}KB)`;
  }

  accept(visitor: IVisitor): void {
    visitor.visitWordFile(this);
  }
}
