import { FileNode } from './file-system-node.model';
import type { IVisitor } from '../behavioral/visitor.interface';

/**
 * Composite Pattern — Leaf（圖片檔案）
 */
export class ImageFile extends FileNode {
  constructor(
    name: string,
    sizeKB: number,
    public width: number,
    public height: number,
  ) {
    super(name, sizeKB);
  }

  getIcon(): string {
    return '🖼️';
  }

  getTypeLabel(): string {
    return '[圖片]';
  }

  getDetails(): string {
    return `(解析度: ${this.width}x${this.height}, 大小: ${this.sizeKB}KB)`;
  }

  accept(visitor: IVisitor): void {
    visitor.visitImageFile(this);
  }
}
