import type { Directory } from '../structural/directory.model';
import type { FileSystemNode } from '../structural/file-system-node.model';
import type { ImageFile } from '../structural/image-file.model';
import type { TextFile } from '../structural/text-file.model';
import type { IVisitor } from './visitor.interface';
import type { WordFile } from '../structural/word-file.model';
import type { SearchSubjectService } from '../../services/behavioral/search-subject.service';

/**
 * Visitor Pattern — Concrete Visitor（搭配 Observer Pattern）
 * 依副檔名搜尋並收集匹配結果
 * 走訪過程中透過 SearchSubjectService 發出即時事件，通知 UI Observer
 */
export class ExtensionSearchVisitor implements IVisitor {
  private results: string[] = [];

  /**
   * @param targetExtension 要搜尋的副檔名
   * @param subject         Observer Pattern 的 Subject（可選），有傳入時會即時通知
   */
  constructor(
    private targetExtension: string,
    private subject?: SearchSubjectService,
  ) {}

  getResults(): string[] {
    return this.results;
  }

  visitDirectory(dir: Directory): void {
    // 通知 Observer：正在訪問此目錄
    this.subject?.notify({
      type: 'visiting',
      node: dir,
      message: `📂 進入目錄: ${dir.name}`,
    });

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
    // 通知 Observer：正在檢查此檔案
    this.subject?.notify({
      type: 'visiting',
      node: file,
      message: `   🔎 檢查: ${file.name}`,
    });

    if (file.name.endsWith(this.targetExtension)) {
      this.results.push(`找到: ${file.name} ${file.getDetails()}`);

      // 通知 Observer：找到匹配！
      this.subject?.notify({
        type: 'matched',
        node: file,
        message: `   ✅ 匹配: ${file.name}`,
      });
    }
  }
}
