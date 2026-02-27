import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Directory } from '../../models/structural/directory.model';
import { FileSystemNode } from '../../models/structural/file-system-node.model';
import type { TagType } from '../../models/structural/tag.model';
import { TagType as TagTypeEnum } from '../../models/structural/tag.model';
import { SearchSubjectService } from '../../services/behavioral/search-subject.service';
import type { SearchEvent } from '../../models/behavioral/search-event.model';
import { ConsoleObserver } from '../../models/behavioral/console.observer';
import { DashboardObserver } from '../../models/behavioral/dashboard.observer';
import type { DashboardStats } from '../../models/behavioral/dashboard.observer';
import {
  FileManagerFacade,
  type SortType,
} from '../../services/behavioral/file-manager-facade.service';
import type { ExportFormat } from '../../services/structural/file-system.service';

import { ToolbarComponent } from './toolbar/toolbar';
import { TreeViewComponent } from './tree-view/tree-view';
import { ConsoleOutputComponent } from './console-output/console-output';
import { DashboardPanelComponent } from './dashboard-panel/dashboard-panel';

/** 排序方向：ascending / descending / null（無排序） */
type SortDirection = 'asc' | 'desc' | null;

// ==========================================
// Live Demo — 雲端檔案管理系統（容器元件 / Smart Component）
// 整合 Composite + Visitor + Observer + Command + Strategy Pattern
//
// Observer Pattern 整合：
//   Subject（發佈端）= SearchSubjectService
//   Observer（接收端）= ConsoleObserver / DashboardObserver / RxJS subscribe
//   發佈端與接收端完全解耦，可各自獨立開發
// ==========================================

@Component({
  selector: 'app-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ToolbarComponent,
    TreeViewComponent,
    ConsoleOutputComponent,
    DashboardPanelComponent,
  ],
  templateUrl: './demo.html',
  styleUrl: './demo.scss',
})
export class DemoComponent implements OnInit, OnDestroy {
  readonly facade = inject(FileManagerFacade);
  private readonly searchSubject = inject(SearchSubjectService);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * GoF Observer Pattern — 兩個獨立的接收端
   * 各自關注不同面向，與 Subject 完全解耦
   */
  private readonly consoleObserver = new ConsoleObserver();
  private readonly dashboardObserver = new DashboardObserver();

  root = signal<Directory>(new Directory('Loading...'));
  consoleOutput = signal<string>('系統準備就緒...\n等待指令。');
  searchExt = signal<string>('.docx');

  /** DashboardObserver 的即時統計資料 */
  dashboardStats = signal<DashboardStats | null>(null);

  selectedNode = signal<FileSystemNode | null>(null);
  activeSortType = signal<SortType | null>(null);
  activeSortDirection = signal<SortDirection>(null);

  /** 遞增版本號，強制 OnPush 子元件重新渲染 */
  treeVersion = signal(0);

  /** 各標籤的即時數量（遍歷整棵樹計算） */
  tagCounts = computed(() => {
    // 讀取 treeVersion 以建立依賴，確保每次變更都重新計算
    this.treeVersion();
    const counts: Record<string, number> = {};
    for (const tag of [TagTypeEnum.Urgent, TagTypeEnum.Work, TagTypeEnum.Personal]) {
      counts[tag] = 0;
    }
    this.countTags(this.root(), counts);
    return counts as Record<TagType, number>;
  });

  /** Observer Pattern — 統一的日誌累積陣列 */
  private consoleLogs: string[] = ['系統準備就緒...\n等待指令。'];

  /**
   * Observer Pattern — 統一日誌推送入口
   * 所有操作事件都透過此方法追加至日誌流，
   * 確保 Console（Observer）完整記錄所有歷程。
   */
  private appendLog(message: string): void {
    this.consoleLogs.push(message);
    this.consoleOutput.set(this.consoleLogs.join('\n'));
  }

  constructor() {
    this.root.set(this.facade.buildSampleTree());
  }

  ngOnInit(): void {
    // GoF Observer Pattern — 註冊觀察者到 Subject（attach）
    this.searchSubject.attach(this.consoleObserver);
    this.searchSubject.attach(this.dashboardObserver);

    // RxJS 訂閱 — 處理 Angular UI 相關的即時更新（高亮、重繪）
    this.searchSubject.events$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.onSearchEvent(event);
    });
  }

  ngOnDestroy(): void {
    // GoF Observer Pattern — 移除觀察者（detach）
    this.searchSubject.detach(this.consoleObserver);
    this.searchSubject.detach(this.dashboardObserver);
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
    this.appendLog(event.message);
    this.treeVersion.update((v) => v + 1);
  }

  selectNode(node: FileSystemNode): void {
    this.selectedNode.set(node === this.selectedNode() ? null : node);
  }

  sortBy(type: SortType): void {
    const currentType = this.activeSortType();
    const currentDir = this.activeSortDirection();

    if (currentType === type) {
      // 同一排序類型再點一次：切換升降序
      const newAsc = currentDir !== 'asc';
      this.activeSortDirection.set(newAsc ? 'asc' : 'desc');
      const desc = this.facade.sort(this.root(), type, newAsc);
      this.appendLog(`[Command] ✅ ${desc}`);
      this.treeVersion.update((v) => v + 1);
    } else {
      // 不同排序類型：預設升序
      this.activeSortType.set(type);
      this.activeSortDirection.set('asc');
      const desc = this.facade.sort(this.root(), type, true);
      this.appendLog(`[Command] ✅ ${desc}`);
      this.treeVersion.update((v) => v + 1);
    }
  }

  deleteSelected(): void {
    const node = this.selectedNode();
    if (!node) return;

    const desc = this.facade.deleteNode(node, this.root());
    if (!desc) {
      this.appendLog('[Command] ⚠️ 無法刪除根目錄');
      return;
    }

    this.selectedNode.set(null);
    this.appendLog(`[Command] 🗑️ ${desc}`);
    this.treeVersion.update((v) => v + 1);
  }

  toggleTag(tag: TagType): void {
    const node = this.selectedNode();
    if (!node) return;

    const desc = this.facade.toggleTag(node, tag);
    this.appendLog(`[Command] 🏷️ ${desc}`);
    this.treeVersion.update((v) => v + 1);
  }

  undo(): void {
    const command = this.facade.commandHistory.undo();
    if (command) {
      this.appendLog(`[Command] ↩️ 撤銷：${command.description}`);
      this.syncSortStateAfterUndoRedo();
      this.treeVersion.update((v) => v + 1);
    }
  }

  redo(): void {
    const command = this.facade.commandHistory.redo();
    if (command) {
      this.appendLog(`[Command] ↪️ 重做：${command.description}`);
      this.syncSortStateAfterUndoRedo();
      this.treeVersion.update((v) => v + 1);
    }
  }

  /**
   * Undo / Redo 後同步排序 UI 狀態
   * 委派給 CommandHistory.getLastSortState()，避免直接存取堆疊內部細節
   */
  private syncSortStateAfterUndoRedo(): void {
    const sortState = this.facade.commandHistory.getLastSortState();
    if (sortState) {
      this.activeSortType.set(sortState.sortType);
      this.activeSortDirection.set(sortState.ascending ? 'asc' : 'desc');
    } else {
      this.activeSortType.set(null);
      this.activeSortDirection.set(null);
    }
  }

  /** 遞迴遍歷樹結構，統計各標籤數量 */
  private countTags(node: FileSystemNode, counts: Record<string, number>): void {
    for (const tag of node.tags) {
      if (tag in counts) counts[tag]++;
    }
    if (node instanceof Directory) {
      for (const child of node.children) {
        this.countTags(child, counts);
      }
    }
  }

  calculateTotalSize(): void {
    const total = this.facade.calculateTotalSize(this.root());
    this.appendLog(`[System] 計算總容量...\n> 所有檔案總大小為: ${total} KB`);
  }

  exportToXml(): void {
    const xml = this.facade.exportToXml(this.root());
    this.appendLog(`[System] XML 匯出結果:\n${xml}`);
  }

  /**
   * Template Method Pattern — 依格式匯出
   * 所有匯出器共享相同骨架（脫逸、縮排），只有格式細節不同
   */
  exportByFormat(format: ExportFormat): void {
    const formatLabels: Record<ExportFormat, string> = {
      xml: 'XML',
      json: 'JSON',
      markdown: 'Markdown',
    };
    const result = this.facade.exportByFormat(this.root(), format);
    this.appendLog(`[System] ${formatLabels[format]} 匯出結果:\n${result}`);
  }

  searchFiles(): void {
    const currentExt = this.searchExt();

    // 重置 GoF Observer 狀態（每次搜尋重新計數）
    this.consoleObserver.clear();
    this.dashboardObserver.reset();
    this.dashboardStats.set(null);

    this.appendLog(`[Observer] 🔍 開始搜尋 "${currentExt}"...\n${'─'.repeat(36)}`);

    // 搜尋過程中 Subject 自動 notify → ConsoleObserver / DashboardObserver 各自更新
    const results = this.facade.searchByExtension(this.root(), currentExt);

    // 搜尋完成，從 DashboardObserver 取得統計
    this.dashboardStats.set(this.dashboardObserver.getStats());

    if (results.length === 0) {
      this.appendLog(`⚠️ 未找到符合 "${currentExt}" 的檔案。`);
    } else {
      this.appendLog(`${'─'.repeat(36)}`);
      this.appendLog(`📋 搜尋結果摘要：`);
      results.forEach((r, i) => this.appendLog(`  ${i + 1}. ${r}`));
    }
  }
}
