import type { Directory } from '../models/directory.model';
import type { FileSystemNode } from '../models/file-system-node.model';
import type { ImageFile } from '../models/image-file.model';
import type { TextFile } from '../models/text-file.model';
import type { IVisitor } from '../models/visitor.interface';
import type { WordFile } from '../models/word-file.model';

/**
 * Visitor Pattern — Concrete Visitor
 * 依副檔名搜尋並收集匹配結果
 */
export class ExtensionSearchVisitor implements IVisitor {
  private results: string[] = [];

  constructor(private targetExtension: string) {}

  getResults(): string[] {
    return this.results;
  }

  visitDirectory(dir: Directory): void {
    dir.children.forEach((child) => child.accept(this));
  }

  visitWordFile(file: WordFile): void {
    this.checkFile(file);
  }

  visitImageFile(file: ImageFile): void {
    this.checkFile(file);
  }

  visitTextFile(file: TextFile): void {
    this.checkFile(file);
  }

  private checkFile(file: FileSystemNode): void {
    if (file.name.endsWith(this.targetExtension)) {
      this.results.push(`找到: ${file.name} ${file.getDetails()}`);
    }
  }
}
