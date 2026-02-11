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

import { Directory } from '../../models/structural/directory.model';
import { FileSystemNode } from '../../models/structural/file-system-node.model';
import { TagType, TAG_COLORS } from '../../models/structural/tag.model';
import { FileSystemService } from '../../services/structural/file-system.service';
import { SearchSubjectService } from '../../services/behavioral/search-subject.service';
import type { SearchEvent } from '../../models/behavioral/search-event.model';
import { CommandHistory } from '../../services/behavioral/command-history.service';
import { SortCommand } from '../../models/behavioral/sort.command';
import { DeleteCommand } from '../../models/behavioral/delete.command';
import { TagCommand } from '../../models/behavioral/tag.command';
import type { TagAction } from '../../models/behavioral/tag.command';
import { SortByNameStrategy } from '../../models/behavioral/sort-by-name.strategy';
import { SortBySizeStrategy } from '../../models/behavioral/sort-by-size.strategy';
import { SortByExtensionStrategy } from '../../models/behavioral/sort-by-extension.strategy';
import { SortByTagStrategy } from '../../models/behavioral/sort-by-tag.strategy';
import type { ISortStrategy } from '../../models/behavioral/sort-strategy.interface';

/** 排序類型 */
export type SortType = 'name' | 'size' | 'extension' | 'tag';

/** 排序方向：ascending / descending / null（無排序） */
export type SortDirection = 'asc' | 'desc' | null;

// ==========================================
// Live Demo — 雲端檔案管理系統
// 整合 Composite + Visitor + Observer + Command + Strategy Pattern
// ==========================================

@Component({
  selector: 'app-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './demo.html',
  styleUrl: './demo.scss',
})
export class DemoComponent implements OnInit, OnDestroy {
  private readonly fileSystemService = inject(FileSystemService);
  private readonly searchSubject = inject(SearchSubjectService);
  readonly commandHistory = inject(CommandHistory);
  private searchSubscription?: Subscription;

  root = signal<Directory>(new Directory('Loading...'));
  consoleOutput = signal<string>('系統準備就緒...\n等待指令。');
  searchExt = signal<string>('.docx');

  selectedNode = signal<FileSystemNode | null>(null);
  activeSortType = signal<SortType | null>(null);
  activeSortDirection = signal<SortDirection>(null);

  readonly TagType = TagType;
  readonly TAG_COLORS = TAG_COLORS;
  readonly allTags = [TagType.Urgent, TagType.Work, TagType.Personal];

  private consoleLogs: string[] = [];

  constructor() {
    this.root.set(this.fileSystemService.buildSampleTree());
  }

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.events$.subscribe((event) => {
      this.onSearchEvent(event);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

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

  selectNode(node: FileSystemNode): void {
    this.selectedNode.set(node === this.selectedNode() ? null : node);
  }

  isSelected(node: FileSystemNode): boolean {
    return this.selectedNode() === node;
  }

  sortBy(type: SortType): void {
    const currentType = this.activeSortType();
    const currentDir = this.activeSortDirection();

    if (currentType === type) {
      if (currentDir === 'asc') {
        this.activeSortDirection.set('desc');
        this.executeSortCommand(type, false);
      } else {
        this.activeSortType.set(null);
        this.activeSortDirection.set(null);
        this.commandHistory.undo();
        this.consoleOutput.set(`[Command] ↩️ 取消排序`);
        this.root.set(this.root());
      }
    } else {
      this.activeSortType.set(type);
      this.activeSortDirection.set('asc');
      this.executeSortCommand(type, true);
    }
  }

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

  getSortIcon(type: SortType): string {
    if (this.activeSortType() !== type) return '';
    return this.activeSortDirection() === 'asc' ? '↑ ' : '↓ ';
  }

  isSortActive(type: SortType): boolean {
    return this.activeSortType() === type;
  }

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

  toggleTag(tag: TagType): void {
    const node = this.selectedNode();
    if (!node) return;

    const action: TagAction = node.tags.has(tag) ? 'remove' : 'add';
    const command = new TagCommand(node, tag, action);
    this.commandHistory.executeCommand(command);
    this.consoleOutput.set(`[Command] 🏷️ ${command.description}`);
    this.root.set(this.root());
  }

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

  getTagColor(tag: TagType): string {
    return TAG_COLORS[tag];
  }
}
