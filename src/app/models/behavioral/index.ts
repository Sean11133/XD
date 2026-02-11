// ==========================================
// 行為型模式（Behavioral Patterns）— Barrel Export
//
// Command Pattern / Strategy Pattern / Visitor Pattern / Observer Pattern
// ==========================================

// --- Visitor Pattern ---
export type { IVisitor } from './visitor.interface';
export { XmlExportVisitor } from './xml-export.visitor';
export { ExtensionSearchVisitor } from './extension-search.visitor';

// --- Command Pattern ---
export type { ICommand } from './command.interface';
export { DeleteCommand } from './delete.command';
export { SortCommand } from './sort.command';
export { TagCommand } from './tag.command';
export type { TagAction } from './tag.command';

// --- Strategy Pattern ---
export type { ISortStrategy } from './sort-strategy.interface';
export { SortByNameStrategy } from './sort-by-name.strategy';
export { SortBySizeStrategy } from './sort-by-size.strategy';
export { SortByExtensionStrategy } from './sort-by-extension.strategy';
export { SortByTagStrategy } from './sort-by-tag.strategy';

// --- Observer Pattern ---
export type { SearchEvent, SearchEventType } from './search-event.model';
