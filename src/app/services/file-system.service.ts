import { inject, Injectable } from '@angular/core';

import { Directory } from '../models/directory.model';
import { FileSystemNode } from '../models/file-system-node.model';
import { ImageFile } from '../models/image-file.model';
import { TextFile } from '../models/text-file.model';
import { WordFile } from '../models/word-file.model';
import { SearchSubjectService } from '../observers/search-subject.service';
import { ExtensionSearchVisitor } from '../visitors/extension-search.visitor';
import { XmlExportVisitor } from '../visitors/xml-export.visitor';

/**
 * Service 層 — 封裝所有業務邏輯
 * 負責建構資料、計算容量、匯出 XML、搜尋檔案
 */
@Injectable({ providedIn: 'root' })
export class FileSystemService {
  private readonly searchSubject = inject(SearchSubjectService);
  /**
   * 建構範例檔案樹
   */
  buildSampleTree(): Directory {
    const rootDir = new Directory('根目錄 (Root)');

    const projectDocs = new Directory('專案文件 (Project_Docs)');
    projectDocs.add(new WordFile('需求規格書.docx', 500, 15));
    projectDocs.add(new ImageFile('系統架構圖.png', 2048, 1920, 1080));
    rootDir.add(projectDocs);

    const personalNotes = new Directory('個人筆記 (Personal_Notes)');
    personalNotes.add(new TextFile('待辦清單.txt', 1, 'UTF-8'));

    const archive = new Directory('2025備份 (Archive_2025)');
    archive.add(new WordFile('舊會議記錄.docx', 200, 5));
    personalNotes.add(archive);

    rootDir.add(personalNotes);
    rootDir.add(new TextFile('README.txt', 0.5, 'ASCII'));

    return rootDir;
  }

  /**
   * 計算總容量（Composite Pattern 遞迴加總）
   */
  calculateTotalSize(root: Directory): number {
    return root.getSizeKB();
  }

  /**
   * 匯出 XML（Visitor Pattern）
   */
  exportToXml(root: Directory): string {
    const visitor = new XmlExportVisitor();
    root.accept(visitor);
    return visitor.getResult();
  }

  /**
   * 依副檔名搜尋（Visitor Pattern + Observer Pattern）
   * Visitor 走訪時透過 SearchSubjectService 即時通知所有 Observer
   */
  searchByExtension(root: Directory, extension: string): string[] {
    // 重置所有節點的高亮狀態
    this.resetHighlights(root);

    // 建立 Visitor 並注入 Subject，讓走訪過程可以發事件
    const visitor = new ExtensionSearchVisitor(extension, this.searchSubject);
    root.accept(visitor);

    // 搜尋完成，發出 complete 事件
    this.searchSubject.notify({
      type: 'complete',
      message: `🏁 搜尋完成！共找到 ${visitor.getResults().length} 個結果`,
    });

    return visitor.getResults();
  }

  /**
   * 遞迴重置所有節點的高亮狀態
   */
  resetHighlights(node: FileSystemNode): void {
    node.highlightState = 'none';
    if (node instanceof Directory) {
      node.children.forEach((child) => this.resetHighlights(child));
    }
  }

  /**
   * Type Guard — 判斷節點是否為目錄
   */
  isDirectory(node: FileSystemNode): node is Directory {
    return node instanceof Directory;
  }
}
