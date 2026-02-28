// ==========================================
// 行為型模式（Behavioral Patterns）— Barrel Export
//
// Command Pattern / Strategy Pattern / Visitor Pattern / Observer Pattern
// ==========================================

// --- Visitor Pattern ---
export type { IVisitor } from './visitor.interface';
export { BaseExportVisitor } from './base-export.visitor';
export { XmlExportVisitor } from './xml-export.visitor';
export { JsonExportVisitor } from './json-export.visitor';
export { MarkdownExportVisitor } from './markdown-export.visitor';
export { ExtensionSearchVisitor } from './extension-search.visitor';

// --- Command Pattern ---
export type { ICommand } from './command.interface';
export { DeleteCommand } from './delete.command';
export { SortCommand } from './sort.command';
export { TagCommand } from './tag.command';
export type { TagAction } from './tag.command';
export { CopyCommand } from './copy.command';
export { PasteCommand } from './paste.command';

// --- Mediator Pattern ---
export { TagMediator } from './tag.mediator';

// --- Strategy Pattern ---
export type { ISortStrategy } from './sort-strategy.interface';
export { SortByNameStrategy } from './sort-by-name.strategy';
export { SortBySizeStrategy } from './sort-by-size.strategy';
export { SortByExtensionStrategy } from './sort-by-extension.strategy';
export { SortByTagStrategy } from './sort-by-tag.strategy';

// --- Observer Pattern ---
export type { IObserver, ISubject } from './observer.interface';
export { ConsoleObserver } from './console.observer';
export { DashboardObserver } from './dashboard.observer';
export type { DashboardStats } from './dashboard.observer';
export type { SearchEvent, SearchEventType } from './search-event.model';
