import { inject, Injectable } from '@angular/core';

import type { FileSystemNode } from '../../models/structural/file-system-node.model';
import { Directory } from '../../models/structural/directory.model';
import type { TagType } from '../../models/structural/tag.model';
import { FileSystemService } from '../structural/file-system.service';
import { CommandHistory } from './command-history.service';
import { SearchSubjectService } from './search-subject.service';
import { ViewStateService } from './view-state.service';
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

  /** 建立排序策略對應表 */
  private createStrategy(type: SortType, ascending: boolean): ISortStrategy {
    const strategyMap: Record<SortType, ISortStrategy> = {
      name: new SortByNameStrategy(ascending),
      size: new SortBySizeStrategy(ascending),
      extension: new SortByExtensionStrategy(ascending),
      tag: new SortByTagStrategy(ascending),
    };
    return strategyMap[type];
  }

  /** 排序 */
  sort(root: Directory, type: SortType, ascending: boolean): string {
    const strategy = this.createStrategy(type, ascending);
    const command = new SortCommand(root, strategy);
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

  /** 切換標籤 */
  toggleTag(node: FileSystemNode, tag: TagType): string {
    const action: TagAction = node.tags.has(tag) ? 'remove' : 'add';
    const command = new TagCommand(node, tag, action);
    this.commandHistory.executeCommand(command);
    return command.description;
  }

  /** 計算總容量 */
  calculateTotalSize(root: Directory): number {
    return this.fileSystem.calculateTotalSize(root);
  }

  /** 匯出 XML */
  exportToXml(root: Directory): string {
    return this.fileSystem.exportToXml(root);
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
