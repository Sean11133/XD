import { FileNode } from './file-system-node.model';
import type { IVisitor } from '../behavioral/visitor.interface';

/**
 * Composite Pattern — Leaf（純文字檔案）
 */
export class TextFile extends FileNode {
  constructor(
    name: string,
    sizeKB: number,
    public encoding: string,
  ) {
    super(name, sizeKB);
  }

  getIcon(): string {
    return '📝';
  }

  getTypeLabel(): string {
    return '[純文字檔]';
  }

  getDetails(): string {
    return `(編碼: ${this.encoding}, 大小: ${this.sizeKB}KB)`;
  }

  accept(visitor: IVisitor): void {
    visitor.visitTextFile(this);
  }
}
