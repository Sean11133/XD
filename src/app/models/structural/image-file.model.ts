import { FileNode } from './file-system-node.model';
import type { IVisitor } from '../behavioral/visitor.interface';
import { formatSize } from './format-size.util';

/**
 * Composite Pattern — Leaf（圖片檔案）
 */
export class ImageFile extends FileNode {
  constructor(
    name: string,
    sizeKB: number,
    public width: number,
    public height: number,
    createdAt?: Date,
  ) {
    super(name, sizeKB, createdAt);
  }

  getIcon(): string {
    return '🖼️';
  }

  getTypeLabel(): string {
    return '[圖片]';
  }

  getDetails(): string {
    return `(解析度: ${this.width}x${this.height}, 大小: ${formatSize(this.sizeKB)})`;
  }

  accept(visitor: IVisitor): void {
    visitor.visitImageFile(this);
  }

  /** 深拷貝（產生新 ID，複製標籤） */
  clone(): ImageFile {
    const copy = new ImageFile(this.name, this.sizeKB, this.width, this.height, this.createdAt);
    for (const tag of this.tags) copy.tags.add(tag);
    return copy;
  }
}
