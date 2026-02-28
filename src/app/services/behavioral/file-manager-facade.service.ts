import { inject, Injectable } from '@angular/core';

import type { FileSystemNode } from '../../models/structural/file-system-node.model';
import { Directory } from '../../models/structural/directory.model';
import type { TagType } from '../../models/structural/tag.model';
import { FileSystemService } from '../structural/file-system.service';
import type { ExportFormat } from '../structural/file-system.service';
import { CommandHistory } from './command-history.service';
import { SearchSubjectService } from './search-subject.service';
import { ViewStateService } from './view-state.service';
import { SortCommand } from '../../models/behavioral/sort.command';
import { RestoreSortCommand } from '../../models/behavioral/restore-sort.command';
import { DeleteCommand } from '../../models/behavioral/delete.command';
import { TagCommand } from '../../models/behavioral/tag.command';
import type { TagAction } from '../../models/behavioral/tag.command';
import { TagMediator } from '../../models/behavioral/tag.mediator';
import { CopyCommand } from '../../models/behavioral/copy.command';
import { PasteCommand } from '../../models/behavioral/paste.command';
import { Clipboard } from '../../models/creational/clipboard.singleton';
import { SortByNameStrategy } from '../../models/behavioral/sort-by-name.strategy';
import { SortBySizeStrategy } from '../../models/behavioral/sort-by-size.strategy';
import { SortByExtensionStrategy } from '../../models/behavioral/sort-by-extension.strategy';
import { SortByTagStrategy } from '../../models/behavioral/sort-by-tag.strategy';
import type { ISortStrategy } from '../../models/behavioral/sort-strategy.interface';
import { ConsoleObserver } from '../../models/behavioral/console.observer';
import { SearchEventAdapter } from '../../models/structural/search-event.adapter';
import type { IDashboardDisplay } from '../../models/structural/search-event.adapter';
import { decorateLogEntry } from '../../models/structural/log-decorator.factory';

/** 排序類型 */
export type SortType = 'name' | 'size' | 'extension' | 'tag';

/** 重新匯出儀表板介面，讓 UI 層不必直接依賴 Adapter 實作模組 */
export type { IDashboardDisplay };

// ==========================================
// Facade Service — 整合操作入口（Day 8 完成版）
//
// 封裝所有模式的互動，Component 只需與本 Facade 溝通：
//   Command + Strategy + Visitor：排序、刪除、標籤、匯出、搜尋
//   Observer：管理 ConsoleObserver / SearchEventAdapter 生命週期
//   Singleton：Clipboard 存取、貼上判斷
//   Flyweight：LabelFactory 透過 TagMediator 回傳 Label
//   Mediator：TagMediator 集中管理標籤索引
//   Decorator：formatLog() 內建日誌裝飾鏈
// ==========================================

@Injectable({ providedIn: 'root' })
export class FileManagerFacade {
  private readonly fileSystem = inject(FileSystemService);
  readonly commandHistory = inject(CommandHistory);
  private readonly searchSubject = inject(SearchSubjectService);
  readonly viewState = inject(ViewStateService);

  /** Mediator Pattern — 集中管理標籤與檔案的多對多關係 */
  private readonly tagMediator = new TagMediator();

  /** Observer Pattern — 日誌觀察者（內建 Decorator 裝飾鏈） */
  private readonly consoleObserver = new ConsoleObserver();

  /** Adapter Pattern — 將 SearchEvent 轉換為 IDashboardDisplay 介面 */
  private readonly dashboardAdapter = new SearchEventAdapter();

  // ──────────────────────────────────────────
  // Observer 生命週期管理
  // ──────────────────────────────────────────

  /**
   * 初始化 Observer（GoF Observer Pattern — attach）
   * 在元件 ngOnInit 時呼叫，讓兩個 Observer 開始接收搜尋事件
   */
  initObservers(): void {
    this.searchSubject.attach(this.consoleObserver);
    this.searchSubject.attach(this.dashboardAdapter);
  }

  /**
   * 清理 Observer（GoF Observer Pattern — detach）
   * 在元件 ngOnDestroy 時呼叫，防止記憶體洩漏
   */
  disposeObservers(): void {
    this.searchSubject.detach(this.consoleObserver);
    this.searchSubject.detach(this.dashboardAdapter);
  }

  /** 取得 ConsoleObserver（供讀取 HTML 日誌輸出） */
  getConsoleObserver(): ConsoleObserver {
    return this.consoleObserver;
  }

  /**
   * 取得儀表板資料介面（Adapter Pattern）
   * 回傳 IDashboardDisplay 而非 SearchEventAdapter，
   * 確保呼叫端只依賴目標介面，不接觸 Adaptee 細節
   */
  getDashboardAdapter(): IDashboardDisplay {
    return this.dashboardAdapter;
  }

  /**
   * RxJS 搜尋事件流（供 UI 訂閱即時高亮更新）
   * 暴露 Observable 而非注入 SearchSubjectService，
   * 讓 Component 不需直接依賴底層 Subject 服務
   */
  get searchEvents$() {
    return this.searchSubject.events$;
  }

  // ──────────────────────────────────────────
  // 日誌 / 工具
  // ──────────────────────────────────────────

  /**
   * Decorator Pattern — 格式化日誌訊息為 HTML 字串
   * 封裝 decorateLogEntry 工廠，Component 不需知道裝飾器存在
   */
  formatLog(message: string): string {
    return decorateLogEntry(message).render();
  }

  /**
   * 是否可執行貼上操作
   * @param node 目前選取的節點（null 表示未選取，可貼至根目錄）
   */
  canPasteNode(node: FileSystemNode | null): boolean {
    return this.getClipboard().hasContent() && (!node || node instanceof Directory);
  }

  /**
   * 搜尋前準備：重置觀察者狀態並設定進度基準
   * 封裝「清除 → 重置 → 設定 expected total」三步驟
   */
  prepareSearch(root: FileSystemNode): void {
    this.consoleObserver.clear();
    this.dashboardAdapter.reset();
    const totalNodes = this.countTreeNodes(root);
    this.dashboardAdapter.setExpectedTotal(totalNodes);
  }

  /**
   * 遞迴計算樹的節點總數（供搜尋進度百分比計算）
   */
  countTreeNodes(node: FileSystemNode): number {
    if (node instanceof Directory) {
      return 1 + node.children.reduce((sum, child) => sum + this.countTreeNodes(child), 0);
    }
    return 1;
  }

  // ──────────────────────────────────────────
  // 排序
  // ──────────────────────────────────────────

  /** 建立排序策略（依類型動態建立，避免每次建構全部策略物件） */
  private createStrategy(type: SortType, ascending: boolean): ISortStrategy {
    switch (type) {
      case 'name':
        return new SortByNameStrategy(ascending);
      case 'size':
        return new SortBySizeStrategy(ascending);
      case 'extension':
        return new SortByExtensionStrategy(ascending);
      case 'tag':
        return new SortByTagStrategy(ascending);
    }
  }

  /** 排序 */
  sort(root: Directory, type: SortType, ascending: boolean): string {
    const strategy = this.createStrategy(type, ascending);
    const command = new SortCommand(root, strategy, type, ascending);
    this.commandHistory.executeCommand(command);
    return command.description;
  }

  /** 取消排序（封裝為正規 Command，可被 undo/redo） */
  restoreSort(root: Directory, lastSortCommand: SortCommand): string {
    const command = new RestoreSortCommand(
      root,
      lastSortCommand.previousOrders,
      lastSortCommand.description,
    );
    this.commandHistory.executeCommand(command);
    return command.description;
  }

  /** 刪除節點 */
  deleteNode(node: FileSystemNode, root: Directory): string | null {
    const parent = this.findParent(root, node);
    if (!parent) return null;

    const command = new DeleteCommand(node, parent);
    this.commandHistory.executeCommand(command);
    return command.description;
  }

  /** 切換標籤（Mediator + Command + Flyweight） */
  toggleTag(node: FileSystemNode, tag: TagType): string {
    const action: TagAction = this.tagMediator.hasTag(node, tag) ? 'remove' : 'add';
    const command = new TagCommand(node, tag, action, this.tagMediator);
    this.commandHistory.executeCommand(command);
    return command.description;
  }

  /** 取得 TagMediator（供元件查詢標籤計數、反向查詢） */
  getTagMediator(): TagMediator {
    return this.tagMediator;
  }

  /** 同步 TagMediator 索引（遍歷整棵樹重建正向/反向索引） */
  syncTagMediator(root: Directory): void {
    this.tagMediator.syncFromTree(root);
  }

  /** 複製節點到剪貼簿（Singleton + Command） */
  copyNode(node: FileSystemNode): string {
    const command = new CopyCommand(node);
    this.commandHistory.executeCommand(command);
    return command.description;
  }

  /** 從剪貼簿貼上到目標目錄（Singleton + Command） */
  pasteNode(targetDir: Directory): string | null {
    const clipboard = Clipboard.getInstance();
    if (!clipboard.hasContent()) return null;

    const command = new PasteCommand(targetDir);
    this.commandHistory.executeCommand(command);
    return command.description;
  }

  /** Singleton — 取得剪貼簿實例（供 UI 判斷是否可貼上） */
  getClipboard(): Clipboard {
    return Clipboard.getInstance();
  }

  /** 計算總容量 */
  calculateTotalSize(root: Directory): number {
    return this.fileSystem.calculateTotalSize(root);
  }

  /** 匯出 XML */
  exportToXml(root: Directory): string {
    return this.fileSystem.exportToXml(root);
  }

  /** 依格式匯出（Template Method Pattern — 多型呼叫） */
  exportByFormat(root: Directory, format: ExportFormat): string {
    return this.fileSystem.exportByFormat(root, format);
  }

  /** 依副檔名搜尋 */
  searchByExtension(root: Directory, extension: string): string[] {
    // 重置 UI 高亮狀態
    this.viewState.resetTree(root);
    return this.fileSystem.searchByExtension(root, extension);
  }

  /** 建構範例檔案樹 */
  buildSampleTree(): Directory {
    return this.fileSystem.buildSampleTree();
  }

  /** 在樹中尋找指定節點的父目錄 */
  findParent(dir: Directory, target: FileSystemNode): Directory | null {
    for (const child of dir.children) {
      if (child === target) return dir;
      if (child instanceof Directory) {
        const found = this.findParent(child, target);
        if (found) return found;
      }
    }
    return null;
  }

  /** Type Guard — 判斷節點是否為目錄 */
  isDirectory(node: FileSystemNode): node is Directory {
    return node instanceof Directory;
  }
}
