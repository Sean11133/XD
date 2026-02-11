import{a as m}from"./chunk-IYBEICGX.js";import"./chunk-LCWNOMSF.js";import"./chunk-KSGKTOM2.js";import{c as d}from"./chunk-O7XV3ZTY.js";import{Oa as l,Pa as t,Qa as n,Ra as o,gb as e,oa as r,za as a}from"./chunk-LELRBKKG.js";import"./chunk-BIHNL7XX.js";import"./chunk-6UGSP7QS.js";import"./chunk-2MWJVX7U.js";import"./chunk-VCYFVC25.js";import"./chunk-FD6FUJSP.js";import"./chunk-245NPPT3.js";import"./chunk-TDR26EUI.js";import"./chunk-W5E2OJKN.js";import"./chunk-BUPRJBLB.js";import"./chunk-HN3TUAMP.js";import"./chunk-AAZ3XMAW.js";import"./chunk-47NYRCQV.js";import"./chunk-SUN732H5.js";import"./chunk-OOCD4CDJ.js";import"./chunk-6PMQQMX7.js";var c=class i{architectureDiagram=`
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
    Components["\u{1F4E6} Components
App / Demo"]
    Services["\u{1F6E0}\uFE0F Services
FileSystem / Search"]
    Models["\u{1F4D0} Models
Composite Tree"]
    Commands["\u2328\uFE0F Commands
Sort / Delete / Tag"]
    Strategies["\u{1F500} Strategies
Sort By *"]
    Observers["\u{1F441}\uFE0F Observers
RxJS"]
    Visitors["\u{1F6B6} Visitors"]
    Router["\u{1F6E4}\uFE0F Angular Router
Lazy Loading"]
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

  Browser --> Components
  DOM --> Services
  Services -.-> API
  Models -.-> DB
`;static \u0275fac=function(u){return new(u||i)};static \u0275cmp=a({type:i,selectors:[["app-architecture"]],decls:148,vars:1,consts:[[1,"page"],[1,"page-title"],[1,"concept-section"],[1,"section-title"],[1,"info-card"],[1,"diagram-section"],[1,"diagram-container"],[3,"definition"],[1,"arch-details"],[1,"layer-grid"],[1,"layer-card","client"],[1,"tech-tags"],[1,"tech-tag"],[1,"layer-card","app"],[1,"layer-card","backend"],[1,"tech-tag","dimmed"],[1,"patterns-in-arch"],[1,"arch-table"],[1,"pattern-badge"],[1,"page-nav"],["routerLink","/sequence",1,"nav-link"],["routerLink","/demo",1,"nav-link"]],template:function(u,p){u&1&&(t(0,"div",0)(1,"h2",1),e(2,"\u{1F5A5}\uFE0F System Architecture \u2014 \u7CFB\u7D71\u67B6\u69CB\u5716"),n(),t(3,"section",2)(4,"h3",3),e(5,"\u{1F4D6} \u4EC0\u9EBC\u662F System Architecture Diagram\uFF1F"),n(),t(6,"div",4)(7,"p"),e(8," System Architecture Diagram\uFF08\u7CFB\u7D71\u67B6\u69CB\u5716\uFF09\u662F\u4E00\u5F35\u9CE5\u77B0\u5168\u5C40\u7684\u5716\uFF0C\u5C55\u793A\u7CFB\u7D71\u4E2D\u7684 "),t(9,"strong"),e(10,"Client\u3001Server\u3001Database\u3001Network Node"),n(),e(11," \u7B49\u91CD\u8981\u57FA\u790E\u8A2D\u65BD\u8207\u7DB2\u8DEF\u95DC\u4FC2\uFF0C \u8B93\u6240\u6709\u4EBA\u4E00\u89BD\u6574\u500B\u7CFB\u7D71\u7684\u904B\u4F5C\u65B9\u5F0F\u3002 "),n(),t(12,"ul")(13,"li"),e(14,"\u2705 \u5C55\u793A\u7CFB\u7D71\u7684\u90E8\u7F72\u67B6\u69CB\u8207\u62D3\u64B2"),n(),t(15,"li"),e(16,"\u2705 \u8AAA\u660E Client/Server \u4E4B\u9593\u7684\u901A\u8A0A\u65B9\u5F0F"),n(),t(17,"li"),e(18,"\u2705 \u6A19\u793A\u91CD\u8981\u7684\u6280\u8853\u9078\u578B\uFF08\u6846\u67B6\u3001\u8CC7\u6599\u5EAB\u3001\u5354\u5B9A\u7B49\uFF09"),n(),t(19,"li"),e(20,"\u2705 \u63D0\u4F9B\u958B\u767C\u5718\u968A\u8207\u71DF\u904B\u5718\u968A\u5171\u540C\u7684\u6E9D\u901A\u57FA\u790E"),n()()()(),t(21,"section",5)(22,"h3",3),e(23,"\u{1F4CA} \u96F2\u7AEF\u6A94\u6848\u7BA1\u7406\u7CFB\u7D71 \u2014 System Architecture"),n(),t(24,"div",6),o(25,"app-mermaid-diagram",7),n()(),t(26,"section",8)(27,"h3",3),e(28,"\u{1F4DD} \u67B6\u69CB\u5206\u5C64\u8AAA\u660E"),n(),t(29,"div",9)(30,"div",10)(31,"h4"),e(32,"\u{1F4F1} Client Layer"),n(),t(33,"p"),e(34," \u4F7F\u7528\u8005\u901A\u904E\u700F\u89BD\u5668\u5B58\u53D6\u7CFB\u7D71\u3002Angular \u7DE8\u8B6F\u5F8C\u7684 SPA \u5728\u700F\u89BD\u5668\u4E2D\u57F7\u884C\uFF0C \u6240\u6709 UI \u4E92\u52D5\uFF08\u9EDE\u64CA\u3001\u8F38\u5165\uFF09\u900F\u904E Angular \u7684\u4E8B\u4EF6\u7D81\u5B9A\u8655\u7406\u3002 "),n(),t(35,"div",11)(36,"span",12),e(37,"HTML5"),n(),t(38,"span",12),e(39,"CSS/SCSS"),n(),t(40,"span",12),e(41,"TypeScript"),n()()(),t(42,"div",13)(43,"h4"),e(44,"\u2699\uFE0F Application Layer"),n(),t(45,"p"),e(46," Angular SPA \u7684\u6838\u5FC3\u5C64\u3002\u63A1\u7528"),t(47,"strong"),e(48,"\u5143\u4EF6\u5316\u67B6\u69CB"),n(),e(49,"\uFF0C\u696D\u52D9\u908F\u8F2F\u5C01\u88DD\u65BC Service \u4E2D\uFF0C \u900F\u904E DI \u6CE8\u5165\u3002Models \u5B9A\u7FA9\u8CC7\u6599\u7D50\u69CB\uFF08Composite Pattern\uFF09\uFF0CCommands / Strategies / Visitors / Observers \u5C01\u88DD\u5404\u7A2E\u8A2D\u8A08\u6A21\u5F0F\u7684\u5BE6\u4F5C\u3002 "),n(),t(50,"div",11)(51,"span",12),e(52,"Angular 21"),n(),t(53,"span",12),e(54,"Signals"),n(),t(55,"span",12),e(56,"RxJS"),n(),t(57,"span",12),e(58,"Router"),n()()(),t(59,"div",14)(60,"h4"),e(61,"\u2601\uFE0F Backend / Infrastructure"),n(),t(62,"p"),e(63," \u76EE\u524D\u7CFB\u7D71\u70BA\u7D14\u524D\u7AEF SPA\uFF0C\u8CC7\u6599\u5167\u5EFA\u65BC Service \u4E2D\u3002\u672A\u4F86\u53EF\u64F4\u5C55\u70BA\u5177\u6709 REST API \u7684\u5168\u7AEF\u67B6\u69CB\uFF0C \u642D\u914D\u8CC7\u6599\u5EAB\u6301\u4E45\u5316\u6A94\u6848\u7D50\u69CB\u3001\u96F2\u7AEF\u6A94\u6848\u5132\u5B58\u8207\u8EAB\u4EFD\u9A57\u8B49\u3002 "),n(),t(64,"div",11)(65,"span",15),e(66,"REST API"),n(),t(67,"span",15),e(68,"Database"),n(),t(69,"span",15),e(70,"Cloud Storage"),n(),t(71,"span",15),e(72,"Auth"),n()()()()(),t(73,"section",16)(74,"h3",3),e(75,"\u{1F9E9} \u8A2D\u8A08\u6A21\u5F0F\u5728\u67B6\u69CB\u4E2D\u7684\u4F4D\u7F6E"),n(),t(76,"div",4)(77,"table",17)(78,"thead")(79,"tr")(80,"th"),e(81,"\u67B6\u69CB\u5C64"),n(),t(82,"th"),e(83,"\u8A2D\u8A08\u6A21\u5F0F"),n(),t(84,"th"),e(85,"\u5BE6\u4F5C\u4F4D\u7F6E"),n()()(),t(86,"tbody")(87,"tr")(88,"td"),e(89,"Models"),n(),t(90,"td")(91,"span",18),e(92,"Composite"),n()(),t(93,"td"),e(94,"FileSystemNode / Directory / FileNode"),n()(),t(95,"tr")(96,"td"),e(97,"Models"),n(),t(98,"td")(99,"span",18),e(100,"Visitor"),n()(),t(101,"td"),e(102,"IVisitor / accept() \u2014 Double Dispatch"),n()(),t(103,"tr")(104,"td"),e(105,"Visitors"),n(),t(106,"td")(107,"span",18),e(108,"Visitor"),n()(),t(109,"td"),e(110,"XmlExportVisitor / ExtensionSearchVisitor"),n()(),t(111,"tr")(112,"td"),e(113,"Commands"),n(),t(114,"td")(115,"span",18),e(116,"Command"),n()(),t(117,"td"),e(118,"ICommand / CommandHistory / SortCommand ..."),n()(),t(119,"tr")(120,"td"),e(121,"Strategies"),n(),t(122,"td")(123,"span",18),e(124,"Strategy"),n()(),t(125,"td"),e(126,"ISortStrategy / SortByName... SortByTag..."),n()(),t(127,"tr")(128,"td"),e(129,"Observers"),n(),t(130,"td")(131,"span",18),e(132,"Observer"),n()(),t(133,"td"),e(134,"SearchSubjectService / RxJS Subject"),n()(),t(135,"tr")(136,"td"),e(137,"Component"),n(),t(138,"td")(139,"span",18),e(140,"Observer"),n()(),t(141,"td"),e(142,"AppComponent subscribe \u2192 onSearchEvent()"),n()()()()()(),t(143,"div",19)(144,"a",20),e(145,"\u2190 Sequence Diagram"),n(),t(146,"a",21),e(147,"\u524D\u5F80 Live Demo \u2192"),n()()()),u&2&&(r(25),l("definition",p.architectureDiagram))},dependencies:[d,m],styles:["[_nghost-%COMP%]{display:block}.diagram-container[_ngcontent-%COMP%]{background:#0d1117;border:1px solid #333;border-radius:8px;padding:20px;overflow-x:auto;margin-bottom:20px}.uml-svg[_ngcontent-%COMP%]{width:100%;max-width:800px;height:auto;display:block;margin:0 auto}.layer-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:20px}.layer-card[_ngcontent-%COMP%]{background:#1e1e1e;border-radius:8px;padding:20px;border-left:4px solid #333}.layer-card[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%]{margin:0 0 10px;color:#fff;font-size:1rem}.layer-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:#bbb;font-size:.85rem;line-height:1.7;margin:0 0 12px}.layer-card.client[_ngcontent-%COMP%]{border-left-color:#0e639c}.layer-card.app[_ngcontent-%COMP%]{border-left-color:#4ec9b0}.layer-card.backend[_ngcontent-%COMP%]{border-left-color:#d18616}.tech-tags[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:6px}.tech-tag[_ngcontent-%COMP%]{background:#2d2d2d;color:#4ec9b0;padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:700}.tech-tag.dimmed[_ngcontent-%COMP%]{color:#666;border:1px dashed #444;background:transparent}.arch-table[_ngcontent-%COMP%]{width:100%;border-collapse:collapse;font-size:.85rem}.arch-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], .arch-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{padding:10px 14px;text-align:left;border-bottom:1px solid #2a2a2a}.arch-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{color:#dcdcaa;background:#252526;font-weight:700}.arch-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]{color:#ccc}.arch-table[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover   td[_ngcontent-%COMP%]{background:#0e639c1a}.pattern-badge[_ngcontent-%COMP%]{background:#1a3a2a;color:#4ec9b0;padding:2px 8px;border-radius:4px;font-size:.75rem;font-weight:700}"],changeDetection:0})};export{c as ArchitectureComponent};
