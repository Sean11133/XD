import { BaseExportVisitor } from './base-export.visitor';

/**
 * Template Method Pattern — JSON 匯出器
 *
 * 繼承 BaseExportVisitor，只實作 JSON 格式的細節：
 *   - escape：脫逸雙引號、反斜線、控制字元
 *   - formatDirectoryStart / End：JSON 物件 { }
 *   - formatFile：JSON 鍵值對
 *
 * 設計重點：
 *   - 根目錄自動包裹在外層 `{ "根目錄名": { ... } }` 中
 *   - 使用 indentLevel + 1 作為實際縮排，因根層需要額外一層
 *   - 尾部逗號在 formatDirectoryEnd 中統一清除
 */
export class JsonExportVisitor extends BaseExportVisitor {
  /**
   * JSON 字元脫逸
   * 處理：雙引號、反斜線、換行、Tab 等控制字元
   */
  protected override escape(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * JSON 縮排 — 比 indentLevel 多一層（因為根層有外包 `{}`）
   */
  protected override indent(): string {
    return '  '.repeat(this.indentLevel + 1);
  }

  /**
   * 目錄開始 → JSON 物件開頭
   * 根目錄（level 0）額外包裹外層 `{`
   */
  protected override formatDirectoryStart(name: string, _childCount: number): string {
    if (this.indentLevel === 0) {
      return `{\n${this.indent()}"${name}": {\n`;
    }
    return `${this.indent()}"${name}": {\n`;
  }

  /**
   * 目錄結束 → JSON 物件結尾
   * 根目錄（level 0）同時關閉外層 `}`
   * 自動清除最後一個尾部逗號（JSON 不允許 trailing comma）
   */
  protected override formatDirectoryEnd(_name: string): string {
    // 移除最後一個逗號
    this.output = this.output.replace(/,\n$/, '\n');

    if (this.indentLevel === 0) {
      return `${this.indent()}}\n}\n`;
    }
    return `${this.indent()}},\n`;
  }

  /**
   * 檔案節點 → JSON 鍵值對
   * 例如：    "README.txt": "編碼: UTF-8, 大小: 0.5KB"
   */
  protected override formatFile(name: string, details: string, _isLastChild: boolean): string {
    return `${this.indent()}"${name}": "${details}",\n`;
  }
}
