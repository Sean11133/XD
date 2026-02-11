import{a as D}from"./chunk-IYBEICGX.js";import"./chunk-LCWNOMSF.js";import"./chunk-KSGKTOM2.js";import{c as F}from"./chunk-O7XV3ZTY.js";import{Ja as u,Ka as m,Oa as s,Pa as n,Qa as t,Ra as d,S as C,T as S,Xa as c,Za as p,ba as E,gb as e,hb as g,oa as o,za as v}from"./chunk-LELRBKKG.js";import"./chunk-BIHNL7XX.js";import"./chunk-6UGSP7QS.js";import"./chunk-2MWJVX7U.js";import"./chunk-VCYFVC25.js";import"./chunk-FD6FUJSP.js";import"./chunk-245NPPT3.js";import"./chunk-TDR26EUI.js";import"./chunk-W5E2OJKN.js";import"./chunk-BUPRJBLB.js";import"./chunk-HN3TUAMP.js";import"./chunk-AAZ3XMAW.js";import"./chunk-47NYRCQV.js";import"./chunk-SUN732H5.js";import"./chunk-OOCD4CDJ.js";import"./chunk-6PMQQMX7.js";function y(i,l){if(i&1&&(n(0,"div",38),d(1,"app-mermaid-diagram",39),t(),n(2,"div",40)(3,"strong"),e(4,"\u{1F511} Composite Pattern \u89D2\u8272\uFF1A"),t(),n(5,"code"),e(6,"FileSystemNode"),t(),e(7," = Component\uFF08\u62BD\u8C61\u57FA\u985E\uFF09| "),n(8,"code"),e(9,"FileNode"),t(),e(10," = Leaf \u62BD\u8C61\u57FA\u985E | "),n(11,"code"),e(12,"WordFile / ImageFile / TextFile"),t(),e(13," = Leaf | "),n(14,"code"),e(15,"Directory"),t(),e(16," = Composite\uFF08\u542B children\uFF09 "),t()),i&2){let r=p();o(),s("definition",r.compositeDiagram)}}function f(i,l){if(i&1&&(n(0,"div",38),d(1,"app-mermaid-diagram",39),t(),n(2,"div",40)(3,"strong"),e(4,"\u{1F511} Visitor Pattern \u89D2\u8272\uFF1A"),t(),n(5,"code"),e(6,"IVisitor"),t(),e(7," = Visitor \u4ECB\u9762\uFF08\u5B9A\u7FA9 visit \u65B9\u6CD5\uFF09| "),n(8,"code"),e(9,"XmlExportVisitor"),t(),e(10," / "),n(11,"code"),e(12,"ExtensionSearchVisitor"),t(),e(13," = Concrete Visitor | \u5404 FileSystemNode \u7684 "),n(14,"code"),e(15,"accept()"),t(),e(16," = Double Dispatch \u6A5F\u5236 "),t()),i&2){let r=p();o(),s("definition",r.visitorDiagram)}}function _(i,l){if(i&1&&(n(0,"div",38),d(1,"app-mermaid-diagram",39),t(),n(2,"div",40)(3,"strong"),e(4,"\u{1F511} Command Pattern \u89D2\u8272\uFF1A"),t(),n(5,"code"),e(6,"ICommand"),t(),e(7," = Command \u4ECB\u9762 | "),n(8,"code"),e(9,"SortCommand / DeleteCommand / TagCommand"),t(),e(10," = Concrete Command | "),n(11,"code"),e(12,"CommandHistory"),t(),e(13," = Invoker\uFF08\u7BA1\u7406 Undo/Redo \u5806\u758A\uFF09| "),n(14,"code"),e(15,"App Component"),t(),e(16," = Client\uFF08\u5EFA\u7ACB\u547D\u4EE4\uFF09 "),t()),i&2){let r=p();o(),s("definition",r.commandDiagram)}}function B(i,l){if(i&1&&(n(0,"div",38),d(1,"app-mermaid-diagram",39),t(),n(2,"div",40)(3,"strong"),e(4,"\u{1F511} Strategy Pattern \u89D2\u8272\uFF1A"),t(),n(5,"code"),e(6,"ISortStrategy"),t(),e(7," = Strategy \u4ECB\u9762 | "),n(8,"code"),e(9,"SortByXxxStrategy"),t(),e(10," = Concrete Strategy | "),n(11,"code"),e(12,"SortCommand"),t(),e(13," = Context\uFF08\u6301\u6709 strategy \u53C3\u8003\uFF09 "),t()),i&2){let r=p();o(),s("definition",r.strategyDiagram)}}function h(i,l){if(i&1&&(n(0,"div",38),d(1,"app-mermaid-diagram",39),t(),n(2,"div",40)(3,"strong"),e(4,"\u{1F511} Observer Pattern \u89D2\u8272\uFF1A"),t(),n(5,"code"),e(6,"SearchSubjectService"),t(),e(7," = Subject\uFF08\u88AB\u89C0\u5BDF\u8005\uFF0C\u7528 RxJS Subject \u5BE6\u4F5C\uFF09| "),n(8,"code"),e(9,"App Component"),t(),e(10," = Observer\uFF08\u89C0\u5BDF\u8005\uFF0Csubscribe \u4E8B\u4EF6\u6D41\uFF09| "),n(11,"code"),e(12,"SearchEvent"),t(),e(13," = Event Model "),t()),i&2){let r=p();o(),s("definition",r.observerDiagram)}}var b=class i{expandedGroup=E("composite");toggleGroup(l){this.expandedGroup.set(this.expandedGroup()===l?null:l)}compositeDiagram=`
classDiagram
  class FileSystemNode {
    <<abstract>>
    +name: string
    +highlightState: HighlightState
    +tags: Set~TagType~
    +accept(visitor: IVisitor) void
    +getSizeKB() number
    +getIcon() string
    +getTypeLabel() string
    +getDetails() string
    +getTagsArray() TagType[]
  }
  class FileNode {
    <<abstract>>
    +sizeKB: number
    +getSizeKB() number
  }
  class Directory {
    +children: FileSystemNode[]
    +add(node) void
    +remove(node) number
    +insertAt(node, index) void
    +getSizeKB() number
    +accept(visitor) void
  }
  class WordFile {
    +pages: number
    +accept(visitor) void
  }
  class ImageFile {
    +width: number
    +height: number
    +accept(visitor) void
  }
  class TextFile {
    +encoding: string
    +accept(visitor) void
  }

  FileSystemNode <|-- FileNode
  FileSystemNode <|-- Directory
  FileNode <|-- WordFile
  FileNode <|-- ImageFile
  FileNode <|-- TextFile
  Directory o-- FileSystemNode : children
`;visitorDiagram=`
classDiagram
  class IVisitor {
    <<interface>>
    +visitDirectory(dir) void
    +visitWordFile(file) void
    +visitImageFile(file) void
    +visitTextFile(file) void
  }
  class XmlExportVisitor {
    -xml: string
    -indentLevel: number
    +getResult() string
    +visitDirectory(dir) void
    +visitWordFile(file) void
  }
  class ExtensionSearchVisitor {
    -results: string[]
    -targetExtension: string
    -subject: SearchSubjectService
    +getResults() string[]
    +visitDirectory(dir) void
    -checkFile(file) void
  }

  IVisitor <|.. XmlExportVisitor
  IVisitor <|.. ExtensionSearchVisitor
`;commandDiagram=`
classDiagram
  class ICommand {
    <<interface>>
    +execute() void
    +undo() void
    +description: string
  }
  class CommandHistory {
    <<Invoker>>
    -undoStack: Signal~ICommand[]~
    -redoStack: Signal~ICommand[]~
    +executeCommand(cmd) void
    +undo() ICommand
    +redo() ICommand
    +canUndo: Signal~boolean~
    +canRedo: Signal~boolean~
  }
  class SortCommand {
    -root: Directory
    -strategy: ISortStrategy
    -previousOrders: Map
    +execute() void
    +undo() void
  }
  class DeleteCommand {
    -node: FileSystemNode
    -parent: Directory
    -removedIndex: number
    +execute() void
    +undo() void
  }
  class TagCommand {
    -node: FileSystemNode
    -tag: TagType
    -action: TagAction
    +execute() void
    +undo() void
  }

  ICommand <|.. SortCommand
  ICommand <|.. DeleteCommand
  ICommand <|.. TagCommand
  CommandHistory --> ICommand : executes
`;strategyDiagram=`
classDiagram
  class ISortStrategy {
    <<interface>>
    +name: string
    +sort(nodes) FileSystemNode[]
  }
  class SortByNameStrategy {
    -ascending: boolean
    +sort(nodes) FileSystemNode[]
  }
  class SortBySizeStrategy {
    -ascending: boolean
    +sort(nodes) FileSystemNode[]
  }
  class SortByExtensionStrategy {
    -ascending: boolean
    +sort(nodes) FileSystemNode[]
  }
  class SortByTagStrategy {
    -ascending: boolean
    +sort(nodes) FileSystemNode[]
  }

  ISortStrategy <|.. SortByNameStrategy
  ISortStrategy <|.. SortBySizeStrategy
  ISortStrategy <|.. SortByExtensionStrategy
  ISortStrategy <|.. SortByTagStrategy
`;observerDiagram=`
classDiagram
  class SearchSubjectService {
    <<Subject>>
    -searchEvent$: Subject~SearchEvent~
    +events$: Observable~SearchEvent~
    +notify(event) void
  }
  class SearchEvent {
    +type: SearchEventType
    +node: FileSystemNode
    +message: string
  }
  class AppComponent {
    <<Observer>>
    -onSearchEvent(event) void
    subscribe \u2192 \u5373\u6642\u66F4\u65B0 UI
  }

  SearchSubjectService --> SearchEvent : emits
  AppComponent --> SearchSubjectService : subscribes
`;static \u0275fac=function(r){return new(r||i)};static \u0275cmp=v({type:i,selectors:[["app-class-diagram"]],decls:148,vars:10,consts:[[1,"page"],[1,"page-title"],[1,"concept-section"],[1,"section-title"],[1,"info-card"],[1,"elements-section"],[1,"element-grid"],[1,"element-card"],[1,"mini-class-box"],[1,"mcb-name"],[1,"mcb-section"],[1,"relation-visual"],[1,"rv-box"],["viewBox","0 0 40 40","width","40","height","40"],["x1","20","y1","0","x2","20","y2","25","stroke","#4ec9b0","stroke-width","2"],["points","12,25 20,40 28,25","fill","none","stroke","#4ec9b0","stroke-width","2"],[1,"rv-box","dashed"],["x1","20","y1","0","x2","20","y2","25","stroke","#0e639c","stroke-width","2","stroke-dasharray","4,3"],["points","12,25 20,40 28,25","fill","none","stroke","#0e639c","stroke-width","2"],[1,"relation-visual","horizontal"],[1,"rv-box","small"],["viewBox","0 0 60 20","width","60","height","20"],["points","0,10 10,4 20,10 10,16","fill","none","stroke","#d18616","stroke-width","2"],["x1","20","y1","10","x2","60","y2","10","stroke","#d18616","stroke-width","2"],[1,"diagram-section"],[1,"pattern-group"],[1,"pattern-header",3,"click"],[1,"toggle-icon"],[1,"pattern-label"],[1,"legend-section"],[1,"legend-grid"],[1,"legend-item"],[1,"legend-line","solid"],[1,"legend-arrow"],[1,"legend-line","dashed"],[1,"page-nav"],["routerLink","/use-case",1,"nav-link"],["routerLink","/collaboration",1,"nav-link"],[1,"diagram-container"],[3,"definition"],[1,"pattern-note"]],template:function(r,a){r&1&&(n(0,"div",0)(1,"h2",1),e(2,"\u{1F3D7}\uFE0F Class Diagram \u2014 \u985E\u5225\u5716"),t(),n(3,"section",2)(4,"h3",3),e(5,"\u{1F4D6} \u4EC0\u9EBC\u662F Class Diagram\uFF1F"),t(),n(6,"div",4)(7,"p"),e(8," Class Diagram\uFF08\u985E\u5225\u5716\uFF09\u662F UML \u4E2D\u6700\u6838\u5FC3\u7684\u7D50\u69CB\u5716\uFF0C\u7528\u4F86\u8868\u9054\u7CFB\u7D71\u4E2D"),n(9,"strong"),e(10,"\u985E\u5225\u7684\u7D50\u69CB"),t(),e(11," \u8207"),n(12,"strong"),e(13,"\u985E\u5225\u4E4B\u9593\u7684\u95DC\u4FC2"),t(),e(14,"\u3002\u5B83\u662F\u5F9E Use Case \u5230\u5BE6\u969B\u7A0B\u5F0F\u78BC\u7684\u6A4B\u6A11\u3002 "),t(),n(15,"ul")(16,"li"),e(17,"\u2705 \u7406\u89E3\u7CFB\u7D71\u7684\u7D50\u69CB\uFF1A\u76F4\u89C0\u5C55\u793A\u985E\u5225\u7D50\u69CB\uFF0C\u5E6B\u52A9\u958B\u767C\u4EBA\u54E1\u7406\u89E3\u6574\u9AD4\u8A2D\u8A08"),t(),n(18,"li"),e(19,"\u2705 \u8B58\u5225\u6F5B\u5728\u7684\u554F\u984C\uFF1A\u985E\u5225\u4E4B\u9593\u7684\u8026\u5408\u5EA6\u3001\u8A2D\u8A08\u5408\u7406\u6027"),t(),n(20,"li"),e(21,"\u2705 \u751F\u6210\u7A0B\u5F0F\u78BC\uFF1A\u4E00\u4E9B\u958B\u767C\u5DE5\u5177\u53EF\u6839\u64DA\u985E\u5225\u5716\u81EA\u52D5\u751F\u6210\u7A0B\u5F0F\u78BC"),t()()()(),n(22,"section",5)(23,"h3",3),e(24,"\u{1F9F1} \u985E\u5225\u5716\u5143\u7D20"),t(),n(25,"div",6)(26,"div",7)(27,"div",8)(28,"div",9),e(29,"ClassName"),t(),n(30,"div",10),e(31,"- attribute: Type"),t(),n(32,"div",10),e(33,"+ method(): ReturnType"),t()(),n(34,"strong"),e(35,"\u985E\u5225 (Class)"),t(),n(36,"p"),e(37,"\u4E09\u683C\u77E9\u5F62\uFF1A\u540D\u7A31\u3001\u5C6C\u6027\u3001\u65B9\u6CD5"),t()(),n(38,"div",7)(39,"div",11)(40,"div",12),e(41,"Parent"),t(),C(),n(42,"svg",13),d(43,"line",14)(44,"polygon",15),t(),S(),n(45,"div",12),e(46,"Child"),t()(),n(47,"strong"),e(48,"\u7E7C\u627F (Inheritance)"),t(),n(49,"p"),e(50,"\u5BE6\u7DDA + \u7A7A\u5FC3\u4E09\u89D2\u5F62"),t()(),n(51,"div",7)(52,"div",11)(53,"div",16),e(54,"Interface"),t(),C(),n(55,"svg",13),d(56,"line",17)(57,"polygon",18),t(),S(),n(58,"div",12),e(59,"Impl"),t()(),n(60,"strong"),e(61,"\u5BE6\u73FE (Implementation)"),t(),n(62,"p"),e(63,"\u865B\u7DDA + \u7A7A\u5FC3\u4E09\u89D2\u5F62"),t()(),n(64,"div",7)(65,"div",19)(66,"div",20),e(67,"Whole"),t(),C(),n(68,"svg",21),d(69,"polygon",22)(70,"line",23),t(),S(),n(71,"div",20),e(72,"Part"),t()(),n(73,"strong"),e(74,"\u805A\u5408 (Aggregation)"),t(),n(75,"p"),e(76,"\u5BE6\u7DDA + \u7A7A\u5FC3\u83F1\u5F62"),t()()()(),n(77,"section",24)(78,"h3",3),e(79,"\u{1F4CA} \u96F2\u7AEF\u6A94\u6848\u7BA1\u7406\u7CFB\u7D71 \u2014 Class Diagram"),t(),n(80,"div",25)(81,"div",26),c("click",function(){return a.toggleGroup("composite")}),n(82,"span",27),e(83),t(),n(84,"span",28),e(85,"Composite Pattern \u2014 \u6A94\u6848\u7CFB\u7D71\u7D50\u69CB"),t()(),u(86,y,17,1),t(),n(87,"div",25)(88,"div",26),c("click",function(){return a.toggleGroup("visitor")}),n(89,"span",27),e(90),t(),n(91,"span",28),e(92,"Visitor Pattern \u2014 \u8A2A\u554F\u8005"),t()(),u(93,f,17,1),t(),n(94,"div",25)(95,"div",26),c("click",function(){return a.toggleGroup("command")}),n(96,"span",27),e(97),t(),n(98,"span",28),e(99,"Command Pattern \u2014 \u547D\u4EE4"),t()(),u(100,_,17,1),t(),n(101,"div",25)(102,"div",26),c("click",function(){return a.toggleGroup("strategy")}),n(103,"span",27),e(104),t(),n(105,"span",28),e(106,"Strategy Pattern \u2014 \u7B56\u7565"),t()(),u(107,B,14,1),t(),n(108,"div",25)(109,"div",26),c("click",function(){return a.toggleGroup("observer")}),n(110,"span",27),e(111),t(),n(112,"span",28),e(113,"Observer Pattern \u2014 \u89C0\u5BDF\u8005"),t()(),u(114,h,14,1),t()(),n(115,"section",29)(116,"h3",3),e(117,"\u{1F4D0} \u95DC\u4FC2\u5716\u4F8B"),t(),n(118,"div",30)(119,"div",31),d(120,"span",32),n(121,"span",33),e(122,"\u25B7"),t(),n(123,"span"),e(124,"\u95DC\u806F (Association)\uFF1A\u5169\u500B\u985E\u5225\u4E4B\u9593\u7684\u76F4\u63A5\u806F\u7E6B"),t()(),n(125,"div",31),d(126,"span",32),n(127,"span",33),e(128,"\u25C7"),t(),n(129,"span"),e(130,"\u805A\u5408 (Aggregation)\uFF1A\u6574\u9AD4/\u90E8\u5206\u95DC\u4FC2\uFF0C\u90E8\u5206\u53EF\u7368\u7ACB\u5B58\u5728"),t()(),n(131,"div",31),d(132,"span",32),n(133,"span",33),e(134,"\u25B3"),t(),n(135,"span"),e(136,"\u7E7C\u627F (Inheritance)\uFF1A\u5B50\u985E\u5225\u7E7C\u627F\u7236\u985E\u5225"),t()(),n(137,"div",31),d(138,"span",34),n(139,"span",33),e(140,"\u25B3"),t(),n(141,"span"),e(142,"\u5BE6\u73FE (Implementation)\uFF1A\u985E\u5225\u5BE6\u4F5C\u4ECB\u9762"),t()()()(),n(143,"div",35)(144,"a",36),e(145,"\u2190 Use Case Diagram"),t(),n(146,"a",37),e(147,"\u4E0B\u4E00\u6B65\uFF1ACollaboration Diagram \u2192"),t()()()),r&2&&(o(83),g(a.expandedGroup()==="composite"?"\u25BC":"\u25B6"),o(3),m(a.expandedGroup()==="composite"?86:-1),o(4),g(a.expandedGroup()==="visitor"?"\u25BC":"\u25B6"),o(3),m(a.expandedGroup()==="visitor"?93:-1),o(4),g(a.expandedGroup()==="command"?"\u25BC":"\u25B6"),o(3),m(a.expandedGroup()==="command"?100:-1),o(4),g(a.expandedGroup()==="strategy"?"\u25BC":"\u25B6"),o(3),m(a.expandedGroup()==="strategy"?107:-1),o(4),g(a.expandedGroup()==="observer"?"\u25BC":"\u25B6"),o(3),m(a.expandedGroup()==="observer"?114:-1))},dependencies:[F,D],styles:["[_nghost-%COMP%]{display:block}.element-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-bottom:20px}.element-card[_ngcontent-%COMP%]{background:#1e1e1e;border:1px solid #333;border-radius:8px;padding:16px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}.element-card[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%]{color:#4ec9b0;font-size:.85rem}.element-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0;color:#999;font-size:.8rem}.mini-class-box[_ngcontent-%COMP%]{border:2px solid #4ec9b0;border-radius:4px;font-size:.7rem;min-width:140px;overflow:hidden}.mini-class-box[_ngcontent-%COMP%]   .mcb-name[_ngcontent-%COMP%]{background:#0e639c;color:#fff;padding:4px 8px;text-align:center;font-weight:700}.mini-class-box[_ngcontent-%COMP%]   .mcb-section[_ngcontent-%COMP%]{padding:3px 8px;color:#ccc;border-top:1px solid #4ec9b0}.relation-visual[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;gap:2px}.relation-visual.horizontal[_ngcontent-%COMP%]{flex-direction:row;gap:4px}.rv-box[_ngcontent-%COMP%]{border:1px solid #4ec9b0;padding:3px 10px;font-size:.7rem;color:#e0e0e0;border-radius:3px}.rv-box.dashed[_ngcontent-%COMP%]{border-style:dashed;border-color:#0e639c}.rv-box.small[_ngcontent-%COMP%]{padding:2px 6px;font-size:.65rem}.pattern-group[_ngcontent-%COMP%]{background:#1a1a2e;border:1px solid #333;border-radius:8px;margin-bottom:16px;overflow:hidden}.pattern-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:10px;padding:14px 20px;cursor:pointer;transition:.2s}.pattern-header[_ngcontent-%COMP%]:hover{background:#22223a}.toggle-icon[_ngcontent-%COMP%]{color:#0e639c;font-size:.8rem;width:16px}.pattern-label[_ngcontent-%COMP%]{color:#dcdcaa;font-weight:700;font-size:1rem}.class-diagram-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;padding:16px 20px}.class-box[_ngcontent-%COMP%]{border:2px solid #4ec9b0;border-radius:6px;overflow:hidden;background:#1e1e1e}.class-box.abstract[_ngcontent-%COMP%]{border-color:#dcdcaa}.class-box.interface[_ngcontent-%COMP%]{border-style:dashed;border-color:#0e639c}.class-box.leaf[_ngcontent-%COMP%]{border-color:#569cd6}.class-box.invoker[_ngcontent-%COMP%]{border-color:#c586c0}.cb-stereotype[_ngcontent-%COMP%]{text-align:center;padding:4px 8px 0;color:#999;font-size:.7rem;font-style:italic}.cb-name[_ngcontent-%COMP%]{text-align:center;padding:6px 8px;color:#fff;font-weight:700;font-size:.9rem;background:#ffffff0d;border-bottom:1px solid #333}.cb-section[_ngcontent-%COMP%]{padding:6px 10px;border-bottom:1px solid #2a2a2a;min-height:16px}.cb-section[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]{font-size:.75rem;color:#ccc;padding:1px 0;font-family:Consolas,monospace}.cb-section.attrs[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]{color:#9cdcfe}.cb-section.methods[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]{color:#dcdcaa}.cb-relation[_ngcontent-%COMP%]{padding:4px 10px;font-size:.7rem;color:#888;background:#ffffff08;text-align:center}.pattern-note[_ngcontent-%COMP%]{padding:12px 20px 16px;border-top:1px solid #2a2a2a;font-size:.8rem;color:#bbb;line-height:1.8}.pattern-note[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{background:#2d2d2d;padding:1px 5px;border-radius:3px;color:#4ec9b0;font-size:.75rem}.legend-section[_ngcontent-%COMP%]{margin-top:20px}.legend-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}.legend-item[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;padding:10px 16px;background:#1e1e1e;border:1px solid #333;border-radius:6px;font-size:.8rem;color:#ccc}.legend-line[_ngcontent-%COMP%]{width:30px;height:0}.legend-line.solid[_ngcontent-%COMP%]{border-top:2px solid #888}.legend-line.dashed[_ngcontent-%COMP%]{border-top:2px dashed #888}.legend-arrow[_ngcontent-%COMP%]{color:#4ec9b0;font-size:.9rem}"],changeDetection:0})};export{b as ClassDiagramComponent};
