import{a as m}from"./chunk-7YRLFW2U.js";import"./chunk-LCWNOMSF.js";import"./chunk-KSGKTOM2.js";import{c as d}from"./chunk-O7XV3ZTY.js";import{Oa as l,Pa as t,Qa as n,Ra as o,gb as e,oa as a,za as r}from"./chunk-LELRBKKG.js";import"./chunk-BIHNL7XX.js";import"./chunk-6UGSP7QS.js";import"./chunk-2MWJVX7U.js";import"./chunk-VCYFVC25.js";import"./chunk-FD6FUJSP.js";import"./chunk-245NPPT3.js";import"./chunk-TDR26EUI.js";import"./chunk-W5E2OJKN.js";import"./chunk-BUPRJBLB.js";import"./chunk-HN3TUAMP.js";import"./chunk-AAZ3XMAW.js";import"./chunk-47NYRCQV.js";import"./chunk-SUN732H5.js";import"./chunk-OOCD4CDJ.js";import"./chunk-6PMQQMX7.js";var c=class i{architectureDiagram=`
graph TB
  subgraph Client["\u{1F4F1} Client Layer \u2014 Browser"]
    Browser["\u{1F310} Web Browser
Chrome / Edge / Safari"]
    DOM["\u{1F4CA} DOM / View
Angular Template"]
    SCSS["\u{1F3A8} SCSS Styles
Dark Theme UI"]
    Vitest["\u{1F9EA} Vitest
Unit Testing"]
  end

  subgraph App["\u2699\uFE0F Application Layer \u2014 Angular SPA"]
    direction TB
    Router["\u{1F6E4}\uFE0F Angular Router
Lazy Loading\uFF087 \u9801\uFF09"]

    subgraph Pages["\u{1F4C4} pages/ + shared/"]
      Views["\u{1F5A5}\uFE0F View Components
Home / UseCase / ClassDiagram
Collaboration / Sequence
Architecture / Demo"]
      Mermaid["\u{1F4CA} MermaidDiagram
\u5171\u4EAB\u5143\u4EF6"]
    end

    subgraph SvcLayer["\u2699\uFE0F services/\uFF08\u4F9D GoF \u4E09\u5927\u5206\u985E\uFF09"]
      SvcCreational["\u{1F3D7}\uFE0F creational/
\uFF08\u9810\u7559\uFF09"]
      SvcStructural["\u{1F9F1} structural/
FileSystemService"]
      SvcBehavioral["\u{1F3AD} behavioral/
CommandHistory
SearchSubjectService"]
    end

    subgraph ModelLayer["\u{1F4D0} models/\uFF08\u4F9D GoF \u4E09\u5927\u5206\u985E\uFF09"]
      MdlCreational["\u{1F3D7}\uFE0F creational/
\uFF08\u9810\u7559\uFF09"]
      MdlStructural["\u{1F9F1} structural/
FileSystemNode \xB7 Directory
WordFile \xB7 ImageFile \xB7 TextFile
TagType"]
      MdlBehavioral["\u{1F3AD} behavioral/
ICommand \xB7 Sort/Delete/TagCommand
ISortStrategy \xB7 SortByName...
IVisitor \xB7 XmlExport/SearchVisitor
SearchEvent"]
    end
  end

  subgraph Backend["\u2601\uFE0F Backend / Infrastructure \u2014 Future"]
    API["\u{1F310} REST API
Node.js / .NET"]
    DB["\u{1F5C3}\uFE0F Database
SQL / NoSQL"]
    Storage["\u{1F4C1} File Storage
S3 / Azure Blob"]
    Auth["\u{1F510} Auth Service
OAuth / JWT"]
  end

  Browser --> Router
  Router --> Views
  Views --> SvcStructural
  Views --> SvcBehavioral
  SvcStructural --> MdlStructural
  SvcStructural --> MdlBehavioral
  SvcBehavioral --> MdlBehavioral
  SvcStructural -.-> API
  MdlStructural -.-> DB
`;static \u0275fac=function(u){return new(u||i)};static \u0275cmp=r({type:i,selectors:[["app-architecture"]],decls:180,vars:1,consts:[[1,"page"],[1,"page-title"],[1,"concept-section"],[1,"section-title"],[1,"info-card"],[1,"diagram-section"],[1,"diagram-container"],[3,"definition"],[1,"arch-details"],[1,"layer-grid"],[1,"layer-card","client"],[1,"tech-tags"],[1,"tech-tag"],[1,"layer-card","app"],[1,"layer-card","backend"],[1,"tech-tag","dimmed"],[1,"patterns-in-arch"],[1,"arch-table"],[1,"pattern-badge"],[1,"page-nav"],["routerLink","/sequence",1,"nav-link"],["routerLink","/demo",1,"nav-link"]],template:function(u,S){u&1&&(t(0,"div",0)(1,"h2",1),e(2,"\u{1F5A5}\uFE0F System Architecture \u2014 \u7CFB\u7D71\u67B6\u69CB\u5716"),n(),t(3,"section",2)(4,"h3",3),e(5,"\u{1F4D6} \u4EC0\u9EBC\u662F System Architecture Diagram\uFF1F"),n(),t(6,"div",4)(7,"p"),e(8," System Architecture Diagram\uFF08\u7CFB\u7D71\u67B6\u69CB\u5716\uFF09\u662F\u4E00\u5F35\u9CE5\u77B0\u5168\u5C40\u7684\u5716\uFF0C\u5C55\u793A\u7CFB\u7D71\u4E2D\u7684 "),t(9,"strong"),e(10,"Client\u3001Server\u3001Database\u3001Network Node"),n(),e(11," \u7B49\u91CD\u8981\u57FA\u790E\u8A2D\u65BD\u8207\u7DB2\u8DEF\u95DC\u4FC2\uFF0C \u8B93\u6240\u6709\u4EBA\u4E00\u89BD\u6574\u500B\u7CFB\u7D71\u7684\u904B\u4F5C\u65B9\u5F0F\u3002 "),n(),t(12,"ul")(13,"li"),e(14,"\u2705 \u5C55\u793A\u7CFB\u7D71\u7684\u90E8\u7F72\u67B6\u69CB\u8207\u62D3\u64B2"),n(),t(15,"li"),e(16,"\u2705 \u8AAA\u660E Client/Server \u4E4B\u9593\u7684\u901A\u8A0A\u65B9\u5F0F"),n(),t(17,"li"),e(18,"\u2705 \u6A19\u793A\u91CD\u8981\u7684\u6280\u8853\u9078\u578B\uFF08\u6846\u67B6\u3001\u8CC7\u6599\u5EAB\u3001\u5354\u5B9A\u7B49\uFF09"),n(),t(19,"li"),e(20,"\u2705 \u63D0\u4F9B\u958B\u767C\u5718\u968A\u8207\u71DF\u904B\u5718\u968A\u5171\u540C\u7684\u6E9D\u901A\u57FA\u790E"),n()()()(),t(21,"section",5)(22,"h3",3),e(23,"\u{1F4CA} \u96F2\u7AEF\u6A94\u6848\u7BA1\u7406\u7CFB\u7D71 \u2014 System Architecture"),n(),t(24,"div",6),o(25,"app-mermaid-diagram",7),n()(),t(26,"section",8)(27,"h3",3),e(28,"\u{1F4DD} \u67B6\u69CB\u5206\u5C64\u8AAA\u660E"),n(),t(29,"div",9)(30,"div",10)(31,"h4"),e(32,"\u{1F4F1} Client Layer"),n(),t(33,"p"),e(34," \u4F7F\u7528\u8005\u901A\u904E\u700F\u89BD\u5668\u5B58\u53D6\u7CFB\u7D71\u3002Angular \u7DE8\u8B6F\u5F8C\u7684 SPA \u5728\u700F\u89BD\u5668\u4E2D\u57F7\u884C\uFF0C \u6240\u6709 UI \u4E92\u52D5\uFF08\u9EDE\u64CA\u3001\u8F38\u5165\uFF09\u900F\u904E Angular \u7684\u4E8B\u4EF6\u7D81\u5B9A\u8655\u7406\u3002 "),n(),t(35,"div",11)(36,"span",12),e(37,"HTML5"),n(),t(38,"span",12),e(39,"CSS/SCSS"),n(),t(40,"span",12),e(41,"TypeScript"),n()()(),t(42,"div",13)(43,"h4"),e(44,"\u2699\uFE0F Application Layer"),n(),t(45,"p"),e(46," Angular SPA \u7684\u6838\u5FC3\u5C64\u3002\u63A1\u7528 "),t(47,"strong"),e(48,"GoF \u4E09\u5927\u5206\u985E"),n(),e(49,"\uFF08Creational / Structural / Behavioral\uFF09 \u7D71\u4E00\u7D44\u7E54 "),t(50,"code"),e(51,"models/"),n(),e(52," \u8207 "),t(53,"code"),e(54,"services/"),n(),e(55,"\uFF1A \u7D50\u69CB\u578B\u653E\u7F6E Composite \u7BC0\u9EDE\u6A21\u578B\u8207\u6A94\u6848\u7CFB\u7D71\u670D\u52D9\uFF1B \u884C\u70BA\u578B\u653E\u7F6E Command\u3001Strategy\u3001Visitor\u3001Observer \u7684\u4ECB\u9762\u8207\u5BE6\u4F5C\uFF0C\u4EE5\u53CA CommandHistory\u3001SearchSubject \u670D\u52D9\u3002 \u6240\u6709\u9801\u9762\u5143\u4EF6\u900F\u904E Lazy Loading \u6309\u9700\u8F09\u5165\u3002 "),n(),t(56,"div",11)(57,"span",12),e(58,"Angular 21"),n(),t(59,"span",12),e(60,"Signals"),n(),t(61,"span",12),e(62,"RxJS"),n(),t(63,"span",12),e(64,"GoF \u4E09\u5927\u5206\u985E"),n(),t(65,"span",12),e(66,"Lazy Loading"),n()()(),t(67,"div",14)(68,"h4"),e(69,"\u2601\uFE0F Backend / Infrastructure"),n(),t(70,"p"),e(71," \u76EE\u524D\u7CFB\u7D71\u70BA\u7D14\u524D\u7AEF SPA\uFF0C\u8CC7\u6599\u5167\u5EFA\u65BC Service \u4E2D\u3002\u672A\u4F86\u53EF\u64F4\u5C55\u70BA\u5177\u6709 REST API \u7684\u5168\u7AEF\u67B6\u69CB\uFF0C \u642D\u914D\u8CC7\u6599\u5EAB\u6301\u4E45\u5316\u6A94\u6848\u7D50\u69CB\u3001\u96F2\u7AEF\u6A94\u6848\u5132\u5B58\u8207\u8EAB\u4EFD\u9A57\u8B49\u3002 "),n(),t(72,"div",11)(73,"span",15),e(74,"REST API"),n(),t(75,"span",15),e(76,"Database"),n(),t(77,"span",15),e(78,"Cloud Storage"),n(),t(79,"span",15),e(80,"Auth"),n()()()()(),t(81,"section",16)(82,"h3",3),e(83,"\u{1F9E9} \u8A2D\u8A08\u6A21\u5F0F\u5728\u67B6\u69CB\u4E2D\u7684\u4F4D\u7F6E"),n(),t(84,"div",4)(85,"table",17)(86,"thead")(87,"tr")(88,"th"),e(89,"\u6240\u5C6C\u8CC7\u6599\u593E"),n(),t(90,"th"),e(91,"\u8A2D\u8A08\u6A21\u5F0F"),n(),t(92,"th"),e(93,"\u5BE6\u4F5C\u985E\u5225 / \u4ECB\u9762"),n()()(),t(94,"tbody")(95,"tr")(96,"td"),e(97,"models/structural/"),n(),t(98,"td")(99,"span",18),e(100,"Composite"),n()(),t(101,"td"),e(102,"FileSystemNode / Directory / WordFile / ImageFile / TextFile"),n()(),t(103,"tr")(104,"td"),e(105,"models/behavioral/"),n(),t(106,"td")(107,"span",18),e(108,"Visitor"),n()(),t(109,"td"),e(110,"IVisitor\uFF08\u4ECB\u9762\uFF09/ accept() \u2014 Double Dispatch"),n()(),t(111,"tr")(112,"td"),e(113,"models/behavioral/"),n(),t(114,"td")(115,"span",18),e(116,"Visitor"),n()(),t(117,"td"),e(118,"XmlExportVisitor / ExtensionSearchVisitor"),n()(),t(119,"tr")(120,"td"),e(121,"models/behavioral/"),n(),t(122,"td")(123,"span",18),e(124,"Command"),n()(),t(125,"td"),e(126,"ICommand / SortCommand / DeleteCommand / TagCommand"),n()(),t(127,"tr")(128,"td"),e(129,"models/behavioral/"),n(),t(130,"td")(131,"span",18),e(132,"Strategy"),n()(),t(133,"td"),e(134,"ISortStrategy / SortByName / Size / Extension / Tag"),n()(),t(135,"tr")(136,"td"),e(137,"models/behavioral/"),n(),t(138,"td")(139,"span",18),e(140,"Observer"),n()(),t(141,"td"),e(142,"SearchEvent\uFF08\u4E8B\u4EF6\u8CC7\u6599\u6A21\u578B\uFF09"),n()(),t(143,"tr")(144,"td"),e(145,"services/structural/"),n(),t(146,"td")(147,"span",18),e(148,"Composite"),n()(),t(149,"td"),e(150,"FileSystemService \u2014 \u5EFA\u6A39\u3001\u8A08\u7B97\u3001\u532F\u51FA\u3001\u641C\u5C0B"),n()(),t(151,"tr")(152,"td"),e(153,"services/behavioral/"),n(),t(154,"td")(155,"span",18),e(156,"Command"),n()(),t(157,"td"),e(158,"CommandHistory \u2014 Invoker\uFF08Undo / Redo\uFF09"),n()(),t(159,"tr")(160,"td"),e(161,"services/behavioral/"),n(),t(162,"td")(163,"span",18),e(164,"Observer"),n()(),t(165,"td"),e(166,"SearchSubjectService \u2014 RxJS Subject"),n()(),t(167,"tr")(168,"td"),e(169,"pages/demo/"),n(),t(170,"td")(171,"span",18),e(172,"Observer"),n()(),t(173,"td"),e(174,"Demo Component \u2014 subscribe \u2192 onSearchEvent()"),n()()()()()(),t(175,"div",19)(176,"a",20),e(177,"\u2190 Sequence Diagram"),n(),t(178,"a",21),e(179,"\u524D\u5F80 Live Demo \u2192"),n()()()),u&2&&(a(25),l("definition",S.architectureDiagram))},dependencies:[d,m],styles:["[_nghost-%COMP%]{display:block}.diagram-container[_ngcontent-%COMP%]{background:#0d1117;border:1px solid #333;border-radius:8px;padding:20px;overflow-x:auto;margin-bottom:20px}.uml-svg[_ngcontent-%COMP%]{width:100%;max-width:800px;height:auto;display:block;margin:0 auto}.layer-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:20px}.layer-card[_ngcontent-%COMP%]{background:#1e1e1e;border-radius:8px;padding:20px;border-left:4px solid #333}.layer-card[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%]{margin:0 0 10px;color:#fff;font-size:1rem}.layer-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:#bbb;font-size:.85rem;line-height:1.7;margin:0 0 12px}.layer-card.client[_ngcontent-%COMP%]{border-left-color:#0e639c}.layer-card.app[_ngcontent-%COMP%]{border-left-color:#4ec9b0}.layer-card.backend[_ngcontent-%COMP%]{border-left-color:#d18616}.tech-tags[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px}.tech-tag[_ngcontent-%COMP%]{background:#2d2d2d;color:#4ec9b0;padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:700}.tech-tag.dimmed[_ngcontent-%COMP%]{color:#666;border:1px dashed #444;background:transparent}.arch-table[_ngcontent-%COMP%]{width:100%;border-collapse:collapse;font-size:.85rem}.arch-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], .arch-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{padding:10px 14px;text-align:left;border-bottom:1px solid #2a2a2a}.arch-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{color:#dcdcaa;background:#252526;font-weight:700}.arch-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{color:#ccc}.arch-table[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover   td[_ngcontent-%COMP%]{background:#0e639c1a}.pattern-badge[_ngcontent-%COMP%]{background:#1a3a2a;color:#4ec9b0;padding:2px 8px;border-radius:4px;font-size:.75rem;font-weight:700}"],changeDetection:0})};export{c as ArchitectureComponent};
