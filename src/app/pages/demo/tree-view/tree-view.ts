import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileSystemNode } from '../../../models/structural/file-system-node.model';
import { Directory } from '../../../models/structural/directory.model';
import { TagType, TAG_COLORS } from '../../../models/structural/tag.model';
import { ViewStateService } from '../../../services/behavioral/view-state.service';

// ==========================================
// TreeViewComponent — 遞迴樹狀結構子元件
// 負責檔案階層的 UI 呈現
// ==========================================

@Component({
  selector: 'app-tree-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="panel tree-panel">
      <h3 class="panel-title">📂 檔案階層 (Composite)</h3>
      <ul class="tree-root">
        <ng-container
          *ngTemplateOutlet="nodeTemplate; context: { $implicit: root() }"
        ></ng-container>
      </ul>
    </div>

    <!-- 節點遞迴 Template -->
    <ng-template #nodeTemplate let-node>
      <li>
        <div
          class="node-row"
          [class.highlight-visiting]="viewState.getHighlightState(node) === 'visiting'"
          [class.highlight-matched]="viewState.getHighlightState(node) === 'matched'"
          [class.node-selected]="selectedNode() === node"
          (click)="nodeClicked.emit(node); $event.stopPropagation()"
        >
          <span class="icon">{{ node.getIcon() }}</span>
          <span class="name">{{ node.name }}</span>

          @if (!isDirectory(node)) {
            <span class="separator">—</span>
            <span class="type-label">{{ node.getTypeLabel() }}</span>
            <span class="details">{{ node.getDetails() }}</span>
            @if (viewState.getHighlightState(node) === 'matched') {
              <span class="match-badge">✅ MATCH</span>
            }
          } @else {
            <span class="separator">—</span>
            <span class="type-label-dir">[目錄]</span>
            <span class="details">({{ node.getFormattedSize() }})</span>
          }

          @for (tag of node.getTagsArray(); track tag) {
            <span class="tag-badge" [style.background-color]="getTagColor(tag)">{{ tag }}</span>
          }
        </div>

        @if (isDirectory(node)) {
          <ul class="tree-children">
            @for (child of node.children; track child.id) {
              <ng-container
                *ngTemplateOutlet="nodeTemplate; context: { $implicit: child }"
              ></ng-container>
            }
          </ul>
        }
      </li>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
    .panel {
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }
    .tree-panel {
      min-height: 500px;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .panel-title {
      margin-top: 0;
      border-bottom: 1px solid #333;
      padding-bottom: 10px;
      margin-bottom: 15px;
      color: #bbb;
      font-size: 1.1rem;
    }
    ul {
      list-style: none;
      padding-left: 0;
      margin: 0;
    }
    .tree-children {
      padding-left: 28px;
      border-left: 1px solid #333;
      margin-left: 9px;
    }
    li {
      margin-top: 8px;
    }
    .node-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      line-height: 1.5;
      cursor: pointer;
      user-select: none;
      transition:
        background-color 0.3s,
        border-color 0.3s;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid transparent;
      overflow-wrap: anywhere;
      word-break: break-word;
      min-width: 0;
    }
    .icon {
      width: 20px;
      text-align: center;
    }
    .name {
      font-weight: bold;
      color: #fff;
    }
    .separator {
      color: #666;
    }
    .type-label {
      color: #4ec9b0;
    }
    .type-label-dir {
      color: #dcdcaa;
    }
    .details {
      color: #ce9178;
      font-size: 0.95em;
    }
    .highlight-visiting {
      background-color: rgba(78, 201, 176, 0.08);
      border-color: rgba(78, 201, 176, 0.25);
    }
    .highlight-matched {
      background-color: rgba(78, 201, 176, 0.18);
      border-color: #4ec9b0;
      animation: pulse-match 0.6s ease-in-out;
    }
    @keyframes pulse-match {
      0% {
        background-color: rgba(78, 201, 176, 0.5);
        transform: scale(1.01);
      }
      100% {
        background-color: rgba(78, 201, 176, 0.18);
        transform: scale(1);
      }
    }
    .match-badge {
      background-color: #4ec9b0;
      color: #000;
      font-size: 0.7rem;
      font-weight: bold;
      padding: 1px 6px;
      border-radius: 3px;
      margin-left: 4px;
    }
    .node-selected {
      background-color: rgba(14, 99, 156, 0.25) !important;
      border-color: #0e639c !important;
      outline: 1px solid #0e639c;
    }
    .tag-badge {
      color: #fff;
      font-size: 0.65rem;
      font-weight: bold;
      padding: 1px 6px;
      border-radius: 3px;
      margin-left: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `,
})
export class TreeViewComponent {
  readonly viewState = inject(ViewStateService);

  /** 輸入：樹的根節點 */
  root = input.required<Directory>();

  /** 輸入：當前選中的節點 */
  selectedNode = input<FileSystemNode | null>(null);

  /** 輸入：版本號，變更時強制 OnPush 重新渲染 */
  treeVersion = input(0);

  /** 輸出：節點被點擊事件 */
  nodeClicked = output<FileSystemNode>();

  isDirectory(node: FileSystemNode): node is Directory {
    return node instanceof Directory;
  }

  getTagColor(tag: TagType): string {
    return TAG_COLORS[tag];
  }
}
