import {
  Component,
  ChangeDetectionStrategy,
  input,
  ElementRef,
  viewChild,
  afterNextRender,
  signal,
} from '@angular/core';

let idCounter = 0;

type MermaidApi = (typeof import('mermaid'))['default'];

let mermaidPromise: Promise<MermaidApi> | null = null;
let mermaidInitialized = false;

const svgCache = new Map<string, string>();
const MAX_CACHE_SIZE = 100;

function getMermaid(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((module) => module.default);
  }
  return mermaidPromise;
}

function initializeMermaid(mermaid: MermaidApi): void {
  if (mermaidInitialized) return;

  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
      darkMode: true,
      background: '#161b22',
      primaryColor: '#1a2a3e',
      primaryTextColor: '#e0e0e0',
      primaryBorderColor: '#0e639c',
      lineColor: '#8b949e',
      secondaryColor: '#0d2a1a',
      tertiaryColor: '#2a1a0d',
      noteBkgColor: '#1a2a3e',
      noteTextColor: '#c9d1d9',
      noteBorderColor: '#30363d',
      actorBkg: '#1a2a3e',
      actorBorder: '#0e639c',
      actorTextColor: '#e0e0e0',
      actorLineColor: '#555',
      signalColor: '#c9d1d9',
      signalTextColor: '#c9d1d9',
      labelBoxBkgColor: '#1a2a3e',
      labelBoxBorderColor: '#30363d',
      labelTextColor: '#e0e0e0',
      loopTextColor: '#8b949e',
      activationBorderColor: '#4ec9b0',
      activationBkgColor: 'rgba(78, 201, 176, 0.15)',
      sequenceNumberColor: '#fff',
      classText: '#e0e0e0',
    },
    sequence: {
      actorMargin: 50,
      mirrorActors: false,
      messageMargin: 40,
      boxMargin: 10,
      useMaxWidth: true,
    },
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
    },
  });

  mermaidInitialized = true;
}

function readCache(definition: string): string | undefined {
  const cachedSvg = svgCache.get(definition);
  if (!cachedSvg) return undefined;

  svgCache.delete(definition);
  svgCache.set(definition, cachedSvg);
  return cachedSvg;
}

function writeCache(definition: string, svg: string): void {
  if (svgCache.has(definition)) {
    svgCache.delete(definition);
  }
  svgCache.set(definition, svg);

  if (svgCache.size > MAX_CACHE_SIZE) {
    const oldestKey = svgCache.keys().next().value;
    if (oldestKey) {
      svgCache.delete(oldestKey);
    }
  }
}

@Component({
  selector: 'app-mermaid-diagram',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mermaid-wrapper" (click)="openModal()">
      @if (loading()) {
        <div class="mermaid-loading">載入圖表中...</div>
      }
      <div #container class="mermaid-container"></div>
      <div class="zoom-hint">🔍 點擊放大查看</div>
    </div>

    @if (expanded()) {
      <div class="modal-overlay" (click)="closeModal($event)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-toolbar">
            <button class="zoom-btn" (click)="zoomOut()">➖</button>
            <span class="zoom-level">{{ Math.round(scale() * 100) }}%</span>
            <button class="zoom-btn" (click)="zoomIn()">➕</button>
            <button class="zoom-btn" (click)="resetZoom()">↺</button>
            <button class="close-btn" (click)="expanded.set(false)">✕</button>
          </div>
          <div
            class="modal-diagram"
            (wheel)="onWheel($event)"
            (mousedown)="onPanStart($event)"
            (mousemove)="onPanMove($event)"
            (mouseup)="onPanEnd()"
            (mouseleave)="onPanEnd()"
          >
            <div
              class="modal-diagram-inner"
              [style.transform]="
                'translate(' + panX() + 'px, ' + panY() + 'px) scale(' + scale() + ')'
              "
            >
              <div #modalContainer class="modal-mermaid"></div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './mermaid-diagram.scss',
})
export class MermaidDiagramComponent {
  protected readonly Math = Math;

  /** Mermaid definition string */
  definition = input.required<string>();

  container = viewChild.required<ElementRef<HTMLDivElement>>('container');
  modalContainer = viewChild<ElementRef<HTMLDivElement>>('modalContainer');
  loading = signal(true);

  /** Modal state */
  expanded = signal(false);
  scale = signal(1);
  panX = signal(0);
  panY = signal(0);

  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private lastPanX = 0;
  private lastPanY = 0;
  private renderedSvg = '';

  openModal(): void {
    this.scale.set(2);
    this.panX.set(0);
    this.panY.set(0);
    this.expanded.set(true);
    // Copy SVG into modal after next tick
    setTimeout(() => {
      const el = this.modalContainer();
      if (el) {
        el.nativeElement.innerHTML = this.renderedSvg;
      }
    });
  }

  closeModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.expanded.set(false);
    }
  }

  zoomIn(): void {
    this.scale.update((s) => Math.min(s + 0.25, 5));
  }

  zoomOut(): void {
    this.scale.update((s) => Math.max(s - 0.25, 0.25));
  }

  resetZoom(): void {
    this.scale.set(1);
    this.panX.set(0);
    this.panY.set(0);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.scale.update((s) => Math.max(0.25, Math.min(5, s + delta)));
  }

  onPanStart(event: MouseEvent): void {
    this.isPanning = true;
    this.panStartX = event.clientX;
    this.panStartY = event.clientY;
    this.lastPanX = this.panX();
    this.lastPanY = this.panY();
  }

  onPanMove(event: MouseEvent): void {
    if (!this.isPanning) return;
    this.panX.set(this.lastPanX + (event.clientX - this.panStartX));
    this.panY.set(this.lastPanY + (event.clientY - this.panStartY));
  }

  onPanEnd(): void {
    this.isPanning = false;
  }

  constructor() {
    afterNextRender(async () => {
      const definition = this.definition();

      const cachedSvg = readCache(definition);
      if (cachedSvg) {
        this.renderedSvg = cachedSvg;
        this.container().nativeElement.innerHTML = cachedSvg;
        this.loading.set(false);
        return;
      }

      try {
        const mermaid = await getMermaid();
        initializeMermaid(mermaid);

        const uniqueId = `mermaid-graph-${++idCounter}`;
        const { svg } = await mermaid.render(uniqueId, definition);
        this.renderedSvg = svg;
        writeCache(definition, svg);
        this.container().nativeElement.innerHTML = svg;
      } catch (err) {
        console.error('Mermaid render error:', err);
        this.container().nativeElement.innerHTML = '<p style="color:#e57373">⚠️ 圖表渲染失敗</p>';
      } finally {
        this.loading.set(false);
      }
    });
  }
}
