import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Directory } from '../../models/structural/directory.model';
import { FileSystemNode } from '../../models/structural/file-system-node.model';
import type { TagType } from '../../models/structural/tag.model';
import { SearchSubjectService } from '../../services/behavioral/search-subject.service';
import type { SearchEvent } from '../../models/behavioral/search-event.model';
import {
  FileManagerFacade,
  type SortType,
} from '../../services/behavioral/file-manager-facade.service';

import { ToolbarComponent } from './toolbar/toolbar';
import { TreeViewComponent } from './tree-view/tree-view';
import { ConsoleOutputComponent } from './console-output/console-output';

/** 排序方向：ascending / descending / null（無排序） */
type SortDirection = 'asc' | 'desc' | null;

// ==========================================
// Live Demo — 雲端檔案管理系統（容器元件 / Smart Component）
// 整合 Composite + Visitor + Observer + Command + Strategy Pattern
//
// 重構後僅作為 Smart Component，
// 協調子元件（Toolbar / TreeView / Console）與 Facade Service
// ==========================================

@Component({
  selector: 'app-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ToolbarComponent, TreeViewComponent, ConsoleOutputComponent],
  templateUrl: './demo.html',
  styleUrl: './demo.scss',
})
export class DemoComponent implements OnInit, OnDestroy {
  readonly facade = inject(FileManagerFacade);
  private readonly searchSubject = inject(SearchSubjectService);
  private searchSubscription?: Subscription;

  root = signal<Directory>(new Directory('Loading...'));
  consoleOutput = signal<string>('系統準備就緒...\n等待指令。');
  searchExt = signal<string>('.docx');

  selectedNode = signal<FileSystemNode | null>(null);
  activeSortType = signal<SortType | null>(null);
  activeSortDirection = signal<SortDirection>(null);

  private consoleLogs: string[] = [];

  constructor() {
    this.root.set(this.facade.buildSampleTree());
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
        this.facade.viewState.setHighlightState(event.node, 'matched');
      } else if (
        event.type === 'visiting' &&
        this.facade.viewState.getHighlightState(event.node) !== 'matched'
      ) {
        this.facade.viewState.setHighlightState(event.node, 'visiting');
      }
    }
    this.consoleLogs.push(event.message);
    this.consoleOutput.set(this.consoleLogs.join('\n'));
    this.root.set(this.root());
  }

  selectNode(node: FileSystemNode): void {
    this.selectedNode.set(node === this.selectedNode() ? null : node);
  }

  sortBy(type: SortType): void {
    const currentType = this.activeSortType();
    const currentDir = this.activeSortDirection();

    if (currentType === type) {
      if (currentDir === 'asc') {
        this.activeSortDirection.set('desc');
        const desc = this.facade.sort(this.root(), type, false);
        this.consoleOutput.set(`[Command] ✅ ${desc}`);
        this.root.set(this.root());
      } else {
        this.activeSortType.set(null);
        this.activeSortDirection.set(null);
        this.facade.commandHistory.undo();
        this.consoleOutput.set(`[Command] ↩️ 取消排序`);
        this.root.set(this.root());
      }
    } else {
      this.activeSortType.set(type);
      this.activeSortDirection.set('asc');
      const desc = this.facade.sort(this.root(), type, true);
      this.consoleOutput.set(`[Command] ✅ ${desc}`);
      this.root.set(this.root());
    }
  }

  deleteSelected(): void {
    const node = this.selectedNode();
    if (!node) return;

    const desc = this.facade.deleteNode(node, this.root());
    if (!desc) {
      this.consoleOutput.set('[Command] ⚠️ 無法刪除根目錄');
      return;
    }

    this.selectedNode.set(null);
    this.consoleOutput.set(`[Command] 🗑️ ${desc}`);
    this.root.set(this.root());
  }

  toggleTag(tag: TagType): void {
    const node = this.selectedNode();
    if (!node) return;

    const desc = this.facade.toggleTag(node, tag);
    this.consoleOutput.set(`[Command] 🏷️ ${desc}`);
    this.root.set(this.root());
  }

  undo(): void {
    const command = this.facade.commandHistory.undo();
    if (command) {
      this.consoleOutput.set(`[Command] ↩️ 撤銷：${command.description}`);
      this.root.set(this.root());
    }
  }

  redo(): void {
    const command = this.facade.commandHistory.redo();
    if (command) {
      this.consoleOutput.set(`[Command] ↪️ 重做：${command.description}`);
      this.root.set(this.root());
    }
  }

  calculateTotalSize(): void {
    const total = this.facade.calculateTotalSize(this.root());
    this.consoleOutput.set(`[System] 計算總容量...\n> 所有檔案總大小為: ${total} KB`);
  }

  exportToXml(): void {
    const xml = this.facade.exportToXml(this.root());
    this.consoleOutput.set(`[System] XML 匯出結果:\n${xml}`);
  }

  searchFiles(): void {
    const currentExt = this.searchExt();
    this.consoleLogs = [`[Observer] 🔍 開始搜尋 "${currentExt}"...\n${'─'.repeat(36)}`];
    this.consoleOutput.set(this.consoleLogs[0]);

    const results = this.facade.searchByExtension(this.root(), currentExt);

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
