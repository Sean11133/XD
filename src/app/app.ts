import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Directory } from './models/directory.model';
import { FileSystemNode } from './models/file-system-node.model';
import { FileSystemService } from './services/file-system.service';

// ==========================================
// View Layer — Angular Component (UI)
// 職責：純 UI 呈現 + 委派 Service 處理業務邏輯
// ==========================================

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly fileSystemService = inject(FileSystemService);

  root = signal<Directory>(new Directory('Loading...'));
  consoleOutput = signal<string>('系統準備就緒...\n等待指令。');
  searchExt = signal<string>('.docx');

  constructor() {
    this.root.set(this.fileSystemService.buildSampleTree());
  }

  /** Type Guard — 供 Template 判斷節點是否為目錄 */
  isDirectory(node: FileSystemNode): node is Directory {
    return this.fileSystemService.isDirectory(node);
  }

  /** 計算總容量（委派 Service） */
  calculateTotalSize(): void {
    const total = this.fileSystemService.calculateTotalSize(this.root());
    this.consoleOutput.set(`[System] 計算總容量...\n> 所有檔案總大小為: ${total} KB`);
  }

  /** 匯出 XML（委派 Service） */
  exportToXml(): void {
    const xml = this.fileSystemService.exportToXml(this.root());
    this.consoleOutput.set(`[System] XML 匯出結果:\n${xml}`);
  }

  /** 搜尋檔案（委派 Service） */
  searchFiles(): void {
    const currentExt = this.searchExt();
    const results = this.fileSystemService.searchByExtension(this.root(), currentExt);

    const message =
      results.length > 0
        ? `[System] 搜尋 "${currentExt}" 結果:\n${results.join('\n')}`
        : `[System] 搜尋 "${currentExt}"...\n> 未找到符合的檔案。`;

    this.consoleOutput.set(message);
  }
}
