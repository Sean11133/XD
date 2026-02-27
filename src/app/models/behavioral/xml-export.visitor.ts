import { BaseExportVisitor } from './base-export.visitor';

/**
 * Template Method Pattern — XML 匯出器
 *
 * 繼承 BaseExportVisitor，只實作 XML 格式的細節：
 *   - escape：脫逸 XML 特殊字元（& < > " '）
 *   - formatDirectoryStart / End：XML 開閉標籤
 *   - formatFile：XML 自含標籤
 *   - sanitizeTagName：處理非法 XML tag name
 */
export class XmlExportVisitor extends BaseExportVisitor {
  /**
   * XML 字元脫逸
   * 處理 XML 五大特殊字元：& < > " '
   */
  protected override escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 將名稱轉為合法的 XML tag name
   * - 移除不合法字元（空白、括號等）
   * - 數字開頭自動加底線前綴（XML tag 不可以數字開頭）
   */
  private sanitizeTagName(name: string): string {
    let tagName = name.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '_');
    if (/^[0-9]/.test(tagName)) {
      tagName = `_${tagName}`;
    }
    tagName = tagName.replace(/_+/g, '_').replace(/_$/, '');
    return tagName || '_node';
  }

  /**
   * 目錄開始 → XML 開標籤
   * 例如：<Root>
   */
  protected override formatDirectoryStart(name: string, _childCount: number): string {
    const tagName = this.sanitizeTagName(name);
    return `${this.indent()}<${tagName}>\n`;
  }

  /**
   * 目錄結束 → XML 閉標籤
   * 例如：</Root>
   */
  protected override formatDirectoryEnd(name: string): string {
    const tagName = this.sanitizeTagName(name);
    return `${this.indent()}</${tagName}>\n`;
  }

  /**
   * 檔案節點 → XML 含內容標籤
   * 例如：<README_txt>編碼: UTF-8, 大小: 0.5KB</README_txt>
   */
  protected override formatFile(name: string, details: string, _isLastChild: boolean): string {
    const tagName = this.sanitizeTagName(name);
    return `${this.indent()}<${tagName}>${details}</${tagName}>\n`;
  }
}
