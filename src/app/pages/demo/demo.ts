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
import { Clipboard } from '../../models/creational/clipboard.singleton';
import { SearchSubjectService } from '../../services/behavioral/search-subject.service';
import type { SearchEvent } from '../../models/behavioral/search-event.model';
import { ConsoleObserver } from '../../models/behavioral/console.observer';
import { SearchEventAdapter } from '../../models/structural/search-event.adapter';
import type { IDashboardDisplay } from '../../models/structural/search-event.adapter';
import { decorateLogEntry } from '../../models/structural/log-decorator.factory';
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
// 整合 Composite + Visitor + Observer + Command + Strategy
//      + Decorator + Adapter + Singleton Pattern
//
// Observer Pattern 整合：
//   Subject（發佈端）= SearchSubjectService
//   Observer（接收端）= ConsoleObserver / SearchEventAdapter / RxJS subscribe
//   發佈端與接收端完全解耦，可各自獨立開發
//
// 🎨 Day 5 新增：
//   Decorator Pattern — ConsoleObserver 用裝飾器鏈美化日誌
//   Adapter Pattern  — SearchEventAdapter 將事件流轉為 Dashboard 介面
//
// 🎨 Day 6 新增：
//   Command Pattern  — CopyCommand / PasteCommand（複製、貼上）
//   Singleton Pattern — Clipboard 全域共享剪貼簿
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
   *
   * ConsoleObserver：日誌觀察者，內部用 Decorator Pattern 裝飾訊息
   * SearchEventAdapter：Adapter Pattern，將 SearchEvent 轉為 IDashboardDisplay
   */
  private readonly consoleObserver = new ConsoleObserver();
  private readonly dashboardAdapter = new SearchEventAdapter();

  root = signal<Directory>(new Directory('Loading...'));
  consoleOutput = signal<string>('系統準備就緒...<br>等待指令。');
  searchExt = signal<string>('.docx');

  /** Adapter Pattern — 提供 IDashboardDisplay 介面給 Dashboard 元件 */
  dashboardDisplay = signal<IDashboardDisplay | null>(null);

  selectedNode = signal<FileSystemNode | null>(null);
  activeSortType = signal<SortType | null>(null);
  activeSortDirection = signal<SortDirection>(null);

  /** Singleton — Clipboard 實例（供 canPaste 計算用） */
  private readonly clipboard = Clipboard.getInstance();

  /**
   * 是否可以貼上：
   * 1. 剪貼簿有內容
   * 2. 選中的節點是目錄（或未選取時貼到根目錄）
   */
  canPaste = computed(() => {
    // 讀取 treeVersion 確保 signal 依賴更新
    this.treeVersion();
    if (!this.clipboard.hasContent()) return false;
    const node = this.selectedNode();
    // 未選取 → 可貼到根目錄；選取目錄 → 可貼
    return !node || node instanceof Directory;
  });

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

  /** Observer Pattern — 統一的 HTML 日誌累積陣列 */
  private consoleLogs: string[] = ['系統準備就緒...<br>等待指令。'];

  /**
   * Observer Pattern — 統一日誌推送入口
   * 非搜尋事件也透過 Decorator Pattern 裝飾後追加至日誌流
   */
  private appendLog(message: string): void {
    const decorated = decorateLogEntry(message);
    this.consoleLogs.push(decorated.render());
    this.consoleOutput.set(this.consoleLogs.join('<br>'));
  }

  constructor() {
    this.root.set(this.facade.buildSampleTree());
  }

  ngOnInit(): void {
    // GoF Observer Pattern — 註冊觀察者到 Subject（attach）
    this.searchSubject.attach(this.consoleObserver);
    this.searchSubject.attach(this.dashboardAdapter);

    // RxJS 訂閱 — 處理 Angular UI 相關的即時更新（高亮、重繪）
    this.searchSubject.events$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.onSearchEvent(event);
    });
  }

  ngOnDestroy(): void {
    // GoF Observer Pattern — 移除觀察者（detach）
    this.searchSubject.detach(this.consoleObserver);
    this.searchSubject.detach(this.dashboardAdapter);
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

  /** Command Pattern — 複製選取的節點到 Clipboard（Singleton） */
  copySelected(): void {
    const node = this.selectedNode();
    if (!node) return;

    const desc = this.facade.copyNode(node);
    this.appendLog(`[Command] 📋 ${desc}`);
    this.treeVersion.update((v) => v + 1);
  }

  /** Command Pattern — 從 Clipboard（Singleton）貼上到目標目錄 */
  pasteToSelected(): void {
    // 決定貼上目標：選中目錄 → 該目錄；未選取 → 根目錄
    const node = this.selectedNode();
    const targetDir = node instanceof Directory ? node : this.root();

    const desc = this.facade.pasteNode(targetDir);
    if (!desc) {
      this.appendLog('[Command] ⚠️ 剪貼簿為空，無法貼上');
      return;
    }

    this.appendLog(`[Command] 📌 ${desc}`);
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
    this.dashboardAdapter.reset();
    this.dashboardDisplay.set(null);

    // Adapter Pattern — 計算樹的總節點數，讓進度條能顯示百分比
    const totalNodes = this.countTreeNodes(this.root());
    this.dashboardAdapter.setExpectedTotal(totalNodes);

    this.appendLog(`[Observer] 🔍 開始搜尋 "${currentExt}"...\n${'─'.repeat(36)}`);

    // 搜尋過程中 Subject 自動 notify → ConsoleObserver / SearchEventAdapter 各自更新
    const results = this.facade.searchByExtension(this.root(), currentExt);

    // 搜尋完成，將 Adapter（IDashboardDisplay）傳給 Dashboard 元件
    this.dashboardDisplay.set(this.dashboardAdapter);

    if (results.length === 0) {
      this.appendLog(`⚠️ 未找到符合 "${currentExt}" 的檔案。`);
    } else {
      this.appendLog(`${'─'.repeat(36)}`);
      this.appendLog(`📋 搜尋結果摘要：`);
      results.forEach((r, i) => this.appendLog(`  ${i + 1}. ${r}`));
    }
  }

  /** 遞迴計算樹的總節點數（供 Adapter 計算進度百分比） */
  private countTreeNodes(node: FileSystemNode): number {
    if (node instanceof Directory) {
      return 1 + node.children.reduce((sum, child) => sum + this.countTreeNodes(child), 0);
    }
    return 1;
  }
}
