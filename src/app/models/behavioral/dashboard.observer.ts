import type { IObserver } from './observer.interface';
import type { SearchEvent } from './search-event.model';

// ==========================================
// Observer Pattern — Dashboard Observer（接收端）
//
// 職責：即時追蹤搜尋進度與統計數據
//       對應 GoF 的 Concrete Observer
//
// 與 Console Observer 互不影響：
//   - Console 關注「文字日誌」
//   - Dashboard 關注「統計儀表板」
//   - 兩者各自獨立訂閱 Subject，可分開開發
// ==========================================

/** 儀表板統計資料 */
export interface DashboardStats {
  /** 已訪問的節點數 */
  totalVisited: number;
  /** 已匹配的檔案數 */
  totalMatched: number;
  /** 搜尋是否已完成 */
  isComplete: boolean;
  /** 目前正在訪問的節點名稱 */
  currentNode: string | null;
  /** 進度摘要文字 */
  progressText: string;
}

/** 建立初始儀表板狀態 */
function createInitialStats(): DashboardStats {
  return {
    totalVisited: 0,
    totalMatched: 0,
    isComplete: false,
    currentNode: null,
    progressText: '等待搜尋...',
  };
}

/** Dashboard 觀察者 — 即時追蹤搜尋進度與統計 */
export class DashboardObserver implements IObserver<SearchEvent> {
  private stats: DashboardStats = createInitialStats();

  /**
   * 接收事件通知，依事件類型更新統計
   * - visiting：遞增訪問數、更新目前節點
   * - matched：遞增匹配數
   * - complete：標記完成
   */
  update(event: SearchEvent): void {
    switch (event.type) {
      case 'visiting':
        this.stats.totalVisited++;
        this.stats.currentNode = event.node?.name ?? null;
        break;
      case 'matched':
        this.stats.totalVisited++;
        this.stats.totalMatched++;
        this.stats.currentNode = event.node?.name ?? null;
        break;
      case 'complete':
        this.stats.isComplete = true;
        this.stats.currentNode = null;
        break;
    }
    this.updateProgressText();
  }

  /** 取得目前統計（複本） */
  getStats(): DashboardStats {
    return { ...this.stats };
  }

  /** 重置統計 */
  reset(): void {
    this.stats = createInitialStats();
  }

  /** 更新進度摘要文字 */
  private updateProgressText(): void {
    if (this.stats.isComplete) {
      this.stats.progressText = `搜尋完成！已訪問 ${this.stats.totalVisited} 個節點，匹配 ${this.stats.totalMatched} 個檔案`;
    } else {
      this.stats.progressText = `搜尋中... 已訪問 ${this.stats.totalVisited} 個節點，匹配 ${this.stats.totalMatched} 個`;
    }
  }
}
