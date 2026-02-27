import { TagType } from './tag.model';
import type { IVisitor } from '../behavioral/visitor.interface';
import { formatSize } from './format-size.util';

/**
 * 搜尋高亮狀態（UI 層使用，不屬於 Domain Model）
 */
export type HighlightState = 'none' | 'visiting' | 'matched';

/** 全域唯一 ID 計數器 */
let nextNodeId = 1;

/**
 * Composite Pattern — Component（抽象基類）
 * 定義檔案系統中所有節點的統一介面
 *
 * 注意：highlightState 已移出 Domain Model，改由 ViewStateService 管理
 */
export abstract class FileSystemNode {
  /** 唯一識別碼（供 trackBy 與節點識別使用） */
  readonly id: number;

  /** Command Pattern — 標籤集合（可貼多個標籤，屬於業務需求） */
  tags: Set<TagType> = new Set();

  constructor(public name: string) {
    this.id = nextNodeId++;
  }

  /** 取得標籤陣列（供 Template @for 使用，Set 在 strict 模式下需轉為陣列） */
  getTagsArray(): TagType[] {
    return Array.from(this.tags);
  }

  /** Visitor Pattern — 接受訪問者 */
  abstract accept(visitor: IVisitor): void;

  /** 深拷貝節點（產生新 ID，供 Copy/Paste Command 使用） */
  abstract clone(): FileSystemNode;

  /** 取得節點大小（KB） */
  abstract getSizeKB(): number;

  /** 取得格式化後的大小字串（自動 KB → MB 轉換） */
  getFormattedSize(): string {
    return formatSize(this.getSizeKB());
  }

  /** 取得顯示圖示 */
  abstract getIcon(): string;

  /** 取得類型標籤，例如: [Word 檔案] */
  abstract getTypeLabel(): string;

  /** 取得屬性細節，例如: (頁數: 15, 大小: 2MB) */
  abstract getDetails(): string;
}

/**
 * Composite Pattern — Leaf 抽象基類
 * 所有具體檔案類型的共用父類
 */
export abstract class FileNode extends FileSystemNode {
  /** 檔案建立時間 */
  readonly createdAt: Date;

  constructor(
    name: string,
    public sizeKB: number,
    createdAt?: Date,
  ) {
    super(name);
    this.createdAt = createdAt ?? new Date();
  }

  override getSizeKB(): number {
    return this.sizeKB;
  }
}
