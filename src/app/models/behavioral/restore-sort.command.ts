import { Directory } from '../structural/directory.model';
import type { FileSystemNode } from '../structural/file-system-node.model';
import type { ICommand } from './command.interface';

// ==========================================
// Command Pattern — Concrete Command（還原排序命令）
//
// 取消排序也是一個正規 Command，可被 Undo / Redo。
// execute()：還原到排序前的原始順序
// undo()：重新套用排序後的順序
// ==========================================

export class RestoreSortCommand implements ICommand {
  readonly description: string;

  /** 還原前的快照（即排序後的順序），用於 undo 時恢復 */
  private sortedOrders = new Map<Directory, FileSystemNode[]>();

  /** 還原目標（即排序前的原始順序） */
  private originalOrders: Map<Directory, FileSystemNode[]>;

  constructor(
    private root: Directory,
    originalOrders: Map<Directory, FileSystemNode[]>,
    sortName: string,
  ) {
    this.description = `取消排序：${sortName}`;
    // 深拷貝 map 中的陣列引用
    this.originalOrders = new Map(
      [...originalOrders].map(([dir, children]) => [dir, [...children]]),
    );
  }

  execute(): void {
    // 先保存當前排序後的順序（供 undo 使用）
    this.sortedOrders.clear();
    for (const [dir] of this.originalOrders) {
      this.sortedOrders.set(dir, [...dir.children]);
    }

    // 還原為原始順序
    for (const [dir, originalChildren] of this.originalOrders) {
      dir.children = [...originalChildren];
    }
  }

  undo(): void {
    // 重新套用排序後的順序
    for (const [dir, sortedChildren] of this.sortedOrders) {
      dir.children = [...sortedChildren];
    }
  }
}
