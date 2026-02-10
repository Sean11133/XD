import { TagType } from './tag.model';
import type { IVisitor } from './visitor.interface';

/**
 * 搜尋高亮狀態（供 Observer Pattern 的 UI Observer 使用）
 */
export type HighlightState = 'none' | 'visiting' | 'matched';

/**
 * Composite Pattern — Component（抽象基類）
 * 定義檔案系統中所有節點的統一介面
 */
export abstract class FileSystemNode {
  /** Observer Pattern — UI 狀態：搜尋時的高亮狀態 */
  highlightState: HighlightState = 'none';

  /** Command Pattern — 標籤集合（可貼多個標籤） */
  tags: Set<TagType> = new Set();

  constructor(public name: string) {}

  /** 取得標籤陣列（供 Template @for 使用，Set 在 strict 模式下需轉為陣列） */
  getTagsArray(): TagType[] {
    return Array.from(this.tags);
  }

  /** Visitor Pattern — 接受訪問者 */
  abstract accept(visitor: IVisitor): void;

  /** 取得節點大小（KB） */
  abstract getSizeKB(): number;

  /** 取得顯示圖示 */
  abstract getIcon(): string;

  /** 取得類型標籤，例如: [Word 檔案] */
  abstract getTypeLabel(): string;

  /** 取得屬性細節，例如: (頁數: 15, 大小: 500KB) */
  abstract getDetails(): string;
}

/**
 * Composite Pattern — Leaf 抽象基類
 * 所有具體檔案類型的共用父類
 */
export abstract class FileNode extends FileSystemNode {
  constructor(
    name: string,
    public sizeKB: number,
  ) {
    super(name);
  }

  override getSizeKB(): number {
    return this.sizeKB;
  }
}
