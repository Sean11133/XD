import{a as s}from"./chunk-IYBEICGX.js";import"./chunk-LCWNOMSF.js";import"./chunk-KSGKTOM2.js";import{c as p}from"./chunk-O7XV3ZTY.js";import{Oa as l,Pa as e,Qa as t,Ra as n,S as a,T as r,gb as i,oa as o,za as c}from"./chunk-LELRBKKG.js";import"./chunk-BIHNL7XX.js";import"./chunk-6UGSP7QS.js";import"./chunk-2MWJVX7U.js";import"./chunk-VCYFVC25.js";import"./chunk-FD6FUJSP.js";import"./chunk-245NPPT3.js";import"./chunk-TDR26EUI.js";import"./chunk-W5E2OJKN.js";import"./chunk-BUPRJBLB.js";import"./chunk-HN3TUAMP.js";import"./chunk-AAZ3XMAW.js";import"./chunk-47NYRCQV.js";import"./chunk-SUN732H5.js";import"./chunk-OOCD4CDJ.js";import"./chunk-6PMQQMX7.js";var F=class m{searchSequence=`
sequenceDiagram
  participant App as :AppComponent
  participant FS as :FileSystemService
  participant V as :ExtSearchVisitor
  participant Dir as :Directory
  participant Sub as :SearchSubject

  App->>FS: 1: searchByExtension(root, ".docx")
  FS->>V: 2: <<create>> new(ext, subject)
  FS->>Dir: 3: root.accept(visitor)
  Dir->>V: 4: visitDirectory(this)
  V->>Sub: 5: notify({type:'visiting', node:dir})
  loop each child
    Dir->>Dir: 6: child.accept(visitor)
  end
  V->>Sub: 7: notify({type:'visiting', node:file})
  V->>Sub: 8: notify({type:'matched', node:file}) \u2705
  FS->>Sub: 9: notify({type:'complete'})
  Sub-->>App: 10: [Observer] onSearchEvent \u2014 \u66F4\u65B0 UI
  FS-->>App: return results[]
`;sortUndoSequence=`
sequenceDiagram
  participant App as :AppComponent
  participant Cmd as :SortCommand
  participant Hist as :CommandHistory
  participant Strat as :SortByNameStrategy

  rect rgba(30, 80, 50, 0.3)
    Note over App,Strat: \u25B6 Execute Phase
    App->>Cmd: 1: new SortCommand(root, strategy)
    App->>Hist: 2: executeCommand(cmd)
    Hist->>Cmd: 3: cmd.execute()
    Cmd->>Strat: 4: strategy.sort(children)
    Strat-->>Cmd: return sortedNodes[]
  end

  rect rgba(80, 50, 20, 0.3)
    Note over App,Strat: \u21A9\uFE0F Undo Phase
    App->>Hist: 5: history.undo()
    Hist->>Cmd: 6: cmd.undo()
    Note over Cmd: 7: restore previousOrders
  end
`;static \u0275fac=function(u){return new(u||m)};static \u0275cmp=c({type:m,selectors:[["app-sequence"]],decls:95,vars:2,consts:[[1,"page"],[1,"page-title"],[1,"concept-section"],[1,"section-title"],[1,"info-card"],[1,"tip-box"],[1,"elements-section"],[1,"element-grid"],[1,"element-card"],[1,"element-visual"],[1,"lifeline-demo"],[1,"ll-box"],[1,"ll-line"],["viewBox","0 0 80 30","width","80","height","30"],["x1","0","y1","15","x2","60","y2","15","stroke","#4ec9b0","stroke-width","2"],["points","60,10 72,15 60,20","fill","#4ec9b0"],["x1","60","y1","15","x2","0","y2","15","stroke","#888","stroke-width","1.5","stroke-dasharray","5,3"],["points","0,11 -8,15 0,19","fill","#888"],[1,"activation-demo"],[1,"act-bar"],[1,"diagram-section"],[1,"diagram-container"],[3,"definition"],[1,"page-nav"],["routerLink","/collaboration",1,"nav-link"],["routerLink","/architecture",1,"nav-link"]],template:function(u,d){u&1&&(e(0,"div",0)(1,"h2",1),i(2,"\u23F1\uFE0F Sequence Diagram \u2014 \u5FAA\u5E8F\u5716"),t(),e(3,"section",2)(4,"h3",3),i(5,"\u{1F4D6} \u4EC0\u9EBC\u662F Sequence Diagram\uFF1F"),t(),e(6,"div",4)(7,"p"),i(8," Sequence Diagram\uFF08\u5FAA\u5E8F\u5716\uFF09\u5F37\u8ABF"),e(9,"strong"),i(10,"\u6642\u9593\u9806\u5E8F"),t(),i(11,"\u4F86\u6C7A\u5B9A\u7269\u4EF6\u7684\u4E92\u52D5\u95DC\u4FC2\u3002 \u4EE5\u4EFB\u52D9\u51FA\u767C\uFF0C\u5728\u9054\u6210\u4EFB\u52D9\u7684"),e(12,"strong"),i(13,"\u6642\u9593\u8EF8"),t(),i(14,"\u4E2D\uFF0C\u5448\u73FE\u6240\u6709\u6703\u7528\u5230\u7684\u7269\u4EF6\u8207\u5B83\u5011\u4E4B\u9593\u7684\u4E92\u52D5\u3002 "),t(),e(15,"ul")(16,"li"),i(17,"\u2705 "),e(18,"strong"),i(19,"\u5782\u76F4\u8EF8"),t(),i(20,"\u8868\u793A\u6642\u9593\uFF08\u7531\u4E0A\u5230\u4E0B\uFF09"),t(),e(21,"li"),i(22,"\u2705 "),e(23,"strong"),i(24,"\u6C34\u5E73\u8EF8"),t(),i(25,"\u8868\u793A\u4E0D\u540C\u7684\u7269\u4EF6\uFF08Lifeline\uFF09"),t(),e(26,"li"),i(27,"\u2705 "),e(28,"strong"),i(29,"\u7BAD\u982D"),t(),i(30,"\u8868\u793A\u8A0A\u606F\u50B3\u905E\uFF08\u540C\u6B65\u3001\u975E\u540C\u6B65\u3001\u56DE\u50B3\uFF09"),t(),e(31,"li"),i(32,"\u2705 "),e(33,"strong"),i(34,"\u555F\u52D5\u689D"),t(),i(35,"\uFF08Activation Bar\uFF09\u8868\u793A\u7269\u4EF6\u6B63\u5728\u8655\u7406\u67D0\u500B\u4EFB\u52D9"),t()(),e(36,"div",5)(37,"strong"),i(38,"\u{1F4A1} \u8207 Collaboration Diagram \u7684\u5DEE\u7570\uFF1A"),t(),i(39," Sequence Diagram \u4EE5\u6642\u9593\u8EF8\u70BA\u4E3B\u8EF8\uFF0C\u9069\u5408\u5448\u73FE\u5B8C\u6574\u6D41\u7A0B\uFF1B Collaboration Diagram \u4EE5\u7269\u4EF6\u95DC\u806F\u70BA\u4E3B\u8EF8\uFF0C\u9069\u5408\u5448\u73FE\u7D50\u69CB\u95DC\u4FC2\u3002 "),t()()(),e(40,"section",6)(41,"h3",3),i(42,"\u{1F9F1} \u6838\u5FC3\u5143\u7D20"),t(),e(43,"div",7)(44,"div",8)(45,"div",9)(46,"div",10)(47,"div",11),i(48,"Object"),t(),n(49,"div",12),t()(),e(50,"strong"),i(51,"Lifeline\uFF08\u751F\u547D\u7DDA\uFF09"),t(),e(52,"p"),i(53,"\u7269\u4EF6\u7684\u5B58\u5728\u6642\u9593\uFF0C\u7528\u865B\u7DDA\u5411\u4E0B\u5EF6\u4F38"),t()(),e(54,"div",8)(55,"div",9),a(),e(56,"svg",13),n(57,"line",14)(58,"polygon",15),t()(),r(),e(59,"strong"),i(60,"\u540C\u6B65\u8A0A\u606F"),t(),e(61,"p"),i(62,"\u5BE6\u5FC3\u7BAD\u982D\uFF0C\u547C\u53EB\u65B9\u7B49\u5F85\u56DE\u50B3"),t()(),e(63,"div",8)(64,"div",9),a(),e(65,"svg",13),n(66,"line",16)(67,"polygon",17),t()(),r(),e(68,"strong"),i(69,"\u56DE\u50B3\u8A0A\u606F"),t(),e(70,"p"),i(71,"\u865B\u7DDA\u7BAD\u982D\uFF0C\u56DE\u50B3\u7D50\u679C"),t()(),e(72,"div",8)(73,"div",9)(74,"div",18),n(75,"div",19),t()(),e(76,"strong"),i(77,"Activation Bar"),t(),e(78,"p"),i(79,"\u555F\u52D5\u689D\uFF0C\u8868\u793A\u7269\u4EF6\u6B63\u5728\u57F7\u884C"),t()()()(),e(80,"section",20)(81,"h3",3),i(82,"\u{1F4CA} \u5834\u666F\uFF1A\u641C\u5C0B\u6A94\u6848\uFF08Search Files\uFF09"),t(),e(83,"div",21),n(84,"app-mermaid-diagram",22),t()(),e(85,"section",20)(86,"h3",3),i(87,"\u{1F4CA} \u5834\u666F\uFF1A\u6392\u5E8F\u6A94\u6848 + Undo\uFF08Command + Strategy\uFF09"),t(),e(88,"div",21),n(89,"app-mermaid-diagram",22),t()(),e(90,"div",23)(91,"a",24),i(92,"\u2190 Collaboration Diagram"),t(),e(93,"a",25),i(94,"\u4E0B\u4E00\u6B65\uFF1ASystem Architecture \u2192"),t()()()),u&2&&(o(84),l("definition",d.searchSequence),o(5),l("definition",d.sortUndoSequence))},dependencies:[p,s],styles:["[_nghost-%COMP%]{display:block}.element-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:16px;margin-bottom:20px}.element-card[_ngcontent-%COMP%]{background:#1e1e1e;border:1px solid #333;border-radius:8px;padding:16px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}.element-card[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%]{color:#4ec9b0;font-size:.85rem}.element-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0;color:#999;font-size:.8rem}.element-visual[_ngcontent-%COMP%]{display:flex;justify-content:center;align-items:center;min-height:50px}.lifeline-demo[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center}.ll-box[_ngcontent-%COMP%]{border:2px solid #0e639c;padding:4px 12px;font-size:.75rem;color:#e0e0e0;border-radius:3px;background:#1a2a3e}.ll-line[_ngcontent-%COMP%]{width:0;height:30px;border-left:2px dashed #555}.activation-demo[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px}.act-bar[_ngcontent-%COMP%]{width:10px;height:40px;background:#4ec9b0;opacity:.6;border-radius:2px}.diagram-container[_ngcontent-%COMP%]{background:#0d1117;border:1px solid #333;border-radius:8px;padding:20px;overflow-x:auto;margin-bottom:20px}.uml-svg[_ngcontent-%COMP%]{width:100%;max-width:900px;height:auto;display:block;margin:0 auto}"],changeDetection:0})};export{F as SequenceComponent};
