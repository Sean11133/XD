import { FileNode } from './file-system-node.model';
import type { IVisitor } from '../behavioral/visitor.interface';
import { formatSize } from './format-size.util';

/**
 * Composite Pattern — Leaf（純文字檔案）
 */
export class TextFile extends FileNode {
  constructor(
    name: string,
    sizeKB: number,
    public encoding: string,
    createdAt?: Date,
  ) {
    super(name, sizeKB, createdAt);
  }

  getIcon(): string {
    return '📝';
  }

  getTypeLabel(): string {
    return '[純文字檔]';
  }

  getDetails(): string {
    return `(編碼: ${this.encoding}, 大小: ${formatSize(this.sizeKB)})`;
  }

  accept(visitor: IVisitor): void {
    visitor.visitTextFile(this);
  }

  /** 深拷貝（產生新 ID，複製標籤） */
  clone(): TextFile {
    const copy = new TextFile(this.name, this.sizeKB, this.encoding, this.createdAt);
    for (const tag of this.tags) copy.tags.add(tag);
    return copy;
  }
}
