import type { IObserver } from './observer.interface';
import type { SearchEvent } from './search-event.model';

// ==========================================
// Observer Pattern — Console Observer（接收端）
//
// 職責：將 Subject 發出的搜尋事件格式化為文字日誌
//       對應 GoF 的 Concrete Observer
//
// 與 Subject 完全解耦：
//   - 不知道誰在發事件（不依賴 SearchSubjectService）
//   - 只關心 SearchEvent 資料結構
//   - 可獨立開發、獨立測試
// ==========================================

/** Console 觀察者 — 累積事件訊息為文字日誌 */
export class ConsoleObserver implements IObserver<SearchEvent> {
  /** 日誌紀錄 */
  private logs: string[] = [];

  /**
   * 接收事件通知，將訊息追加至日誌
   * Subject 每次 notify() 都會呼叫此方法
   */
  update(event: SearchEvent): void {
    this.logs.push(event.message);
  }

  /** 取得所有日誌（複本） */
  getLogs(): string[] {
    return [...this.logs];
  }

  /** 取得合併後的日誌輸出 */
  getOutput(): string {
    return this.logs.join('\n');
  }

  /** 清空日誌 */
  clear(): void {
    this.logs = [];
  }
}
