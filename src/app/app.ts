import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Directory } from './models/directory.model';
import { FileSystemNode } from './models/file-system-node.model';
import { FileSystemService } from './services/file-system.service';
import { SearchSubjectService } from './observers/search-subject.service';
import type { SearchEvent } from './observers/search-event.model';

// ==========================================
// View Layer — Angular Component (UI)
// 職責：純 UI 呈現 + 委派 Service 處理業務邏輯
//
// Observer Pattern 角色：Observer（觀察者）
// 訂閱 SearchSubjectService 的事件流，
// 收到通知時更新 TreeView 高亮 & Console 進度
// ==========================================

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private readonly fileSystemService = inject(FileSystemService);
  private readonly searchSubject = inject(SearchSubjectService);
  private searchSubscription?: Subscription;

  root = signal<Directory>(new Directory('Loading...'));
  consoleOutput = signal<string>('系統準備就緒...\n等待指令。');
  searchExt = signal<string>('.docx');

  /** Console 即時進度日誌（逐行累加） */
  private consoleLogs: string[] = [];

  constructor() {
    this.root.set(this.fileSystemService.buildSampleTree());
  }

  // ==========================================
  // Observer Pattern — 訂閱 / 取消訂閱
  // ==========================================

  ngOnInit(): void {
    /**
     * Observer Pattern 的 attach（訂閱）
     * 收到 SearchSubjectService 的通知時，分派給對應的 handler
     */
    this.searchSubscription = this.searchSubject.events$.subscribe((event) => {
      this.onSearchEvent(event);
    });
  }

  ngOnDestroy(): void {
    /**
     * Observer Pattern 的 detach（取消訂閱）
     * 避免記憶體洩漏
     */
    this.searchSubscription?.unsubscribe();
  }

  // ==========================================
  // Observer 的事件處理（收到通知時執行）
  // ==========================================

  /**
   * 收到搜尋事件 — 同時更新 TreeView 高亮 & Console 進度
   */
  private onSearchEvent(event: SearchEvent): void {
    // Observer 1 行為：更新目錄樹節點的高亮狀態
    if (event.node) {
      if (event.type === 'matched') {
        event.node.highlightState = 'matched';
      } else if (event.type === 'visiting' && event.node.highlightState !== 'matched') {
        event.node.highlightState = 'visiting';
      }
    }

    // Observer 2 行為：累加 Console 進度日誌
    this.consoleLogs.push(event.message);
    this.consoleOutput.set(this.consoleLogs.join('\n'));

    // 觸發 signal 變更偵測：重新指向同一個 root 以更新 view
    this.root.set(this.root());
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

  /** 搜尋檔案（委派 Service，搭配 Observer Pattern 即時互動） */
  searchFiles(): void {
    const currentExt = this.searchExt();

    // 重置 Console 日誌
    this.consoleLogs = [`[Observer] 🔍 開始搜尋 "${currentExt}"...\n${'─'.repeat(36)}`];
    this.consoleOutput.set(this.consoleLogs[0]);

    // 執行搜尋 — Visitor 走訪時會透過 Subject 即時通知
    const results = this.fileSystemService.searchByExtension(this.root(), currentExt);

    // 搜尋完成後追加摘要
    if (results.length === 0) {
      this.consoleLogs.push(`\n⚠️ 未找到符合 "${currentExt}" 的檔案。`);
    } else {
      this.consoleLogs.push(`\n${'─'.repeat(36)}`);
      this.consoleLogs.push(`📋 搜尋結果摘要：`);
      results.forEach((r, i) => this.consoleLogs.push(`  ${i + 1}. ${r}`));
    }

    this.consoleOutput.set(this.consoleLogs.join('\n'));
  }
}
