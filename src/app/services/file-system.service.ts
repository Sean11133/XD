import { Injectable } from '@angular/core';

import { Directory } from '../models/directory.model';
import { FileSystemNode } from '../models/file-system-node.model';
import { ImageFile } from '../models/image-file.model';
import { TextFile } from '../models/text-file.model';
import { WordFile } from '../models/word-file.model';
import { ExtensionSearchVisitor } from '../visitors/extension-search.visitor';
import { XmlExportVisitor } from '../visitors/xml-export.visitor';

/**
 * Service 層 — 封裝所有業務邏輯
 * 負責建構資料、計算容量、匯出 XML、搜尋檔案
 */
@Injectable({ providedIn: 'root' })
export class FileSystemService {
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
   * 依副檔名搜尋（Visitor Pattern）
   */
  searchByExtension(root: Directory, extension: string): string[] {
    const visitor = new ExtensionSearchVisitor(extension);
    root.accept(visitor);
    return visitor.getResults();
  }

  /**
   * Type Guard — 判斷節點是否為目錄
   */
  isDirectory(node: FileSystemNode): node is Directory {
    return node instanceof Directory;
  }
}
