import { describe, it, expect, beforeEach } from 'vitest';

import { Directory } from './models/structural/directory.model';
import { WordFile } from './models/structural/word-file.model';
import { ImageFile } from './models/structural/image-file.model';
import { TextFile } from './models/structural/text-file.model';
import { formatSize } from './models/structural/format-size.util';
import { TagType } from './models/structural/tag.model';
import { FileFactory } from './models/creational/file.factory';
import { XmlExportVisitor } from './models/behavioral/xml-export.visitor';
import { JsonExportVisitor } from './models/behavioral/json-export.visitor';
import { MarkdownExportVisitor } from './models/behavioral/markdown-export.visitor';
import { ExtensionSearchVisitor } from './models/behavioral/extension-search.visitor';
import { SortCommand } from './models/behavioral/sort.command';
import { DeleteCommand } from './models/behavioral/delete.command';
import { TagCommand } from './models/behavioral/tag.command';
import { CopyCommand } from './models/behavioral/copy.command';
import { PasteCommand } from './models/behavioral/paste.command';
import { Clipboard } from './models/creational/clipboard.singleton';
import { Label, LabelFactory } from './models/creational/label.flyweight';
import { TagMediator } from './models/behavioral/tag.mediator';
import { SortByNameStrategy } from './models/behavioral/sort-by-name.strategy';
import { SortBySizeStrategy } from './models/behavioral/sort-by-size.strategy';
import { SortByExtensionStrategy } from './models/behavioral/sort-by-extension.strategy';
import { SortByTagStrategy } from './models/behavioral/sort-by-tag.strategy';
import { CommandHistory } from './services/behavioral/command-history.service';
import { ConsoleObserver } from './models/behavioral/console.observer';
import { DashboardObserver } from './models/behavioral/dashboard.observer';
import type { IObserver, ISubject } from './models/behavioral/observer.interface';
import type { SearchEvent } from './models/behavioral/search-event.model';
import type { ILogEntry } from './models/structural/log-entry.decorator';
import {
  PlainLogEntry,
  IconDecorator,
  ColorDecorator,
  BoldDecorator,
} from './models/structural/log-entry.decorator';
import { decorateLogEntry, detectLogCategory } from './models/structural/log-decorator.factory';
import { SearchEventAdapter } from './models/structural/search-event.adapter';

// ==========================================
// 單元測試 — 核心邏輯（不依賴 DOM / Angular）
// ==========================================

// ─── formatSize 工具函式 ───

describe('formatSize', () => {
  it('should display KB for small files', () => {
    expect(formatSize(500)).toBe('500KB');
    expect(formatSize(0.5)).toBe('0.5KB');
  });

  it('should convert to MB for files >= 1024 KB', () => {
    expect(formatSize(1024)).toBe('1MB');
    expect(formatSize(2048)).toBe('2MB');
    expect(formatSize(1536)).toBe('1.5MB');
  });

  it('should convert to GB for files >= 1024 MB', () => {
    expect(formatSize(1024 * 1024)).toBe('1GB');
  });
});

// ─── Composite Pattern：Directory.getSizeKB() ───

describe('Directory.getSizeKB() — Composite 遞迴加總', () => {
  let root: Directory;

  beforeEach(() => {
    root = new Directory('root');
    const sub = new Directory('sub');
    sub.add(new WordFile('a.docx', 100, 5));
    sub.add(new TextFile('b.txt', 50, 'UTF-8'));
    root.add(sub);
    root.add(new ImageFile('c.png', 200, 800, 600));
  });

  it('should recursively sum all file sizes', () => {
    expect(root.getSizeKB()).toBe(350); // 100 + 50 + 200
  });

  it('should return 0 for empty directory', () => {
    const empty = new Directory('empty');
    expect(empty.getSizeKB()).toBe(0);
  });
});

// ─── FileNode.createdAt ───

describe('FileNode.createdAt', () => {
  it('should default to current date if not provided', () => {
    const file = new WordFile('test.docx', 100, 5);
    expect(file.createdAt).toBeInstanceOf(Date);
  });

  it('should accept a custom date', () => {
    const date = new Date('2025-01-01');
    const file = new WordFile('test.docx', 100, 5, date);
    expect(file.createdAt).toBe(date);
  });
});

// ─── FileSystemNode.id 唯一性 ───

describe('FileSystemNode.id — 唯一識別碼', () => {
  it('should assign unique IDs to each node', () => {
    const a = new WordFile('a.docx', 100, 5);
    const b = new TextFile('b.txt', 50, 'UTF-8');
    const c = new Directory('dir');
    expect(a.id).not.toBe(b.id);
    expect(b.id).not.toBe(c.id);
  });
});

// ─── FileFactory ───

describe('FileFactory — Creational Pattern', () => {
  it('should create WordFile via factory', () => {
    const file = FileFactory.createWord({ name: 'test.docx', sizeKB: 100, pages: 5 });
    expect(file).toBeInstanceOf(WordFile);
    expect(file.name).toBe('test.docx');
  });

  it('should create ImageFile via factory', () => {
    const file = FileFactory.createImage({
      name: 'img.png',
      sizeKB: 2048,
      width: 1920,
      height: 1080,
    });
    expect(file).toBeInstanceOf(ImageFile);
    expect(file.getDetails()).toContain('2MB');
  });

  it('should create TextFile via factory', () => {
    const file = FileFactory.createText({ name: 'readme.txt', sizeKB: 1, encoding: 'UTF-8' });
    expect(file).toBeInstanceOf(TextFile);
  });

  it('should create files via generic factory method', () => {
    const word = FileFactory.create('word', { name: 'a.docx', sizeKB: 100, pages: 5 });
    expect(word).toBeInstanceOf(WordFile);
  });
});

// ─── Visitor Pattern：XmlExportVisitor ───

describe('XmlExportVisitor — XML 輸出', () => {
  it('should produce valid XML for a simple tree', () => {
    const root = new Directory('Root');
    root.add(new WordFile('doc.docx', 500, 15));
    root.add(new TextFile('note.txt', 1, 'UTF-8'));

    const visitor = new XmlExportVisitor();
    root.accept(visitor);
    const xml = visitor.getResult();

    expect(xml).toContain('<Root>');
    expect(xml).toContain('</Root>');
    expect(xml).toContain('<doc_docx>');
    expect(xml).toContain('<note_txt>');
  });

  it('should sanitize numeric-prefixed tag names', () => {
    const dir = new Directory('2025備份');
    dir.add(new TextFile('log.txt', 1, 'UTF-8'));

    const visitor = new XmlExportVisitor();
    dir.accept(visitor);
    const xml = visitor.getResult();

    // 數字開頭應有底線前綴
    expect(xml).toMatch(/<_2025/);
  });
});

// ─── Visitor Pattern：ExtensionSearchVisitor ───

// ─── Template Method Pattern：JsonExportVisitor ───

describe('JsonExportVisitor — JSON 輸出', () => {
  it('should produce valid JSON structure', () => {
    const root = new Directory('Root');
    root.add(new WordFile('doc.docx', 500, 15));
    root.add(new TextFile('note.txt', 1, 'UTF-8'));

    const visitor = new JsonExportVisitor();
    root.accept(visitor);
    const json = visitor.getResult();

    // 應可解析為合法 JSON
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('should contain file entries as key-value pairs', () => {
    const root = new Directory('Root');
    root.add(new TextFile('readme.txt', 1, 'UTF-8'));

    const visitor = new JsonExportVisitor();
    root.accept(visitor);
    const parsed = JSON.parse(visitor.getResult());

    expect(parsed['Root']).toBeDefined();
    expect(parsed['Root']['readme.txt']).toBeDefined();
  });

  it('should escape double quotes in content', () => {
    const root = new Directory('Root');
    root.add(new TextFile('test"file.txt', 1, 'UTF-8'));

    const visitor = new JsonExportVisitor();
    root.accept(visitor);
    const json = visitor.getResult();

    // 雙引號應被脫逸，不會破壞 JSON 結構
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('should handle nested directories', () => {
    const root = new Directory('Root');
    const sub = new Directory('Sub');
    sub.add(new WordFile('a.docx', 100, 5));
    root.add(sub);

    const visitor = new JsonExportVisitor();
    root.accept(visitor);
    const parsed = JSON.parse(visitor.getResult());

    expect(parsed['Root']['Sub']['a.docx']).toBeDefined();
  });
});

// ─── Template Method Pattern：MarkdownExportVisitor ───

describe('MarkdownExportVisitor — Markdown 輸出', () => {
  it('should produce markdown with headers for directories', () => {
    const root = new Directory('Root');
    root.add(new WordFile('doc.docx', 500, 15));

    const visitor = new MarkdownExportVisitor();
    root.accept(visitor);
    const md = visitor.getResult();

    expect(md).toContain('# 📂 Root');
    expect(md).toContain('**doc.docx**');
  });

  it('should use deeper heading levels for nested directories', () => {
    const root = new Directory('Root');
    const sub = new Directory('Sub');
    sub.add(new TextFile('a.txt', 10, 'UTF-8'));
    root.add(sub);

    const visitor = new MarkdownExportVisitor();
    root.accept(visitor);
    const md = visitor.getResult();

    expect(md).toContain('# 📂 Root');
    expect(md).toContain('## 📂 Sub');
  });

  it('should format files as list items with bold names', () => {
    const root = new Directory('Root');
    root.add(new ImageFile('pic.png', 2048, 1920, 1080));

    const visitor = new MarkdownExportVisitor();
    root.accept(visitor);
    const md = visitor.getResult();

    expect(md).toContain('- **pic.png**');
    expect(md).toContain('—');
  });
});

describe('ExtensionSearchVisitor — 副檔名搜尋', () => {
  let root: Directory;

  beforeEach(() => {
    root = new Directory('root');
    root.add(new WordFile('a.docx', 100, 5));
    root.add(new WordFile('b.docx', 200, 10));
    root.add(new TextFile('c.txt', 50, 'UTF-8'));

    const sub = new Directory('sub');
    sub.add(new ImageFile('d.png', 300, 800, 600));
    sub.add(new WordFile('e.docx', 150, 3));
    root.add(sub);
  });

  it('should find all .docx files', () => {
    const visitor = new ExtensionSearchVisitor('.docx');
    root.accept(visitor);
    expect(visitor.getResults()).toHaveLength(3);
  });

  it('should find all .txt files', () => {
    const visitor = new ExtensionSearchVisitor('.txt');
    root.accept(visitor);
    expect(visitor.getResults()).toHaveLength(1);
  });

  it('should return empty for non-existent extension', () => {
    const visitor = new ExtensionSearchVisitor('.pdf');
    root.accept(visitor);
    expect(visitor.getResults()).toHaveLength(0);
  });
});

// ─── Command Pattern：CommandHistory Undo/Redo ───

describe('CommandHistory — Undo/Redo 堆疊', () => {
  let history: CommandHistory;

  beforeEach(() => {
    history = new CommandHistory();
  });

  it('should execute command and allow undo', () => {
    const root = new Directory('root');
    const child = new TextFile('a.txt', 10, 'UTF-8');
    root.add(child);

    const cmd = new DeleteCommand(child, root);
    history.executeCommand(cmd);

    expect(root.children).toHaveLength(0);
    expect(history.canUndo()).toBe(true);

    history.undo();
    expect(root.children).toHaveLength(1);
    expect(root.children[0]).toBe(child);
  });

  it('should redo after undo', () => {
    const root = new Directory('root');
    const child = new TextFile('a.txt', 10, 'UTF-8');
    root.add(child);

    const cmd = new DeleteCommand(child, root);
    history.executeCommand(cmd);
    history.undo();
    expect(root.children).toHaveLength(1);

    history.redo();
    expect(root.children).toHaveLength(0);
  });

  it('should clear redo stack when executing new command', () => {
    const root = new Directory('root');
    const a = new TextFile('a.txt', 10, 'UTF-8');
    const b = new TextFile('b.txt', 20, 'UTF-8');
    root.add(a);
    root.add(b);

    history.executeCommand(new DeleteCommand(a, root));
    history.undo();
    expect(history.canRedo()).toBe(true);

    // 執行新命令後，redo 應被清空
    history.executeCommand(new DeleteCommand(b, root));
    expect(history.canRedo()).toBe(false);
  });
});

// ─── Command Pattern：SortCommand + Strategy ───

describe('SortCommand + Strategy — 排序命令', () => {
  let root: Directory;

  beforeEach(() => {
    root = new Directory('root');
    root.add(new TextFile('charlie.txt', 300, 'UTF-8'));
    root.add(new WordFile('alpha.docx', 100, 5));
    root.add(new ImageFile('bravo.png', 200, 800, 600));
  });

  it('should sort by name ascending', () => {
    const cmd = new SortCommand(root, new SortByNameStrategy(true), 'name', true);
    cmd.execute();
    expect(root.children.map((c) => c.name)).toEqual(['alpha.docx', 'bravo.png', 'charlie.txt']);
  });

  it('should sort by name descending', () => {
    const cmd = new SortCommand(root, new SortByNameStrategy(false), 'name', false);
    cmd.execute();
    expect(root.children.map((c) => c.name)).toEqual(['charlie.txt', 'bravo.png', 'alpha.docx']);
  });

  it('should sort by size ascending', () => {
    const cmd = new SortCommand(root, new SortBySizeStrategy(true), 'size', true);
    cmd.execute();
    expect(root.children.map((c) => c.getSizeKB())).toEqual([100, 200, 300]);
  });

  it('should undo sort to restore original order', () => {
    const originalNames = root.children.map((c) => c.name);
    const cmd = new SortCommand(root, new SortByNameStrategy(true), 'name', true);
    cmd.execute();
    cmd.undo();
    expect(root.children.map((c) => c.name)).toEqual(originalNames);
  });
});

// ─── Command Pattern：DeleteCommand ───

describe('DeleteCommand — 刪除命令', () => {
  it('should remove node from parent on execute', () => {
    const parent = new Directory('parent');
    const child = new WordFile('file.docx', 100, 5);
    parent.add(child);

    const cmd = new DeleteCommand(child, parent);
    cmd.execute();
    expect(parent.children).toHaveLength(0);
  });

  it('should restore node at original position on undo', () => {
    const parent = new Directory('parent');
    const a = new TextFile('a.txt', 10, 'UTF-8');
    const b = new TextFile('b.txt', 20, 'UTF-8');
    const c = new TextFile('c.txt', 30, 'UTF-8');
    parent.add(a);
    parent.add(b);
    parent.add(c);

    // 刪除中間的 b
    const cmd = new DeleteCommand(b, parent);
    cmd.execute();
    expect(parent.children.map((n) => n.name)).toEqual(['a.txt', 'c.txt']);

    cmd.undo();
    expect(parent.children.map((n) => n.name)).toEqual(['a.txt', 'b.txt', 'c.txt']);
  });
});

// ─── Command Pattern：TagCommand ───

describe('TagCommand — 標籤命令', () => {
  it('should add tag on execute and remove on undo', () => {
    const file = new WordFile('test.docx', 100, 5);
    const cmd = new TagCommand(file, TagType.Urgent, 'add');

    cmd.execute();
    expect(file.tags.has(TagType.Urgent)).toBe(true);

    cmd.undo();
    expect(file.tags.has(TagType.Urgent)).toBe(false);
  });

  it('should remove tag on execute and add on undo', () => {
    const file = new WordFile('test.docx', 100, 5);
    file.tags.add(TagType.Work);

    const cmd = new TagCommand(file, TagType.Work, 'remove');
    cmd.execute();
    expect(file.tags.has(TagType.Work)).toBe(false);

    cmd.undo();
    expect(file.tags.has(TagType.Work)).toBe(true);
  });
});

// ─── Strategy Pattern：SortByExtensionStrategy ───

describe('SortByExtensionStrategy', () => {
  it('should sort directories first, then by extension', () => {
    const nodes = [
      new TextFile('b.txt', 10, 'UTF-8'),
      new Directory('folder'),
      new WordFile('a.docx', 100, 5),
    ];

    const strategy = new SortByExtensionStrategy(true);
    const sorted = strategy.sort(nodes);

    // 目錄（extension = ''）應排最前
    expect(sorted[0].name).toBe('folder');
  });
});

// ─── Strategy Pattern：SortByTagStrategy ───

describe('SortByTagStrategy', () => {
  it('should sort by tag count', () => {
    const a = new TextFile('a.txt', 10, 'UTF-8');
    const b = new TextFile('b.txt', 20, 'UTF-8');
    b.tags.add(TagType.Urgent);
    b.tags.add(TagType.Work);
    const c = new TextFile('c.txt', 30, 'UTF-8');
    c.tags.add(TagType.Personal);

    const strategy = new SortByTagStrategy(false); // 降冪
    const sorted = strategy.sort([a, b, c]);

    expect(sorted[0].name).toBe('b.txt'); // 2 tags
    expect(sorted[1].name).toBe('c.txt'); // 1 tag
    expect(sorted[2].name).toBe('a.txt'); // 0 tags
  });
});

// ─── Observer Pattern：GoF Subject / Observer ───

describe('Observer Pattern — ConsoleObserver（整合 Decorator Pattern）', () => {
  let observer: ConsoleObserver;

  beforeEach(() => {
    observer = new ConsoleObserver();
  });

  it('should accumulate decorated HTML log on update', () => {
    observer.update({ type: 'visiting', message: '📂 進入目錄: docs' });
    observer.update({ type: 'matched', message: '✅ 匹配: report.docx' });

    const logs = observer.getLogs();
    expect(logs).toHaveLength(2);
    // visiting → 🔍 + dim 色
    expect(logs[0]).toContain('🔍');
    expect(logs[0]).toContain('log-dim');
    // matched → ✅ + green 色 + bold
    expect(logs[1]).toContain('✅');
    expect(logs[1]).toContain('log-green');
    expect(logs[1]).toContain('<strong>');
  });

  it('should join output with <br> separator', () => {
    observer.update({ type: 'visiting', message: 'A' });
    observer.update({ type: 'visiting', message: 'B' });

    expect(observer.getOutput()).toContain('<br>');
  });

  it('should clear logs', () => {
    observer.update({ type: 'visiting', message: 'test' });
    observer.clear();

    expect(observer.getLogs()).toEqual([]);
    expect(observer.getOutput()).toBe('');
  });

  it('should return a copy of logs (immutable)', () => {
    observer.update({ type: 'visiting', message: 'log1' });
    const logs = observer.getLogs();
    logs.push('injected');

    expect(observer.getLogs()).toHaveLength(1);
  });
});

describe('Observer Pattern — DashboardObserver', () => {
  let observer: DashboardObserver;

  beforeEach(() => {
    observer = new DashboardObserver();
  });

  it('should start with initial stats', () => {
    const stats = observer.getStats();
    expect(stats.totalVisited).toBe(0);
    expect(stats.totalMatched).toBe(0);
    expect(stats.isComplete).toBe(false);
    expect(stats.currentNode).toBeNull();
  });

  it('should track visiting events', () => {
    const node = new TextFile('readme.txt', 5, 'UTF-8');
    observer.update({ type: 'visiting', node, message: '🔎 檢查: readme.txt' });

    const stats = observer.getStats();
    expect(stats.totalVisited).toBe(1);
    expect(stats.totalMatched).toBe(0);
    expect(stats.currentNode).toBe('readme.txt');
  });

  it('should track matched events', () => {
    const node = new WordFile('report.docx', 100, 10);
    observer.update({ type: 'matched', node, message: '✅ 匹配: report.docx' });

    const stats = observer.getStats();
    expect(stats.totalVisited).toBe(1);
    expect(stats.totalMatched).toBe(1);
  });

  it('should mark complete on complete event', () => {
    observer.update({ type: 'visiting', message: '🔎 檢查' });
    observer.update({ type: 'complete', message: '🏁 搜尋完成' });

    const stats = observer.getStats();
    expect(stats.isComplete).toBe(true);
    expect(stats.currentNode).toBeNull();
    expect(stats.progressText).toContain('搜尋完成');
  });

  it('should reset stats', () => {
    observer.update({ type: 'visiting', message: 'test' });
    observer.update({ type: 'matched', message: 'test' });
    observer.reset();

    const stats = observer.getStats();
    expect(stats.totalVisited).toBe(0);
    expect(stats.totalMatched).toBe(0);
    expect(stats.isComplete).toBe(false);
  });

  it('should return a copy of stats (immutable)', () => {
    const stats = observer.getStats();
    stats.totalVisited = 999;

    expect(observer.getStats().totalVisited).toBe(0);
  });
});

describe('Observer Pattern — Subject attach/detach/notify', () => {
  /** 簡易 Subject 實作，驗證 GoF 介面契約 */
  class SimpleSubject implements ISubject<SearchEvent> {
    private observers = new Set<IObserver<SearchEvent>>();

    attach(observer: IObserver<SearchEvent>): void {
      this.observers.add(observer);
    }

    detach(observer: IObserver<SearchEvent>): void {
      this.observers.delete(observer);
    }

    notify(event: SearchEvent): void {
      for (const obs of this.observers) {
        obs.update(event);
      }
    }
  }

  it('should notify all attached observers', () => {
    const subject = new SimpleSubject();
    const consoleObs = new ConsoleObserver();
    const dashboardObs = new DashboardObserver();

    subject.attach(consoleObs);
    subject.attach(dashboardObs);

    const event: SearchEvent = { type: 'visiting', message: '📂 進入目錄: root' };
    subject.notify(event);

    expect(consoleObs.getLogs()).toHaveLength(1);
    expect(dashboardObs.getStats().totalVisited).toBe(1);
  });

  it('should not notify detached observers', () => {
    const subject = new SimpleSubject();
    const observer = new ConsoleObserver();

    subject.attach(observer);
    subject.notify({ type: 'visiting', message: 'first' });

    subject.detach(observer);
    subject.notify({ type: 'visiting', message: 'second' });

    // ConsoleObserver 現在產出 HTML，只驗證長度
    expect(observer.getLogs()).toHaveLength(1);
  });

  it('should support mixed observer types independently', () => {
    const subject = new SimpleSubject();
    const consoleObs = new ConsoleObserver();
    const dashboardObs = new DashboardObserver();

    subject.attach(consoleObs);
    subject.attach(dashboardObs);

    // 搜尋流程：目錄 → 檔案(visiting) → 匹配 → 完成
    subject.notify({ type: 'visiting', message: '📂 進入目錄: docs' });
    subject.notify({ type: 'visiting', message: '🔎 檢查: a.txt' });
    subject.notify({ type: 'matched', message: '✅ 匹配: a.txt' });
    subject.notify({ type: 'complete', message: '🏁 完成' });

    // ConsoleObserver 累積所有訊息
    expect(consoleObs.getLogs()).toHaveLength(4);

    // DashboardObserver 統計正確
    const stats = dashboardObs.getStats();
    expect(stats.totalVisited).toBe(3); // 2 visiting + 1 matched
    expect(stats.totalMatched).toBe(1);
    expect(stats.isComplete).toBe(true);
  });
});

// ─── Decorator Pattern：日誌裝飾器 ───

describe('Decorator Pattern — PlainLogEntry', () => {
  it('should render plain text', () => {
    const entry = new PlainLogEntry('Hello World');
    expect(entry.render()).toBe('Hello World');
  });

  it('should escape HTML special characters', () => {
    const entry = new PlainLogEntry('<script>alert("XSS")</script>');
    expect(entry.render()).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
  });

  it('should escape ampersand', () => {
    const entry = new PlainLogEntry('A & B');
    expect(entry.render()).toBe('A &amp; B');
  });
});

describe('Decorator Pattern — IconDecorator', () => {
  it('should prepend icon to rendered output', () => {
    const plain = new PlainLogEntry('test');
    const decorated = new IconDecorator(plain, '🔍');
    expect(decorated.render()).toBe('<span class="log-icon">🔍</span> test');
  });
});

describe('Decorator Pattern — ColorDecorator', () => {
  it('should wrap output with color class', () => {
    const plain = new PlainLogEntry('test');
    const decorated = new ColorDecorator(plain, 'green');
    expect(decorated.render()).toBe('<span class="log-green">test</span>');
  });
});

describe('Decorator Pattern — BoldDecorator', () => {
  it('should wrap output with strong tag', () => {
    const plain = new PlainLogEntry('important');
    const decorated = new BoldDecorator(plain);
    expect(decorated.render()).toBe('<strong>important</strong>');
  });
});

describe('Decorator Pattern — 裝飾器鏈組合', () => {
  it('should chain Color → Bold → Icon correctly', () => {
    let entry: ILogEntry = new PlainLogEntry('匹配: report.docx');
    entry = new ColorDecorator(entry, 'green');
    entry = new BoldDecorator(entry);
    entry = new IconDecorator(entry, '✅');

    const result = entry.render();
    expect(result).toContain('✅');
    expect(result).toContain('log-green');
    expect(result).toContain('<strong>');
    expect(result).toContain('匹配: report.docx');
  });
});

describe('Decorator Pattern — detectLogCategory', () => {
  it('should detect matched keywords', () => {
    expect(detectLogCategory('✅ 匹配: a.docx')).toBe('matched');
    expect(detectLogCategory('MATCH found')).toBe('matched');
  });

  it('should detect complete keywords', () => {
    expect(detectLogCategory('🏁 搜尋完成')).toBe('complete');
    expect(detectLogCategory('搜尋完成了')).toBe('complete');
  });

  it('should detect visiting keywords', () => {
    expect(detectLogCategory('📂 進入目錄: docs')).toBe('visiting');
    expect(detectLogCategory('🔎 檢查: a.txt')).toBe('visiting');
  });

  it('should detect command keywords', () => {
    expect(detectLogCategory('[Command] 排序已執行')).toBe('command');
    expect(detectLogCategory('撤銷操作')).toBe('command');
  });

  it('should detect system keywords', () => {
    expect(detectLogCategory('[System] 計算總容量')).toBe('system');
    expect(detectLogCategory('匯出結果')).toBe('system');
  });

  it('should default to "default" for unrecognized messages', () => {
    expect(detectLogCategory('Hello World')).toBe('default');
  });
});

describe('Decorator Pattern — decorateLogEntry 工廠', () => {
  it('should auto-decorate visiting messages with dim color and search icon', () => {
    const entry = decorateLogEntry('📂 進入目錄: docs', 'visiting');
    const html = entry.render();
    expect(html).toContain('🔍');
    expect(html).toContain('log-dim');
    expect(html).not.toContain('<strong>');
  });

  it('should auto-decorate matched messages with green + bold + icon', () => {
    const entry = decorateLogEntry('✅ 匹配: report.docx', 'matched');
    const html = entry.render();
    expect(html).toContain('✅');
    expect(html).toContain('log-green');
    expect(html).toContain('<strong>');
  });

  it('should auto-decorate complete messages with cyan + bold', () => {
    const entry = decorateLogEntry('🏁 搜尋完成', 'complete');
    const html = entry.render();
    expect(html).toContain('🏁');
    expect(html).toContain('log-cyan');
    expect(html).toContain('<strong>');
  });

  it('should auto-detect category when not provided', () => {
    const entry = decorateLogEntry('[System] 計算總容量...');
    const html = entry.render();
    expect(html).toContain('⚙️');
    expect(html).toContain('log-blue');
  });
});

// ─── Adapter Pattern：SearchEventAdapter ───

describe('Adapter Pattern — SearchEventAdapter', () => {
  let adapter: SearchEventAdapter;

  beforeEach(() => {
    adapter = new SearchEventAdapter(10);
  });

  it('should start with 0% progress', () => {
    expect(adapter.getProgress()).toBe(0);
    expect(adapter.getVisitedCount()).toBe(0);
    expect(adapter.getMatchedCount()).toBe(0);
    expect(adapter.isSearchComplete()).toBe(false);
  });

  it('should track visiting events', () => {
    adapter.update({ type: 'visiting', message: '📂 進入目錄: docs' });
    expect(adapter.getVisitedCount()).toBe(1);
    expect(adapter.getProgress()).toBe(10); // 1/10 = 10%
  });

  it('should track matched events (counts as visited too)', () => {
    adapter.update({ type: 'matched', message: '✅ 匹配: a.docx' });
    expect(adapter.getVisitedCount()).toBe(1);
    expect(adapter.getMatchedCount()).toBe(1);
  });

  it('should calculate progress percentage correctly', () => {
    adapter.setExpectedTotal(4);
    adapter.update({ type: 'visiting', message: 'a' });
    adapter.update({ type: 'visiting', message: 'b' });
    expect(adapter.getProgress()).toBe(50); // 2/4 = 50%
  });

  it('should cap progress at 99% before completion', () => {
    adapter.setExpectedTotal(2);
    adapter.update({ type: 'visiting', message: 'a' });
    adapter.update({ type: 'visiting', message: 'b' });
    adapter.update({ type: 'visiting', message: 'c' }); // 超過預估
    expect(adapter.getProgress()).toBe(99);
  });

  it('should set progress to 100% on complete', () => {
    adapter.update({ type: 'visiting', message: 'a' });
    adapter.update({ type: 'complete', message: '🏁 完成' });
    expect(adapter.getProgress()).toBe(100);
    expect(adapter.isSearchComplete()).toBe(true);
  });

  it('should track currentNodeName from visiting events', () => {
    const node = new WordFile('report.docx', 100, 5);
    adapter.update({ type: 'visiting', message: '檢查', node });
    expect(adapter.getCurrentNodeName()).toBe('report.docx');
  });

  it('should clear currentNodeName on complete', () => {
    const node = new WordFile('report.docx', 100, 5);
    adapter.update({ type: 'visiting', message: '檢查', node });
    adapter.update({ type: 'complete', message: '🏁 完成' });
    expect(adapter.getCurrentNodeName()).toBeNull();
  });

  it('should provide summary text', () => {
    adapter.update({ type: 'visiting', message: 'a' });
    adapter.update({ type: 'matched', message: 'b' });
    adapter.update({ type: 'complete', message: '完成' });

    const summary = adapter.getSummary();
    expect(summary).toContain('搜尋完成');
    expect(summary).toContain('2');
    expect(summary).toContain('1');
  });

  it('should reset all state', () => {
    adapter.update({ type: 'visiting', message: 'a' });
    adapter.update({ type: 'matched', message: 'b' });
    adapter.reset();

    expect(adapter.getVisitedCount()).toBe(0);
    expect(adapter.getMatchedCount()).toBe(0);
    expect(adapter.isSearchComplete()).toBe(false);
    expect(adapter.getProgress()).toBe(0);
  });

  it('should implement both IObserver and IDashboardDisplay', () => {
    // 驗證 Adapter 同時扮演 Observer + Target 角色
    const asObserver: IObserver<SearchEvent> = adapter;
    asObserver.update({ type: 'visiting', message: 'test' });

    // 透過 IDashboardDisplay 介面取得轉換後的資料
    expect(adapter.getVisitedCount()).toBe(1);
    expect(adapter.getProgress()).toBe(10);
  });
});

// ─── FileSystemNode.clone() — 深拷貝 ───

describe('FileSystemNode.clone() — 深拷貝', () => {
  it('should clone WordFile with new id', () => {
    const original = new WordFile('doc.docx', 500, 15);
    original.tags.add(TagType.Urgent);
    const copy = original.clone();

    expect(copy).toBeInstanceOf(WordFile);
    expect(copy.name).toBe('doc.docx');
    expect(copy.sizeKB).toBe(500);
    expect((copy as WordFile).pages).toBe(15);
    expect(copy.tags.has(TagType.Urgent)).toBe(true);
    expect(copy.id).not.toBe(original.id);
  });

  it('should clone ImageFile with all properties', () => {
    const original = new ImageFile('pic.png', 2048, 1920, 1080);
    const copy = original.clone();

    expect(copy).toBeInstanceOf(ImageFile);
    expect((copy as ImageFile).width).toBe(1920);
    expect((copy as ImageFile).height).toBe(1080);
    expect(copy.id).not.toBe(original.id);
  });

  it('should clone TextFile with encoding', () => {
    const original = new TextFile('readme.txt', 10, 'UTF-8');
    const copy = original.clone();

    expect(copy).toBeInstanceOf(TextFile);
    expect((copy as TextFile).encoding).toBe('UTF-8');
    expect(copy.id).not.toBe(original.id);
  });

  it('should deep clone Directory and all children', () => {
    const root = new Directory('root');
    const sub = new Directory('sub');
    sub.add(new WordFile('a.docx', 100, 5));
    sub.add(new TextFile('b.txt', 50, 'UTF-8'));
    root.add(sub);
    root.add(new ImageFile('c.png', 200, 800, 600));

    const copy = root.clone() as Directory;

    expect(copy.name).toBe('root');
    expect(copy.id).not.toBe(root.id);
    expect(copy.children).toHaveLength(2);

    const subCopy = copy.children[0] as Directory;
    expect(subCopy.id).not.toBe(sub.id);
    expect(subCopy.children).toHaveLength(2);

    // 修改 copy 不影響 original
    subCopy.children.pop();
    expect(sub.children).toHaveLength(2);
  });

  it('should clone tags (independent Set)', () => {
    const original = new WordFile('doc.docx', 100, 5);
    original.tags.add(TagType.Work);
    const copy = original.clone();

    copy.tags.add(TagType.Urgent);
    expect(original.tags.has(TagType.Urgent)).toBe(false);
  });
});

// ─── Singleton Pattern：Clipboard ───

describe('Singleton Pattern — Clipboard', () => {
  beforeEach(() => {
    Clipboard.resetInstance();
  });

  it('should return the same instance', () => {
    const a = Clipboard.getInstance();
    const b = Clipboard.getInstance();
    expect(a).toBe(b);
  });

  it('should start with no content', () => {
    const clipboard = Clipboard.getInstance();
    expect(clipboard.hasContent()).toBe(false);
    expect(clipboard.paste()).toBeNull();
    expect(clipboard.getSourceName()).toBeNull();
  });

  it('should copy a node and store deep clone', () => {
    const clipboard = Clipboard.getInstance();
    const file = new WordFile('report.docx', 500, 15);

    clipboard.copy(file);
    expect(clipboard.hasContent()).toBe(true);
    expect(clipboard.getSourceName()).toBe('report.docx');
  });

  it('should paste a deep copy (different id)', () => {
    const clipboard = Clipboard.getInstance();
    const file = new WordFile('report.docx', 500, 15);
    clipboard.copy(file);

    const pasted = clipboard.paste();
    expect(pasted).not.toBeNull();
    expect(pasted!.name).toBe('report.docx');
    expect(pasted!.id).not.toBe(file.id);
  });

  it('should allow multiple pastes (clipboard not consumed)', () => {
    const clipboard = Clipboard.getInstance();
    clipboard.copy(new TextFile('note.txt', 10, 'UTF-8'));

    const paste1 = clipboard.paste();
    const paste2 = clipboard.paste();

    expect(paste1).not.toBeNull();
    expect(paste2).not.toBeNull();
    expect(paste1!.id).not.toBe(paste2!.id);
  });

  it('should clear clipboard', () => {
    const clipboard = Clipboard.getInstance();
    clipboard.copy(new TextFile('a.txt', 1, 'UTF-8'));
    clipboard.clear();

    expect(clipboard.hasContent()).toBe(false);
    expect(clipboard.getSourceName()).toBeNull();
  });

  it('should reset instance for testing', () => {
    const before = Clipboard.getInstance();
    Clipboard.resetInstance();
    const after = Clipboard.getInstance();
    expect(before).not.toBe(after);
  });
});

// ─── Command Pattern：CopyCommand ───

describe('CopyCommand — 複製命令', () => {
  beforeEach(() => {
    Clipboard.resetInstance();
  });

  it('should copy node to clipboard on execute', () => {
    const file = new WordFile('doc.docx', 500, 15);
    const cmd = new CopyCommand(file);

    cmd.execute();
    const clipboard = Clipboard.getInstance();
    expect(clipboard.hasContent()).toBe(true);
    expect(clipboard.getSourceName()).toBe('doc.docx');
  });

  it('should restore previous clipboard on undo', () => {
    const clipboard = Clipboard.getInstance();
    const first = new TextFile('first.txt', 10, 'UTF-8');
    const second = new WordFile('second.docx', 200, 10);

    clipboard.copy(first);
    expect(clipboard.getSourceName()).toBe('first.txt');

    const cmd = new CopyCommand(second);
    cmd.execute();
    expect(clipboard.getSourceName()).toBe('second.docx');

    cmd.undo();
    expect(clipboard.hasContent()).toBe(true);
    expect(clipboard.getSourceName()).toBe('first.txt');
  });

  it('should clear clipboard on undo when it was empty before', () => {
    const file = new WordFile('doc.docx', 100, 5);
    const cmd = new CopyCommand(file);

    cmd.execute();
    cmd.undo();

    const clipboard = Clipboard.getInstance();
    expect(clipboard.hasContent()).toBe(false);
  });

  it('should have correct description', () => {
    const file = new TextFile('readme.txt', 5, 'UTF-8');
    const cmd = new CopyCommand(file);
    expect(cmd.description).toBe('複製：readme.txt');
  });
});

// ─── Command Pattern：PasteCommand ───

describe('PasteCommand — 貼上命令', () => {
  beforeEach(() => {
    Clipboard.resetInstance();
  });

  it('should paste node into target directory on execute', () => {
    const clipboard = Clipboard.getInstance();
    clipboard.copy(new WordFile('doc.docx', 500, 15));

    const targetDir = new Directory('dest');
    const cmd = new PasteCommand(targetDir);
    cmd.execute();

    expect(targetDir.children).toHaveLength(1);
    expect(targetDir.children[0].name).toBe('doc.docx');
  });

  it('should remove pasted node on undo', () => {
    const clipboard = Clipboard.getInstance();
    clipboard.copy(new TextFile('note.txt', 10, 'UTF-8'));

    const targetDir = new Directory('dest');
    const cmd = new PasteCommand(targetDir);
    cmd.execute();
    expect(targetDir.children).toHaveLength(1);

    cmd.undo();
    expect(targetDir.children).toHaveLength(0);
  });

  it('should throw when clipboard is empty', () => {
    const targetDir = new Directory('dest');
    const cmd = new PasteCommand(targetDir);
    expect(() => cmd.execute()).toThrow('剪貼簿為空');
  });

  it('should paste different instances each time', () => {
    const clipboard = Clipboard.getInstance();
    clipboard.copy(new WordFile('doc.docx', 500, 15));

    const dir = new Directory('dest');
    const cmd1 = new PasteCommand(dir);
    cmd1.execute();

    const cmd2 = new PasteCommand(dir);
    cmd2.execute();

    expect(dir.children).toHaveLength(2);
    expect(dir.children[0].id).not.toBe(dir.children[1].id);
  });

  it('should have correct description', () => {
    const clipboard = Clipboard.getInstance();
    clipboard.copy(new WordFile('doc.docx', 500, 15));

    const dir = new Directory('dest');
    const cmd = new PasteCommand(dir);
    expect(cmd.description).toBe('貼上：doc.docx → dest');
  });
});

// ─── CopyCommand + PasteCommand 整合 CommandHistory ───

describe('CopyCommand + PasteCommand — 與 CommandHistory 整合', () => {
  let history: CommandHistory;

  beforeEach(() => {
    history = new CommandHistory();
    Clipboard.resetInstance();
  });

  it('should support copy → paste → undo paste → undo copy flow', () => {
    const root = new Directory('root');
    const file = new WordFile('doc.docx', 500, 15);
    root.add(file);

    const targetDir = new Directory('dest');
    root.add(targetDir);

    // 1. Copy
    const copyCmd = new CopyCommand(file);
    history.executeCommand(copyCmd);
    expect(Clipboard.getInstance().hasContent()).toBe(true);

    // 2. Paste
    const pasteCmd = new PasteCommand(targetDir);
    history.executeCommand(pasteCmd);
    expect(targetDir.children).toHaveLength(1);

    // 3. Undo paste
    history.undo();
    expect(targetDir.children).toHaveLength(0);

    // 4. Undo copy
    history.undo();
    expect(Clipboard.getInstance().hasContent()).toBe(false);
  });

  it('should support redo after undo', () => {
    const file = new TextFile('note.txt', 10, 'UTF-8');
    const targetDir = new Directory('dest');

    history.executeCommand(new CopyCommand(file));
    history.executeCommand(new PasteCommand(targetDir));
    expect(targetDir.children).toHaveLength(1);

    history.undo();
    expect(targetDir.children).toHaveLength(0);

    history.redo();
    expect(targetDir.children).toHaveLength(1);
  });
});

// ─── Flyweight Pattern：Label + LabelFactory ───

describe('Flyweight Pattern — LabelFactory', () => {
  beforeEach(() => {
    LabelFactory.resetPool();
  });

  it('should return the same Label instance for the same TagType (享元唐一性)', () => {
    const a = LabelFactory.getLabel(TagType.Urgent);
    const b = LabelFactory.getLabel(TagType.Urgent);
    expect(a).toBe(b); // 同一參考
  });

  it('should return different instances for different TagTypes', () => {
    const urgent = LabelFactory.getLabel(TagType.Urgent);
    const work = LabelFactory.getLabel(TagType.Work);
    expect(urgent).not.toBe(work);
  });

  it('should have correct intrinsic state', () => {
    const label = LabelFactory.getLabel(TagType.Work);
    expect(label.type).toBe(TagType.Work);
    expect(label.displayName).toBe('工作');
    expect(label.color).toBe('#3498db');
    expect(label.icon).toBe('🔵');
  });

  it('should lazily create pool entries', () => {
    expect(LabelFactory.getPoolSize()).toBe(0);
    LabelFactory.getLabel(TagType.Urgent);
    expect(LabelFactory.getPoolSize()).toBe(1);
    LabelFactory.getLabel(TagType.Work);
    expect(LabelFactory.getPoolSize()).toBe(2);
    // 再次取得不應增加
    LabelFactory.getLabel(TagType.Urgent);
    expect(LabelFactory.getPoolSize()).toBe(2);
  });

  it('should return all 3 labels via getAllLabels()', () => {
    const labels = LabelFactory.getAllLabels();
    expect(labels).toHaveLength(3);
    expect(labels.map((l) => l.type)).toEqual([TagType.Urgent, TagType.Work, TagType.Personal]);
  });

  it('should reset pool', () => {
    LabelFactory.getLabel(TagType.Urgent);
    expect(LabelFactory.getPoolSize()).toBe(1);
    LabelFactory.resetPool();
    expect(LabelFactory.getPoolSize()).toBe(0);
  });

  it('should create Label with readonly properties (immutable)', () => {
    const label = LabelFactory.getLabel(TagType.Personal);
    expect(label).toBeInstanceOf(Label);
    expect(label.displayName).toBe('個人');
    expect(label.color).toBe('#2ecc71');
    expect(label.icon).toBe('🟢');
  });
});

// ─── Mediator Pattern：TagMediator ───

describe('Mediator Pattern — TagMediator', () => {
  let mediator: TagMediator;

  beforeEach(() => {
    mediator = new TagMediator();
    LabelFactory.resetPool();
  });

  it('should add tag and sync node.tags', () => {
    const file = new WordFile('doc.docx', 100, 5);
    mediator.addTag(file, TagType.Urgent);

    expect(mediator.hasTag(file, TagType.Urgent)).toBe(true);
    expect(file.tags.has(TagType.Urgent)).toBe(true); // 向後相容
  });

  it('should remove tag and sync node.tags', () => {
    const file = new WordFile('doc.docx', 100, 5);
    mediator.addTag(file, TagType.Work);
    mediator.removeTag(file, TagType.Work);

    expect(mediator.hasTag(file, TagType.Work)).toBe(false);
    expect(file.tags.has(TagType.Work)).toBe(false);
  });

  it('should return Label[] via getLabelsForNode (Flyweight)', () => {
    const file = new WordFile('doc.docx', 100, 5);
    mediator.addTag(file, TagType.Urgent);
    mediator.addTag(file, TagType.Work);

    const labels = mediator.getLabelsForNode(file);
    expect(labels).toHaveLength(2);
    // 回傳的是 Flyweight Label 實體
    expect(labels[0]).toBe(LabelFactory.getLabel(TagType.Urgent));
  });

  it('should reverse lookup: getNodesByLabel', () => {
    const a = new WordFile('a.docx', 100, 5);
    const b = new TextFile('b.txt', 50, 'UTF-8');
    const c = new ImageFile('c.png', 200, 800, 600);

    mediator.addTag(a, TagType.Urgent);
    mediator.addTag(b, TagType.Urgent);
    mediator.addTag(c, TagType.Work);

    const urgentNodes = mediator.getNodesByLabel(TagType.Urgent);
    expect(urgentNodes).toHaveLength(2);
    expect(urgentNodes).toContain(a);
    expect(urgentNodes).toContain(b);

    const workNodes = mediator.getNodesByLabel(TagType.Work);
    expect(workNodes).toHaveLength(1);
    expect(workNodes[0]).toBe(c);
  });

  it('should compute tag counts correctly', () => {
    const a = new WordFile('a.docx', 100, 5);
    const b = new TextFile('b.txt', 50, 'UTF-8');

    mediator.addTag(a, TagType.Urgent);
    mediator.addTag(b, TagType.Urgent);
    mediator.addTag(a, TagType.Work);

    const counts = mediator.getTagCounts();
    expect(counts[TagType.Urgent]).toBe(2);
    expect(counts[TagType.Work]).toBe(1);
    expect(counts[TagType.Personal]).toBe(0);
  });

  it('should register existing node.tags via registerNode', () => {
    const file = new WordFile('doc.docx', 100, 5);
    file.tags.add(TagType.Personal);
    file.tags.add(TagType.Work);

    mediator.registerNode(file);

    expect(mediator.hasTag(file, TagType.Personal)).toBe(true);
    expect(mediator.hasTag(file, TagType.Work)).toBe(true);
    expect(mediator.getNodesByLabel(TagType.Personal)).toContain(file);
  });

  it('should unregister node and clean up indexes', () => {
    const file = new WordFile('doc.docx', 100, 5);
    mediator.addTag(file, TagType.Urgent);
    mediator.addTag(file, TagType.Work);

    mediator.unregisterNode(file);

    expect(mediator.hasTag(file, TagType.Urgent)).toBe(false);
    expect(mediator.getNodesByLabel(TagType.Urgent)).toHaveLength(0);
    expect(mediator.getTagCounts()[TagType.Urgent]).toBe(0);
  });

  it('should syncFromTree and rebuild indexes', () => {
    const root = new Directory('root');
    const a = new WordFile('a.docx', 100, 5);
    a.tags.add(TagType.Urgent);
    const sub = new Directory('sub');
    const b = new TextFile('b.txt', 50, 'UTF-8');
    b.tags.add(TagType.Work);
    b.tags.add(TagType.Urgent);
    sub.add(b);
    root.add(a);
    root.add(sub);

    mediator.syncFromTree(root);

    expect(mediator.getTagCounts()[TagType.Urgent]).toBe(2);
    expect(mediator.getTagCounts()[TagType.Work]).toBe(1);
    expect(mediator.getNodesByLabel(TagType.Urgent)).toHaveLength(2);
  });

  it('should return empty for unknown node', () => {
    const file = new WordFile('unknown.docx', 100, 5);
    expect(mediator.hasTag(file, TagType.Urgent)).toBe(false);
    expect(mediator.getLabelsForNode(file)).toHaveLength(0);
  });

  it('should return empty for unused label type', () => {
    expect(mediator.getNodesByLabel(TagType.Personal)).toHaveLength(0);
  });
});

// ─── TagCommand + TagMediator 整合 ───

describe('TagCommand + TagMediator 整合', () => {
  let mediator: TagMediator;

  beforeEach(() => {
    mediator = new TagMediator();
    LabelFactory.resetPool();
  });

  it('should add tag via mediator on execute', () => {
    const file = new WordFile('doc.docx', 100, 5);
    const cmd = new TagCommand(file, TagType.Urgent, 'add', mediator);
    cmd.execute();

    expect(mediator.hasTag(file, TagType.Urgent)).toBe(true);
    expect(file.tags.has(TagType.Urgent)).toBe(true);
  });

  it('should remove tag via mediator on undo', () => {
    const file = new WordFile('doc.docx', 100, 5);
    const cmd = new TagCommand(file, TagType.Work, 'add', mediator);
    cmd.execute();
    cmd.undo();

    expect(mediator.hasTag(file, TagType.Work)).toBe(false);
    expect(file.tags.has(TagType.Work)).toBe(false);
  });

  it('should use Flyweight Label in description', () => {
    const file = new WordFile('doc.docx', 100, 5);
    const cmd = new TagCommand(file, TagType.Urgent, 'add', mediator);
    expect(cmd.description).toContain('緊急');
    expect(cmd.description).toContain('新增標籤');
  });

  it('should work without mediator (backward compatible)', () => {
    const file = new WordFile('doc.docx', 100, 5);
    const cmd = new TagCommand(file, TagType.Personal, 'add');
    cmd.execute();
    expect(file.tags.has(TagType.Personal)).toBe(true);
    cmd.undo();
    expect(file.tags.has(TagType.Personal)).toBe(false);
  });

  it('should support full undo/redo flow with CommandHistory', () => {
    const history = new CommandHistory();
    const file = new WordFile('doc.docx', 100, 5);

    history.executeCommand(new TagCommand(file, TagType.Urgent, 'add', mediator));
    expect(mediator.hasTag(file, TagType.Urgent)).toBe(true);

    history.executeCommand(new TagCommand(file, TagType.Work, 'add', mediator));
    expect(mediator.getLabelsForNode(file)).toHaveLength(2);

    history.undo();
    expect(mediator.hasTag(file, TagType.Work)).toBe(false);
    expect(mediator.getLabelsForNode(file)).toHaveLength(1);

    history.redo();
    expect(mediator.hasTag(file, TagType.Work)).toBe(true);
  });

  it('should update tag counts after add/remove via mediator', () => {
    const a = new WordFile('a.docx', 100, 5);
    const b = new TextFile('b.txt', 50, 'UTF-8');

    new TagCommand(a, TagType.Urgent, 'add', mediator).execute();
    new TagCommand(b, TagType.Urgent, 'add', mediator).execute();
    new TagCommand(a, TagType.Work, 'add', mediator).execute();

    expect(mediator.getTagCounts()[TagType.Urgent]).toBe(2);
    expect(mediator.getTagCounts()[TagType.Work]).toBe(1);

    new TagCommand(a, TagType.Urgent, 'remove', mediator).execute();
    expect(mediator.getTagCounts()[TagType.Urgent]).toBe(1);
  });
});
