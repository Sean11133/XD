import { inject, Injectable } from '@angular/core';

import { Directory } from '../../models/structural/directory.model';
import { FileSystemNode } from '../../models/structural/file-system-node.model';
import { SearchSubjectService } from '../behavioral/search-subject.service';
import { ExtensionSearchVisitor } from '../../models/behavioral/extension-search.visitor';
import { XmlExportVisitor } from '../../models/behavioral/xml-export.visitor';
import { JsonExportVisitor } from '../../models/behavioral/json-export.visitor';
import { MarkdownExportVisitor } from '../../models/behavioral/markdown-export.visitor';
import type { BaseExportVisitor } from '../../models/behavioral/base-export.visitor';
import { FileFactory } from '../../models/creational/file.factory';

/**
 * Service 層 — 封裝所有業務邏輯
 * 負責建構資料、計算容量、匯出 XML、搜尋檔案
 *
 * 🏗 結構型模式（Structural Pattern）
 * 主要支援 Composite Pattern 的樹狀結構操作
 */
/** 匯出格式類型 */
export type ExportFormat = 'xml' | 'json' | 'markdown';

@Injectable({ providedIn: 'root' })
export class FileSystemService {
  private readonly searchSubject = inject(SearchSubjectService);

  /**
   * 建構範例檔案樹（使用 FileFactory 建構物件）
   */
  buildSampleTree(): Directory {
    const rootDir = FileFactory.createDirectory('根目錄 (Root)');

    const projectDocs = FileFactory.createDirectory('專案文件 (Project_Docs)');
    projectDocs.add(FileFactory.createWord({ name: '需求規格書.docx', sizeKB: 500, pages: 15 }));
    projectDocs.add(
      FileFactory.createImage({
        name: '系統架構圖.png',
        sizeKB: 2048,
        width: 1920,
        height: 1080,
      }),
    );
    rootDir.add(projectDocs);

    const personalNotes = FileFactory.createDirectory('個人筆記 (Personal_Notes)');
    personalNotes.add(
      FileFactory.createText({ name: '待辦清單.txt', sizeKB: 1, encoding: 'UTF-8' }),
    );

    const archive = FileFactory.createDirectory('2025備份 (Archive_2025)');
    archive.add(FileFactory.createWord({ name: '舊會議記錄.docx', sizeKB: 200, pages: 5 }));
    personalNotes.add(archive);

    rootDir.add(personalNotes);
    rootDir.add(FileFactory.createText({ name: 'README.txt', sizeKB: 0.5, encoding: 'ASCII' }));

    return rootDir;
  }

  /**
   * 計算總容量（Composite Pattern 遞迴加總）
   */
  calculateTotalSize(root: Directory): number {
    return root.getSizeKB();
  }

  /**
   * 匯出 XML（Visitor + Template Method Pattern）
   */
  exportToXml(root: Directory): string {
    const visitor = new XmlExportVisitor();
    root.accept(visitor);
    return visitor.getResult();
  }

  /**
   * 匯出 JSON（Visitor + Template Method Pattern）
   */
  exportToJson(root: Directory): string {
    const visitor = new JsonExportVisitor();
    root.accept(visitor);
    return visitor.getResult();
  }

  /**
   * 匯出 Markdown（Visitor + Template Method Pattern）
   */
  exportToMarkdown(root: Directory): string {
    const visitor = new MarkdownExportVisitor();
    root.accept(visitor);
    return visitor.getResult();
  }

  /**
   * 依格式匯出（Template Method Pattern — 多型呼叫）
   * 所有匯出器共享相同骨架，只有格式細節不同
   */
  exportByFormat(root: Directory, format: ExportFormat): string {
    const visitor = this.createExporter(format);
    root.accept(visitor);
    return visitor.getResult();
  }

  /** 工廠方法 — 依格式建立對應匯出器 */
  private createExporter(format: ExportFormat): BaseExportVisitor {
    switch (format) {
      case 'xml':
        return new XmlExportVisitor();
      case 'json':
        return new JsonExportVisitor();
      case 'markdown':
        return new MarkdownExportVisitor();
    }
  }

  /**
   * 依副檔名搜尋（Visitor Pattern + Observer Pattern）
   * Visitor 走訪時透過 SearchSubjectService 即時通知所有 Observer
   */
  searchByExtension(root: Directory, extension: string): string[] {
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
   * Type Guard — 判斷節點是否為目錄
   */
  isDirectory(node: FileSystemNode): node is Directory {
    return node instanceof Directory;
  }
}
