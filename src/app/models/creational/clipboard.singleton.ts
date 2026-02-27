import type { FileSystemNode } from '../structural/file-system-node.model';

// ==========================================
// Singleton Pattern — Clipboard（全域共享剪貼簿）
//
// 🎭 建立型模式（Creational Pattern）
//
// 經典 GoF Singleton：
//   - private constructor 防止外部 new
//   - static getInstance() 取得唯一實例
//   - 全域共享狀態：剪貼簿中的節點
//
// 與 Angular DI 的差異：
//   Angular 的 `providedIn: 'root'` 也是 Singleton，
//   但它是 DI Container 管理的；此處用純 TypeScript 實作
//   GoF 原始 Singleton Pattern，不依賴任何框架。
// ==========================================

export class Clipboard {
  /** 唯一實例 */
  private static instance: Clipboard | null = null;

  /** 剪貼簿中的節點（深拷貝後的副本） */
  private content: FileSystemNode | null = null;

  /** 來源節點的名稱（供日誌顯示） */
  private sourceName: string | null = null;

  /** private 建構子 — 禁止外部直接 new */
  private constructor() {}

  /**
   * 取得 Clipboard 唯一實例
   * （Lazy Initialization — 首次呼叫時建立）
   */
  static getInstance(): Clipboard {
    if (!Clipboard.instance) {
      Clipboard.instance = new Clipboard();
    }
    return Clipboard.instance;
  }

  /**
   * 複製節點到剪貼簿（存入深拷貝副本）
   * @returns 被複製節點的名稱
   */
  copy(node: FileSystemNode): string {
    this.content = node.clone();
    this.sourceName = node.name;
    return node.name;
  }

  /**
   * 從剪貼簿取出節點（每次 paste 產生新的深拷貝）
   * 剪貼簿內容不會被清除（可重複貼上）
   */
  paste(): FileSystemNode | null {
    if (!this.content) return null;
    return this.content.clone();
  }

  /** 剪貼簿是否有內容 */
  hasContent(): boolean {
    return this.content !== null;
  }

  /** 取得來源節點名稱（供 UI 顯示） */
  getSourceName(): string | null {
    return this.sourceName;
  }

  /** 清空剪貼簿 */
  clear(): void {
    this.content = null;
    this.sourceName = null;
  }

  /**
   * 重置 Singleton 實例（僅供測試使用）
   * @internal
   */
  static resetInstance(): void {
    Clipboard.instance = null;
  }
}
