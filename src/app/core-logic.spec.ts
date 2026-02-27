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
import { SortByNameStrategy } from './models/behavioral/sort-by-name.strategy';
import { SortBySizeStrategy } from './models/behavioral/sort-by-size.strategy';
import { SortByExtensionStrategy } from './models/behavioral/sort-by-extension.strategy';
import { SortByTagStrategy } from './models/behavioral/sort-by-tag.strategy';
import { CommandHistory } from './services/behavioral/command-history.service';

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
    const cmd = new SortCommand(root, new SortByNameStrategy(true));
    cmd.execute();
    expect(root.children.map((c) => c.name)).toEqual(['alpha.docx', 'bravo.png', 'charlie.txt']);
  });

  it('should sort by name descending', () => {
    const cmd = new SortCommand(root, new SortByNameStrategy(false));
    cmd.execute();
    expect(root.children.map((c) => c.name)).toEqual(['charlie.txt', 'bravo.png', 'alpha.docx']);
  });

  it('should sort by size ascending', () => {
    const cmd = new SortCommand(root, new SortBySizeStrategy(true));
    cmd.execute();
    expect(root.children.map((c) => c.getSizeKB())).toEqual([100, 200, 300]);
  });

  it('should undo sort to restore original order', () => {
    const originalNames = root.children.map((c) => c.name);
    const cmd = new SortCommand(root, new SortByNameStrategy(true));
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
