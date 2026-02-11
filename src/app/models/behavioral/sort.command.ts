import { Directory } from '../structural/directory.model';
import type { FileSystemNode } from '../structural/file-system-node.model';
import type { ISortStrategy } from './sort-strategy.interface';
import type { ICommand } from './command.interface';

// ==========================================
// Command Pattern — Concrete Command（排序命令）
// Strategy Pattern — 透過 ISortStrategy 抽換排序演算法
//
// execute()：對目錄的 children 進行排序（遞迴所有子目錄）
// undo()：還原排序前的順序
// ==========================================

export class SortCommand implements ICommand {
  readonly description: string;

  /** 排序前的快照：Map<Directory, 原始 children 順序> */
  private previousOrders = new Map<Directory, FileSystemNode[]>();

  constructor(
    private root: Directory,
    private strategy: ISortStrategy,
  ) {
    this.description = `排序：${strategy.name}`;
  }

  execute(): void {
    this.previousOrders.clear();
    this.sortRecursive(this.root);
  }

  undo(): void {
    // 還原所有目錄的 children 順序
    for (const [dir, originalChildren] of this.previousOrders) {
      dir.children = [...originalChildren];
    }
  }

  /** 遞迴排序所有子目錄 */
  private sortRecursive(dir: Directory): void {
    // 1. 先保存當前順序（深拷貝陣列引用）
    this.previousOrders.set(dir, [...dir.children]);

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
