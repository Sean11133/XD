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
import { TagType, TAG_COLORS } from './models/tag.model';
import { FileSystemService } from './services/file-system.service';
import { SearchSubjectService } from './observers/search-subject.service';
import type { SearchEvent } from './observers/search-event.model';
import { CommandHistory } from './commands/command-history';
import { SortCommand } from './commands/sort.command';
import { DeleteCommand } from './commands/delete.command';
import { TagCommand } from './commands/tag.command';
import type { TagAction } from './commands/tag.command';
import { SortByNameStrategy } from './strategies/sort-by-name.strategy';
import { SortBySizeStrategy } from './strategies/sort-by-size.strategy';
import { SortByExtensionStrategy } from './strategies/sort-by-extension.strategy';
import { SortByTagStrategy } from './strategies/sort-by-tag.strategy';
import type { ISortStrategy } from './strategies/sort-strategy.interface';

/** 排序類型 */
export type SortType = 'name' | 'size' | 'extension' | 'tag';

/** 排序方向：ascending / descending / null（無排序） */
export type SortDirection = 'asc' | 'desc' | null;

// ==========================================
// View Layer — Angular Component (UI)
// 職責：純 UI 呈現 + 委派 Service 處理業務邏輯
//
// Observer Pattern 角色：Observer（觀察者）
// Command Pattern 角色：Client（建立命令）+ 透過 CommandHistory 執行
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
  readonly commandHistory = inject(CommandHistory);
  private searchSubscription?: Subscription;

  root = signal<Directory>(new Directory('Loading...'));
  consoleOutput = signal<string>('系統準備就緒...\n等待指令。');
  searchExt = signal<string>('.docx');

  /** 目前選取的節點（供刪除/標籤操作用） */
  selectedNode = signal<FileSystemNode | null>(null);

  /** 當前啟用的排序類型（null = 無排序） */
  activeSortType = signal<SortType | null>(null);

  /** 當前排序方向（null = 無排序） */
  activeSortDirection = signal<SortDirection>(null);

  /** 標籤相關 — 暴露給 Template 使用 */
  readonly TagType = TagType;
  readonly TAG_COLORS = TAG_COLORS;
  readonly allTags = [TagType.Urgent, TagType.Work, TagType.Personal];

  /** Console 即時進度日誌（逐行累加） */
  private consoleLogs: string[] = [];

  constructor() {
    this.root.set(this.fileSystemService.buildSampleTree());
  }

  // ==========================================
  // Observer Pattern — 訂閱 / 取消訂閱
  // ==========================================

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.events$.subscribe((event) => {
      this.onSearchEvent(event);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  // ==========================================
  // Observer 的事件處理
  // ==========================================

  private onSearchEvent(event: SearchEvent): void {
    if (event.node) {
      if (event.type === 'matched') {
        event.node.highlightState = 'matched';
      } else if (event.type === 'visiting' && event.node.highlightState !== 'matched') {
        event.node.highlightState = 'visiting';
      }
    }
    this.consoleLogs.push(event.message);
    this.consoleOutput.set(this.consoleLogs.join('\n'));
    this.root.set(this.root());
  }

  // ==========================================
  // 節點選取
  // ==========================================

  selectNode(node: FileSystemNode): void {
    this.selectedNode.set(node === this.selectedNode() ? null : node);
  }

  isSelected(node: FileSystemNode): boolean {
    return this.selectedNode() === node;
  }

  // ==========================================
  // Command Pattern — 排序（+ Strategy Pattern）
  // ==========================================

  /**
   * 三態排序切換：
   *  1. 未啟用 → 升冪排序
   *  2. 升冪   → 降冪排序
   *  3. 降冪   → 取消排序（Undo）
   */
  sortBy(type: SortType): void {
    const currentType = this.activeSortType();
    const currentDir = this.activeSortDirection();

    if (currentType === type) {
      if (currentDir === 'asc') {
        // 升冪 → 降冪
        this.activeSortDirection.set('desc');
        this.executeSortCommand(type, false);
      } else {
        // 降冪 → 取消排序（Undo 回到排序前）
        this.activeSortType.set(null);
        this.activeSortDirection.set(null);
        this.commandHistory.undo();
        this.consoleOutput.set(`[Command] ↩️ 取消排序`);
        this.root.set(this.root());
      }
    } else {
      // 切換到新排序 → 升冪
      this.activeSortType.set(type);
      this.activeSortDirection.set('asc');
      this.executeSortCommand(type, true);
    }
  }

  /** 建立 Strategy + Command 並執行 */
  private executeSortCommand(type: SortType, ascending: boolean): void {
    const strategyMap: Record<SortType, ISortStrategy> = {
      name: new SortByNameStrategy(ascending),
      size: new SortBySizeStrategy(ascending),
      extension: new SortByExtensionStrategy(ascending),
      tag: new SortByTagStrategy(ascending),
    };

    const command = new SortCommand(this.root(), strategyMap[type]);
    this.commandHistory.executeCommand(command);
    this.consoleOutput.set(`[Command] ✅ ${command.description}`);
    this.root.set(this.root());
  }

  /** 取得排序按鈕的 icon */
  getSortIcon(type: SortType): string {
    if (this.activeSortType() !== type) return '';
    return this.activeSortDirection() === 'asc' ? '↑ ' : '↓ ';
  }

  /** 判斷排序按鈕是否 active */
  isSortActive(type: SortType): boolean {
    return this.activeSortType() === type;
  }

  // ==========================================
  // Command Pattern — 刪除
  // ==========================================

  deleteSelected(): void {
    const node = this.selectedNode();
    if (!node) return;

    const parent = this.findParent(this.root(), node);
    if (!parent) {
      this.consoleOutput.set('[Command] ⚠️ 無法刪除根目錄');
      return;
    }

    const command = new DeleteCommand(node, parent);
    this.commandHistory.executeCommand(command);
    this.selectedNode.set(null);
    this.consoleOutput.set(`[Command] 🗑️ ${command.description}`);
    this.root.set(this.root());
  }

  // ==========================================
  // Command Pattern — 標籤
  // ==========================================

  toggleTag(tag: TagType): void {
    const node = this.selectedNode();
    if (!node) return;

    const action: TagAction = node.tags.has(tag) ? 'remove' : 'add';
    const command = new TagCommand(node, tag, action);
    this.commandHistory.executeCommand(command);
    this.consoleOutput.set(`[Command] 🏷️ ${command.description}`);
    this.root.set(this.root());
  }

  // ==========================================
  // Command Pattern — Undo / Redo
  // ==========================================

  undo(): void {
    const command = this.commandHistory.undo();
    if (command) {
      this.consoleOutput.set(`[Command] ↩️ 撤銷：${command.description}`);
      this.root.set(this.root());
    }
  }

  redo(): void {
    const command = this.commandHistory.redo();
    if (command) {
      this.consoleOutput.set(`[Command] ↪️ 重做：${command.description}`);
      this.root.set(this.root());
    }
  }

  // ==========================================
  // 既有功能
  // ==========================================

  isDirectory(node: FileSystemNode): node is Directory {
    return this.fileSystemService.isDirectory(node);
  }

  calculateTotalSize(): void {
    const total = this.fileSystemService.calculateTotalSize(this.root());
    this.consoleOutput.set(`[System] 計算總容量...\n> 所有檔案總大小為: ${total} KB`);
  }

  exportToXml(): void {
    const xml = this.fileSystemService.exportToXml(this.root());
    this.consoleOutput.set(`[System] XML 匯出結果:\n${xml}`);
  }

  searchFiles(): void {
    const currentExt = this.searchExt();
    this.consoleLogs = [`[Observer] 🔍 開始搜尋 "${currentExt}"...\n${'─'.repeat(36)}`];
    this.consoleOutput.set(this.consoleLogs[0]);

    const results = this.fileSystemService.searchByExtension(this.root(), currentExt);

    if (results.length === 0) {
      this.consoleLogs.push(`\n⚠️ 未找到符合 "${currentExt}" 的檔案。`);
    } else {
      this.consoleLogs.push(`\n${'─'.repeat(36)}`);
      this.consoleLogs.push(`📋 搜尋結果摘要：`);
      results.forEach((r, i) => this.consoleLogs.push(`  ${i + 1}. ${r}`));
    }
    this.consoleOutput.set(this.consoleLogs.join('\n'));
  }

  // ==========================================
  // Helper — 在樹中找到節點的父目錄
  // ==========================================

  private findParent(dir: Directory, target: FileSystemNode): Directory | null {
    for (const child of dir.children) {
      if (child === target) return dir;
      if (child instanceof Directory) {
        const found = this.findParent(child, target);
        if (found) return found;
      }
    }
    return null;
  }

  /** 取得標籤顏色（供 Template 使用，避免 strict 型別問題） */
  getTagColor(tag: TagType): string {
    return TAG_COLORS[tag];
  }
}
