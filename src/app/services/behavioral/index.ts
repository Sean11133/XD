// ==========================================
// 行為型模式（Behavioral Patterns）— Barrel Export
//
// 行為型模式關注物件之間的通訊與職責分配，包括：
//   Chain of Resp. / Command / Interpreter / Iterator / Mediator
//   Memento / Observer / State / Strategy / Template Method / Visitor
//
// 本專案使用 Command / Observer / Strategy / Visitor Pattern
// ==========================================

export { CommandHistory } from './command-history.service';
export { SearchSubjectService } from './search-subject.service';
export { ViewStateService } from './view-state.service';
export { FileManagerFacade } from './file-manager-facade.service';
export type { SortType, IDashboardDisplay } from './file-manager-facade.service';
