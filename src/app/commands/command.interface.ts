// ==========================================
// Command Pattern — Command Interface
// 定義所有命令的統一介面
//
// 每個操作（排序、刪除、標籤）都封裝成物件
// 必須實作 execute() 與 undo()，讓 Invoker 統一管理
// ==========================================

/** 命令介面 — GoF Command Pattern 的核心 */
export interface ICommand {
  /** 執行命令 */
  execute(): void;

  /** 撤銷命令（還原到執行前的狀態） */
  undo(): void;

  /** 命令描述（供 Console 顯示） */
  readonly description: string;
}
