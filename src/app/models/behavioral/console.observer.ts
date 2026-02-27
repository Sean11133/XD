import type { IObserver } from './observer.interface';
import type { SearchEvent } from './search-event.model';
import { decorateLogEntry } from '../structural/log-decorator.factory';
import type { LogCategory } from '../structural/log-decorator.factory';

// ==========================================
// Observer Pattern — Console Observer（接收端）
//
// 職責：將 Subject 發出的搜尋事件格式化為 HTML 日誌
//       對應 GoF 的 Concrete Observer
//
// 🎨 Day 5 整合 Decorator Pattern：
//   每筆日誌透過 decorateLogEntry() 套用裝飾器鏈，
//   依事件類型自動附加圖標、顏色、粗體。
//
// 與 Subject 完全解耦：
//   - 不知道誰在發事件（不依賴 SearchSubjectService）
//   - 只關心 SearchEvent 資料結構
//   - 可獨立開發、獨立測試
// ==========================================

/** Console 觀察者 — 累積事件訊息為 HTML 日誌（Decorator Pattern 裝飾） */
export class ConsoleObserver implements IObserver<SearchEvent> {
  /** HTML 格式的日誌紀錄 */
  private logs: string[] = [];

  /**
   * 接收事件通知，透過 Decorator Pattern 裝飾後追加至日誌
   * Subject 每次 notify() 都會呼叫此方法
   */
  update(event: SearchEvent): void {
    const category: LogCategory = event.type;
    const decorated = decorateLogEntry(event.message, category);
    this.logs.push(decorated.render());
  }

  /** 取得所有日誌 HTML（複本） */
  getLogs(): string[] {
    return [...this.logs];
  }

  /** 取得合併後的 HTML 日誌輸出（以 <br> 換行） */
  getOutput(): string {
    return this.logs.join('<br>');
  }

  /** 清空日誌 */
  clear(): void {
    this.logs = [];
  }
}
