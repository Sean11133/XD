import type { Directory } from '../structural/directory.model';
import type { ImageFile } from '../structural/image-file.model';
import type { TextFile } from '../structural/text-file.model';
import type { IVisitor } from './visitor.interface';
import type { WordFile } from '../structural/word-file.model';

/**
 * Visitor Pattern — Concrete Visitor
 * 遍歷檔案樹並產生 XML 格式字串
 */
export class XmlExportVisitor implements IVisitor {
  private xml = '';
  private indentLevel = 0;

  getResult(): string {
    return this.xml;
  }

  private getIndent(): string {
    return '  '.repeat(this.indentLevel);
  }

  /**
   * 將名稱轉為合法的 XML tag name
   * - 移除不合法字元（空白、括號等）
   * - 數字開頭自動加底線前綴（XML tag 不可以數字開頭）
   */
  private sanitizeTagName(name: string): string {
    let tagName = name.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '_');
    // XML tag 不能以數字開頭，需加前綴
    if (/^[0-9]/.test(tagName)) {
      tagName = `_${tagName}`;
    }
    // 移除連續底線與尾部底線
    tagName = tagName.replace(/_+/g, '_').replace(/_$/, '');
    return tagName || '_node';
  }

  visitDirectory(dir: Directory): void {
    const tagName = this.sanitizeTagName(dir.name);
    this.xml += `${this.getIndent()}<${tagName}>\n`;
    this.indentLevel++;
    dir.children.forEach((child) => child.accept(this));
    this.indentLevel--;
    this.xml += `${this.getIndent()}</${tagName}>\n`;
  }

  visitWordFile(file: WordFile): void {
    this.appendNode(file.name, file.getDetails().replace(/[()]/g, ''));
  }

  visitImageFile(file: ImageFile): void {
    this.appendNode(file.name, file.getDetails().replace(/[()]/g, ''));
  }

  visitTextFile(file: TextFile): void {
    this.appendNode(file.name, file.getDetails().replace(/[()]/g, ''));
  }

  private appendNode(name: string, content: string): void {
    const tagName = this.sanitizeTagName(name);
    this.xml += `${this.getIndent()}<${tagName}>${content}</${tagName}>\n`;
  }
}
