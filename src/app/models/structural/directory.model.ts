import { FileSystemNode } from './file-system-node.model';
import type { IVisitor } from '../behavioral/visitor.interface';

/**
 * Composite Pattern — Composite（目錄）
 * 包含子節點集合，遞迴委派操作
 */
export class Directory extends FileSystemNode {
  children: FileSystemNode[] = [];

  constructor(name: string) {
    super(name);
  }

  add(node: FileSystemNode): void {
    this.children.push(node);
  }

  /** Command Pattern — 移除子節點（回傳被移除節點的原始位置） */
  remove(node: FileSystemNode): number {
    const index = this.children.indexOf(node);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
    return index;
  }

  /** Command Pattern — 在指定位置插入子節點（用於 undo 復原） */
  insertAt(node: FileSystemNode, index: number): void {
    this.children.splice(index, 0, node);
  }

  getIcon(): string {
    return '📂';
  }

  getTypeLabel(): string {
    return '[目錄]';
  }

  getDetails(): string {
    return '';
  }

  getSizeKB(): number {
    return this.children.reduce((sum, child) => sum + child.getSizeKB(), 0);
  }

  accept(visitor: IVisitor): void {
    visitor.visitDirectory(this);
  }

  /** 深拷貝（遞迴複製所有子節點，產生新 ID） */
  clone(): Directory {
    const copy = new Directory(this.name);
    for (const tag of this.tags) copy.tags.add(tag);
    for (const child of this.children) {
      copy.add(child.clone());
    }
    return copy;
  }
}
