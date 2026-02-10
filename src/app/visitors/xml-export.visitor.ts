import type { Directory } from '../models/directory.model';
import type { ImageFile } from '../models/image-file.model';
import type { TextFile } from '../models/text-file.model';
import type { IVisitor } from '../models/visitor.interface';
import type { WordFile } from '../models/word-file.model';

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

  visitDirectory(dir: Directory): void {
    const tagName = dir.name.replace(/\s+|\(|\)/g, '_');
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
    const tagName = name.replace('.', '_');
    this.xml += `${this.getIndent()}<${tagName}>${content}</${tagName}>\n`;
  }
}
