import { Injectable, signal, computed } from '@angular/core';

import type { ICommand } from './command.interface';

// ==========================================
// Command Pattern — Invoker（調用者）
// 職責：管理命令的執行歷史，提供 Undo / Redo 功能
//
// 使用兩個堆疊：
//   undoStack — 已執行的命令（可撤銷）
//   redoStack — 已撤銷的命令（可重做）
//
// 規則：
//   execute() → 推入 undoStack，清空 redoStack
//   undo()    → 從 undoStack 彈出 → 推入 redoStack
//   redo()    → 從 redoStack 彈出 → 推入 undoStack
// ==========================================

@Injectable({ providedIn: 'root' })
export class CommandHistory {
  /** 已執行命令堆疊（可 undo） */
  private undoStack = signal<ICommand[]>([]);

  /** 已撤銷命令堆疊（可 redo） */
  private redoStack = signal<ICommand[]>([]);

  /** 是否可以 Undo */
  canUndo = computed(() => this.undoStack().length > 0);

  /** 是否可以 Redo */
  canRedo = computed(() => this.redoStack().length > 0);

  /** Undo 堆疊深度 */
  undoCount = computed(() => this.undoStack().length);

  /** Redo 堆疊深度 */
  redoCount = computed(() => this.redoStack().length);

  /**
   * 執行命令並記錄到歷史
   * 執行新命令時，清空 Redo 堆疊（因為歷史分支已改變）
   */
  executeCommand(command: ICommand): void {
    command.execute();
    this.undoStack.update((stack) => [...stack, command]);
    this.redoStack.set([]);
  }

  /**
   * 撤銷最近一次命令
   * 從 undoStack 彈出 → 呼叫 undo() → 推入 redoStack
   */
  undo(): ICommand | undefined {
    const stack = this.undoStack();
    if (stack.length === 0) return undefined;

    const command = stack[stack.length - 1];
    command.undo();
    this.undoStack.set(stack.slice(0, -1));
    this.redoStack.update((redo) => [...redo, command]);
    return command;
  }

  /**
   * 重做最近一次撤銷的命令
   * 從 redoStack 彈出 → 呼叫 execute() → 推入 undoStack
   */
  redo(): ICommand | undefined {
    const redoStack = this.redoStack();
    if (redoStack.length === 0) return undefined;

    const command = redoStack[redoStack.length - 1];
    command.execute();
    this.redoStack.set(redoStack.slice(0, -1));
    this.undoStack.update((undo) => [...undo, command]);
    return command;
  }

  /** 清空所有歷史 */
  clear(): void {
    this.undoStack.set([]);
    this.redoStack.set([]);
  }
}
