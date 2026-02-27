import { Component, ChangeDetectionStrategy, input } from '@angular/core';

import type { DashboardStats } from '../../../models/behavioral/dashboard.observer';

// ==========================================
// DashboardPanelComponent — 搜尋進度儀表板（Dumb Component）
//
// Observer Pattern 的 UI 呈現層：
//   DashboardObserver 負責收集統計 → 此元件負責顯示
//   與 Subject 完全解耦，只接收純資料
// ==========================================

@Component({
  selector: 'app-dashboard-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <div class="dashboard-header">📊 Observer Dashboard — 即時搜尋狀態</div>
      @if (stats(); as s) {
        <div class="dashboard-body">
          <div class="stat-row">
            <span class="stat-label">狀態</span>
            <span class="stat-value" [class.complete]="s.isComplete">
              {{ s.isComplete ? '✅ 完成' : '🔄 搜尋中...' }}
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">已訪問節點</span>
            <span class="stat-value">{{ s.totalVisited }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">匹配檔案</span>
            <span class="stat-value matched">{{ s.totalMatched }}</span>
          </div>
          @if (s.totalVisited > 0) {
            <div class="progress-bar">
              <div
                class="progress-fill"
                [class.complete]="s.isComplete"
                [style.width.%]="s.isComplete ? 100 : 85"
              ></div>
            </div>
          }
          <div class="stat-row summary">
            <span>{{ s.progressText }}</span>
          </div>
        </div>
      } @else {
        <div class="empty-state">點擊「搜尋」觸發 Observer</div>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .dashboard {
      background: #1a1a2e;
      border: 1px solid #16213e;
      border-radius: 4px;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .dashboard-header {
      background: #16213e;
      padding: 5px 10px;
      font-size: 0.8rem;
      color: #e94560;
      font-weight: bold;
    }
    .dashboard-body {
      padding: 12px 15px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 0.85rem;
      color: #ccc;
    }
    .stat-row.summary {
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid #333;
      font-size: 0.8rem;
      color: #999;
      justify-content: center;
    }
    .stat-label {
      color: #8892b0;
    }
    .stat-value {
      color: #ccd6f6;
      font-weight: bold;
      font-family: 'Courier New', monospace;
      font-size: 1.1rem;
    }
    .stat-value.matched {
      color: #64ffda;
    }
    .stat-value.complete {
      color: #64ffda;
    }
    .progress-bar {
      height: 6px;
      background: #333;
      border-radius: 3px;
      margin: 10px 0 6px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #e94560;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    .progress-fill.complete {
      background: #64ffda;
    }
    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #555;
      font-size: 0.85rem;
    }
  `,
})
export class DashboardPanelComponent {
  /** 輸入：DashboardObserver 的統計資料，null 表示尚未搜尋 */
  stats = input<DashboardStats | null>(null);
}
