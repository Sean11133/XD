import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

import { TagType } from '../../../models/structural/tag.model';
import { LabelFactory } from '../../../models/creational/label.flyweight';
import type { Label } from '../../../models/creational/label.flyweight';
import type { SortType } from '../../../services/behavioral/file-manager-facade.service';
import type { CommandHistory } from '../../../services/behavioral/command-history.service';

// ==========================================
// ToolbarComponent — 工具列子元件
// 負責排序、標籤、刪除、Undo/Redo 的 UI 互動
// ==========================================

@Component({
  selector: 'app-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toolbar">
      <div class="toolbar-group">
        <button
          class="toolbar-btn"
          (click)="undoClicked.emit()"
          [disabled]="!commandHistory().canUndo()"
          title="Undo"
        >
          ↩️
        </button>
        <button
          class="toolbar-btn"
          (click)="redoClicked.emit()"
          [disabled]="!commandHistory().canRedo()"
          title="Redo"
        >
          ↪️
        </button>
      </div>

      <span class="toolbar-divider">|</span>

      <div class="toolbar-group">
        @for (sort of sortTypes; track sort.type) {
          <button
            class="toolbar-btn sort-btn"
            [class.active-sort]="activeSortType() === sort.type"
            (click)="sortClicked.emit(sort.type)"
          >
            {{ getSortIcon(sort.type) }}{{ sort.label }}
          </button>
        }
      </div>

      <span class="toolbar-divider">|</span>

      <div class="toolbar-group">
        <span class="toolbar-icon">🏷️</span>
        @for (label of allLabels; track label.type) {
          <button
            class="tag-btn"
            [style.border-color]="label.color"
            [style.color]="label.color"
            [disabled]="!hasSelectedNode()"
            (click)="tagClicked.emit(label.type)"
          >
            {{ label.icon }} {{ label.displayName }}
            @if (tagCounts()[label.type] > 0) {
              <span class="tag-count-badge">{{ tagCounts()[label.type] }}</span>
            }
          </button>
        }
      </div>

      <span class="toolbar-divider">|</span>

      <div class="toolbar-group">
        <button
          class="toolbar-btn copy-btn"
          [disabled]="!hasSelectedNode()"
          (click)="copyClicked.emit()"
          title="複製選取項目"
        >
          📋 複製
        </button>
        <button
          class="toolbar-btn paste-btn"
          [disabled]="!canPaste()"
          (click)="pasteClicked.emit()"
          title="貼上至選取的目錄"
        >
          📌 貼上
        </button>
      </div>

      <span class="toolbar-divider">|</span>

      <button
        class="toolbar-btn delete-btn"
        [disabled]="!hasSelectedNode()"
        (click)="deleteClicked.emit()"
      >
        🗑️ 刪除
      </button>
    </div>
  `,
  styles: `
    .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      overflow: visible;
    }
    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: visible;
    }
    .toolbar-btn {
      background: #2d2d2d;
      border: 1px solid #444;
      color: #e0e0e0;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.85rem;
      transition: 0.2s;
      &:hover:not(:disabled) {
        background: #3a3a3a;
        border-color: #666;
      }
      &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }
    .sort-btn {
      background: #1a3a5c;
      border-color: #2a5a8c;
      min-width: 56px;
      text-align: center;
      transition:
        background 0.2s,
        border-color 0.2s,
        box-shadow 0.2s;
      &:hover:not(:disabled) {
        background: #2a5a8c;
      }
      &.active-sort {
        background: #0e639c;
        border-color: #3794d4;
        box-shadow: 0 0 6px rgba(55, 148, 212, 0.4);
        color: #fff;
        font-weight: bold;
      }
    }
    .toolbar-divider {
      color: #444;
      margin: 0 4px;
      user-select: none;
    }
    .toolbar-icon {
      font-size: 1rem;
      margin-right: 2px;
    }
    .tag-btn {
      border: 2px solid currentColor;
      background: transparent;
      color: #fff;
      padding: 4px 12px;
      border-radius: 20px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.8rem;
      font-weight: bold;
      transition: 0.2s;
      position: relative;
      overflow: visible;
      z-index: 0;
      &:hover:not(:disabled) {
        filter: brightness(1.2);
      }
      &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }
    .tag-count-badge {
      position: absolute;
      top: -10px;
      right: -10px;
      background: #e74c3c;
      color: #fff;
      font-size: 0.65rem;
      font-weight: bold;
      min-width: 18px;
      height: 18px;
      line-height: 18px;
      text-align: center;
      border-radius: 50%;
      padding: 0 3px;
      z-index: 1;
      pointer-events: none;
    }
    .delete-btn {
      background: #5c1a1a;
      border-color: #8c2a2a;
      color: #ff8a8a;
      &:hover:not(:disabled) {
        background: #8c2a2a;
        color: #fff;
      }
    }
    .copy-btn {
      background: #1a4a3a;
      border-color: #2a7a5a;
      color: #7adfb0;
      &:hover:not(:disabled) {
        background: #2a7a5a;
        color: #fff;
      }
    }
    .paste-btn {
      background: #3a1a5c;
      border-color: #5a2a8c;
      color: #c8a0ff;
      &:hover:not(:disabled) {
        background: #5a2a8c;
        color: #fff;
      }
    }
  `,
})
export class ToolbarComponent {
  /** 輸入：CommandHistory（用於 canUndo/canRedo） */
  commandHistory = input.required<CommandHistory>();

  /** 輸入：當前排序類型 */
  activeSortType = input<SortType | null>(null);

  /** 輸入：當前排序方向 */
  activeSortDirection = input<'asc' | 'desc' | null>(null);

  /** 輸入：是否有選中的節點 */
  hasSelectedNode = input<boolean>(false);

  /** 輸入：是否可以貼上（剪貼簿有內容 + 選中目錄） */
  canPaste = input<boolean>(false);

  /** 輸入：各標籤的即時數量 */
  tagCounts = input<Record<TagType, number>>({} as Record<TagType, number>);

  /** 輸出事件 */
  sortClicked = output<SortType>();
  deleteClicked = output<void>();
  tagClicked = output<TagType>();
  copyClicked = output<void>();
  pasteClicked = output<void>();
  undoClicked = output<void>();
  redoClicked = output<void>();

  readonly allLabels: Label[] = LabelFactory.getAllLabels();

  readonly sortTypes: { type: SortType; label: string }[] = [
    { type: 'name', label: '名稱' },
    { type: 'size', label: '大小' },
    { type: 'extension', label: '類型' },
    { type: 'tag', label: '標籤' },
  ];

  getSortIcon(type: SortType): string {
    if (this.activeSortType() !== type) return '';
    return this.activeSortDirection() === 'asc' ? '↑ ' : '↓ ';
  }
}
