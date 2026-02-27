import type { Directory } from '../structural/directory.model';
import type { ImageFile } from '../structural/image-file.model';
import type { TextFile } from '../structural/text-file.model';
import type { IVisitor } from './visitor.interface';
import type { WordFile } from '../structural/word-file.model';

/**
 * Template Method Pattern — 匯出器基類
 *
 * 骨架方法（Template Method）統一處理：
 *   1. 字元脫逸（escape）
 *   2. 縮排管理（indent / indentLevel）
 *
 * 子類別只需實作格式特定的細節方法：
 *   - formatDirectoryStart / formatDirectoryEnd
 *   - formatFile
 *   - beginExport / endExport（Hook，可選覆寫）
 */
export abstract class BaseExportVisitor implements IVisitor {
  /** 匯出結果累積器 */
  protected output = '';

  /** 目前縮排層級 */
  protected indentLevel = 0;

  // ─── Template Method：字元脫逸 ───

  /**
   * 依匯出格式脫逸特殊字元（子類別必須實作）
   * @param text 原始文字
   * @returns 脫逸後的安全文字
   */
  protected abstract escape(text: string): string;

  // ─── Template Method：縮排 ───

  /**
   * 產生目前層級的縮排字串（子類別可覆寫以改變縮排風格）
   */
  protected indent(): string {
    return '  '.repeat(this.indentLevel);
  }

  // ─── 抽象方法：格式特定的輸出細節 ───

  /** 目錄開始標記 */
  protected abstract formatDirectoryStart(name: string, childCount: number): string;

  /** 目錄結束標記 */
  protected abstract formatDirectoryEnd(name: string): string;

  /** 檔案節點格式化 */
  protected abstract formatFile(name: string, details: string, isLastChild: boolean): string;

  // ─── Hook Methods（子類別可選覆寫）───

  /** 匯出開始前的前置作業（Hook） */
  protected beginExport(): void {}

  /** 匯出完成後的收尾作業（Hook） */
  protected endExport(): void {}

  // ─── Visitor 介面實作（骨架流程，子類別不需覆寫） ───

  /** 取得最終匯出結果 */
  getResult(): string {
    return this.output;
  }

  /** 重置狀態（可重複使用同一實例） */
  reset(): void {
    this.output = '';
    this.indentLevel = 0;
  }

  visitDirectory(dir: Directory): void {
    if (this.indentLevel === 0) {
      this.beginExport();
    }

    const escapedName = this.escape(dir.name);
    this.output += this.formatDirectoryStart(escapedName, dir.children.length);
    this.indentLevel++;

    dir.children.forEach((child, index) => {
      // 將 isLastChild 資訊傳遞給子節點（供 JSON 逗號處理等）
      (child as { _isLastChild?: boolean })._isLastChild = index === dir.children.length - 1;
      child.accept(this);
    });

    this.indentLevel--;
    // 注意：必須先呼叫 formatDirectoryEnd（子類別可能修改 this.output），
    // 再用 += 附加回傳值。若合併為 this.output += this.formatDirectoryEnd()
    // 會導致 += 讀取修改前的 this.output，覆蓋子類別的修改。
    const endStr = this.formatDirectoryEnd(escapedName);
    this.output += endStr;

    if (this.indentLevel === 0) {
      this.endExport();
    }
  }

  visitWordFile(file: WordFile): void {
    const isLast = (file as { _isLastChild?: boolean })._isLastChild ?? true;
    this.output += this.formatFile(
      this.escape(file.name),
      this.escape(file.getDetails().replace(/[()]/g, '')),
      isLast,
    );
  }

  visitImageFile(file: ImageFile): void {
    const isLast = (file as { _isLastChild?: boolean })._isLastChild ?? true;
    this.output += this.formatFile(
      this.escape(file.name),
      this.escape(file.getDetails().replace(/[()]/g, '')),
      isLast,
    );
  }

  visitTextFile(file: TextFile): void {
    const isLast = (file as { _isLastChild?: boolean })._isLastChild ?? true;
    this.output += this.formatFile(
      this.escape(file.name),
      this.escape(file.getDetails().replace(/[()]/g, '')),
      isLast,
    );
  }
}
