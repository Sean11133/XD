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

/** 排序類型 */
export type SortType = 'name' | 'size' | 'extension' | 'tag';

// ==========================================
// Facade Service — 整合操作入口
//
// 封裝 Command / Strategy / Visitor / Observer 的互動，
// 讓 Component 不需直接操作底層細節。
// ==========================================

@Injectable({ providedIn: 'root' })
export class FileManagerFacade {
  private readonly fileSystem = inject(FileSystemService);
  readonly commandHistory = inject(CommandHistory);
  private readonly searchSubject = inject(SearchSubjectService);
  readonly viewState = inject(ViewStateService);

  /** Mediator Pattern — 集中管理標籤與檔案的多對多關係 */
  private readonly tagMediator = new TagMediator();

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
