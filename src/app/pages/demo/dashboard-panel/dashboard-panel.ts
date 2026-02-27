import { Component, ChangeDetectionStrategy, input } from '@angular/core';

import type { IDashboardDisplay } from '../../../models/structural/search-event.adapter';

// ==========================================
// DashboardPanelComponent — 搜尋進度儀表板（Dumb Component）
//
// 🔌 Day 5 — Adapter Pattern 整合：
//   接收 IDashboardDisplay（目標介面），
//   由 SearchEventAdapter 負責將 SearchEvent 轉換為此介面。
//   元件不知道資料來源是 SearchEvent，只依賴目標介面。
// ==========================================

@Component({
  selector: 'app-dashboard-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <div class="dashboard-header">📊 Dashboard — Adapter Pattern 介面轉換</div>
      @if (adapter(); as a) {
        <div class="dashboard-body">
          <div class="stat-row">
            <span class="stat-label">狀態</span>
            <span class="stat-value" [class.complete]="a.isSearchComplete()">
              {{ a.isSearchComplete() ? '✅ 完成' : '🔄 搜尋中...' }}
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">進度</span>
            <span class="stat-value progress-pct">{{ a.getProgress() }}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">已訪問節點</span>
            <span class="stat-value">{{ a.getVisitedCount() }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">匹配檔案</span>
            <span class="stat-value matched">{{ a.getMatchedCount() }}</span>
          </div>
          @if (a.getVisitedCount() > 0) {
            <div class="progress-bar">
              <div
                class="progress-fill"
                [class.complete]="a.isSearchComplete()"
                [style.width.%]="a.getProgress()"
              ></div>
            </div>
          }
          @if (a.getCurrentNodeName(); as nodeName) {
            <div class="stat-row current-node">
              <span class="stat-label">目前節點</span>
              <span class="stat-value node-name">{{ nodeName }}</span>
            </div>
          }
          <div class="stat-row summary">
            <span>{{ a.getSummary() }}</span>
          </div>
        </div>
      } @else {
        <div class="empty-state">點擊「搜尋」觸發 Observer + Adapter</div>
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
    .current-node .node-name {
      font-size: 0.85rem;
      color: #82b1ff;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .progress-pct {
      color: #e94560;
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
  /** 輸入：IDashboardDisplay（Adapter Pattern 目標介面），null 表示尚未搜尋 */
  adapter = input<IDashboardDisplay | null>(null);
}
