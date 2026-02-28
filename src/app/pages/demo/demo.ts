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
import type { SearchEvent } from '../../models/behavioral/search-event.model';
import {
  FileManagerFacade,
  type SortType,
  type IDashboardDisplay,
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
//      + Decorator + Adapter + Singleton + Flyweight + Mediator + Facade Pattern
//
// 🎨 Day 8：Facade 統整所有操作入口
//   元件只依賴 FileManagerFacade，不直接接觸任何模式實作類別：
//   - Observer 生命週期：facade.initObservers() / disposeObservers()
//   - 搜尋事件流：facade.searchEvents$（RxJS Observable）
//   - 日誌裝飾：facade.formatLog()（封裝 Decorator Pattern 工廠）
//   - 剪貼簿判斷：facade.canPasteNode()（封裝 Singleton Pattern）
//   - 搜尋準備：facade.prepareSearch()（封裝 Observer reset 流程）
//   - 儀表板資料：facade.getDashboardAdapter()（回傳 IDashboardDisplay 介面）
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
  private readonly destroyRef = inject(DestroyRef);

  /**
   * GoF Observer Pattern — 兩個獨立的接收端
   * 均投扣至 Facade 持有，元件不直接知道實作類別
   *
   * ConsoleObserver：日誌觀察者，內部用 Decorator Pattern 裝飾訊息
   * SearchEventAdapter：Adapter Pattern，將 SearchEvent 轉為 IDashboardDisplay
   */

  root = signal<Directory>(new Directory('Loading...'));
  consoleOutput = signal<string>('系統準備就緒...<br>等待指令。');
  searchExt = signal<string>('.docx');

  /** Adapter Pattern — 提供 IDashboardDisplay 介面給 Dashboard 元件 */
  dashboardDisplay = signal<IDashboardDisplay | null>(null);

  selectedNode = signal<FileSystemNode | null>(null);
  activeSortType = signal<SortType | null>(null);
  activeSortDirection = signal<SortDirection>(null);

  /**
   * 是否可以貼上：
   * 1. 剪貼簿有內容
   * 2. 選中的節點是目錄（或未選取時貼到根目錄）
   */
  canPaste = computed(() => {
    // 讀取 treeVersion 確保 signal 依賴更新
    this.treeVersion();
    return this.facade.canPasteNode(this.selectedNode());
  });

  /** 遞增版本號，強制 OnPush 子元件重新渲染 */
  treeVersion = signal(0);

  /** 各標籤的即時數量（透過 TagMediator 反向索引取得） */
  tagCounts = computed(() => {
    // 讀取 treeVersion 以建立依賴，確保每次變更都重新計算
    this.treeVersion();
    return this.facade.getTagMediator().getTagCounts();
  });

  /** Observer Pattern — 統一的 HTML 日誌累積陣列 */
  private consoleLogs: string[] = ['系統準備就緒...<br>等待指令。'];

  /**
   * Decorator Pattern — 日誌推送入口（透過 Facade.formatLog 裝飾）
   * 非搜尋事件也通過此方法建立裝飾日誌流
   */
  private appendLog(message: string): void {
    this.consoleLogs.push(this.facade.formatLog(message));
    this.consoleOutput.set(this.consoleLogs.join('<br>'));
  }

  constructor() {
    this.root.set(this.facade.buildSampleTree());
    // 初始化 TagMediator（同步樹上既有標籤到中介者索引）
    this.facade.syncTagMediator(this.root());
  }

  ngOnInit(): void {
    // GoF Observer Pattern — 透過 Facade 初始化觀察者（attach）
    this.facade.initObservers();

    // RxJS 訂閱 — 處理 Angular UI 相關的即時更新（高亮、重繪）
    this.facade.searchEvents$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      this.onSearchEvent(event);
    });
  }

  ngOnDestroy(): void {
    // GoF Observer Pattern — 透過 Facade 移除觀察者（detach）
    this.facade.disposeObservers();
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
    this.syncMediator();
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
    this.syncMediator();
  }

  undo(): void {
    const command = this.facade.commandHistory.undo();
    if (command) {
      this.appendLog(`[Command] ↩️ 撤銷：${command.description}`);
      this.syncSortStateAfterUndoRedo();
      this.syncMediator();
    }
  }

  redo(): void {
    const command = this.facade.commandHistory.redo();
    if (command) {
      this.appendLog(`[Command] ↪️ 重做：${command.description}`);
      this.syncSortStateAfterUndoRedo();
      this.syncMediator();
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

  /** 過歷遍歷樹結構，統計各標籤數量 — 已由 TagMediator.getTagCounts() 取代 */
  // private countTags() — removed in Day 7

  /**
   * Mediator Pattern — 同步 TagMediator 並刷新樹版本
   * 遍歷整棵樹重建標籤索引，再觸發 OnPush 重新渲染
   */
  private syncMediator(): void {
    this.facade.syncTagMediator(this.root());
    this.treeVersion.update((v) => v + 1);
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

    // 透過 Facade 準備搜尋：重置 Observer 狀態 + 計算預期節點數
    this.facade.prepareSearch(this.root());
    this.dashboardDisplay.set(null);

    this.appendLog(`[Observer] 🔍 開始搜尋 "${currentExt}"...\n${'─'.repeat(36)}`);

    // 搜尋過程中 Subject 自動 notify → ConsoleObserver / SearchEventAdapter 各自更新
    const results = this.facade.searchByExtension(this.root(), currentExt);

    // 搜尋完成，將 Adapter（IDashboardDisplay）傳給 Dashboard 元件
    this.dashboardDisplay.set(this.facade.getDashboardAdapter());

    if (results.length === 0) {
      this.appendLog(`⚠️ 未找到符合 "${currentExt}" 的檔案。`);
    } else {
      this.appendLog(`${'─'.repeat(36)}`);
      this.appendLog(`📋 搜尋結果摘要：`);
      results.forEach((r, i) => this.appendLog(`  ${i + 1}. ${r}`));
    }
  }

  /** 遞迴計算樹的節點總數 — 已移至 Facade.countTreeNodes() */
}
