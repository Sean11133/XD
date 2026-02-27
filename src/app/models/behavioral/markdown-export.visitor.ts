import { BaseExportVisitor } from './base-export.visitor';

/**
 * Template Method Pattern — Markdown 匯出器
 *
 * 繼承 BaseExportVisitor，只實作 Markdown 格式的細節：
 *   - escape：脫逸 Markdown 特殊字元（# * _ | 等）
 *   - formatDirectoryStart / End：Markdown 標題（依層級 # → ##）
 *   - formatFile：Markdown 清單項目
 */
export class MarkdownExportVisitor extends BaseExportVisitor {
  /**
   * Markdown 字元脫逸
   * 處理：# * _ [ ] ( ) | ` 等 Markdown 語法字元
   */
  protected override escape(text: string): string {
    return text.replace(/([#*_\[\]()\\|`~>])/g, '\\$1');
  }

  /**
   * Markdown 不使用空格縮排，改用清單層級
   * 每層用 2 個空格的清單縮排
   */
  protected override indent(): string {
    // 目錄標題不需要縮排（用 # 層級），檔案項目用清單縮排
    return '  '.repeat(Math.max(0, this.indentLevel - 1));
  }

  /**
   * 目錄開始 → Markdown 標題
   * 層級 0 = #，層級 1 = ##，最深 ######
   */
  protected override formatDirectoryStart(name: string, _childCount: number): string {
    const level = Math.min(this.indentLevel + 1, 6);
    const prefix = '#'.repeat(level);
    return `${prefix} 📂 ${name}\n\n`;
  }

  /**
   * 目錄結束 → Markdown 空行（段落分隔）
   */
  protected override formatDirectoryEnd(_name: string): string {
    return '\n';
  }

  /**
   * 檔案節點 → Markdown 清單項目
   * 例如：- 📄 **README.txt** — 編碼: UTF-8, 大小: 0.5KB
   */
  protected override formatFile(name: string, details: string, _isLastChild: boolean): string {
    return `${this.indent()}- **${name}** — ${details}\n`;
  }
}
