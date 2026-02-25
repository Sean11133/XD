import { Directory } from '../structural/directory.model';
import type { FileSystemNode } from '../structural/file-system-node.model';
import type { ISortStrategy } from './sort-strategy.interface';
import type { ICommand } from './command.interface';

/** 排序類型（與 Facade 的 SortType 一致） */
export type SortType = 'name' | 'size' | 'extension' | 'tag';

// ==========================================
// Command Pattern — Concrete Command（排序命令）
// Strategy Pattern — 透過 ISortStrategy 抽換排序演算法
//
// execute()：對目錄的 children 進行排序（遞迴所有子目錄）
// undo()：還原排序前的順序
// ==========================================

export class SortCommand implements ICommand {
  readonly description: string;

  /** 排序類型（供 UI 狀態同步使用） */
  readonly sortType: SortType;

  /** 是否升序（供 UI 狀態同步使用） */
  readonly ascending: boolean;

  /** 排序前的快照：Map<Directory, 原始 children 順序> */
  private _previousOrders = new Map<Directory, FileSystemNode[]>();

  /** 取得排序前的快照（供 RestoreSortCommand 使用） */
  get previousOrders(): Map<Directory, FileSystemNode[]> {
    return this._previousOrders;
  }

  constructor(
    private root: Directory,
    private strategy: ISortStrategy,
    sortType: SortType,
    ascending: boolean,
  ) {
    this.description = `排序：${strategy.name}`;
    this.sortType = sortType;
    this.ascending = ascending;
  }

  execute(): void {
    this._previousOrders.clear();
    this.sortRecursive(this.root);
  }

  undo(): void {
    // 還原所有目錄的 children 順序
    for (const [dir, originalChildren] of this._previousOrders) {
      dir.children = [...originalChildren];
    }
  }

  /** 遞迴排序所有子目錄 */
  private sortRecursive(dir: Directory): void {
    // 1. 先保存當前順序（深拷貝陣列引用）
    this._previousOrders.set(dir, [...dir.children]);

    // 2. 用 Strategy 排序
    dir.children = this.strategy.sort(dir.children);

    // 3. 遞迴處理子目錄
    for (const child of dir.children) {
      if (child instanceof Directory) {
        this.sortRecursive(child);
      }
    }
  }
}
