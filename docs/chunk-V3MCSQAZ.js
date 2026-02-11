import{a as s}from"./chunk-7YRLFW2U.js";import"./chunk-LCWNOMSF.js";import"./chunk-KSGKTOM2.js";import{c as F}from"./chunk-O7XV3ZTY.js";import{Oa as o,Pa as u,Qa as t,Ra as r,gb as e,oa as n,za as l}from"./chunk-LELRBKKG.js";import"./chunk-BIHNL7XX.js";import"./chunk-6UGSP7QS.js";import"./chunk-2MWJVX7U.js";import"./chunk-VCYFVC25.js";import"./chunk-FD6FUJSP.js";import"./chunk-245NPPT3.js";import"./chunk-TDR26EUI.js";import"./chunk-W5E2OJKN.js";import"./chunk-BUPRJBLB.js";import"./chunk-HN3TUAMP.js";import"./chunk-AAZ3XMAW.js";import"./chunk-47NYRCQV.js";import"./chunk-SUN732H5.js";import"./chunk-OOCD4CDJ.js";import"./chunk-6PMQQMX7.js";var c=class a{searchDiagram=`
graph LR
  app["app : AppComponent"]
  fsService["fsService : FileSystemService"]
  visitor["visitor : ExtensionSearchVisitor"]
  subject["subject : SearchSubjectService"]
  root["root : Directory"]
  file["file : WordFile"]

  app -->|"1: searchByExtension(root, ext)"| fsService
  fsService -->|"2: &lt;&lt;create&gt;&gt;"| visitor
  fsService -->|"3: root.accept(visitor)"| root
  root -->|"4: visitor.visitDirectory(this)"| visitor
  visitor -->|"5: subject.notify(visiting)"| subject
  root -->|"6: child.accept(visitor)"| file
  file -->|"7: visitor.visitWordFile(this)"| visitor
  visitor -->|"8: subject.notify(matched)"| subject
  subject -.->|"9: onSearchEvent [Observer \u56DE\u8ABF]"| app
`;sortDiagram=`
graph LR
  app["app : AppComponent"]
  cmd["cmd : SortCommand"]
  history["history : CommandHistory"]
  strategy["strategy : SortByNameStrategy"]
  root["root : Directory"]

  app -->|"1: &lt;&lt;create&gt;&gt;"| cmd
  app -->|"2: history.executeCommand(cmd)"| history
  history -->|"3: cmd.execute()"| cmd
  cmd -->|"4: strategy.sort(children)"| strategy
  cmd -->|"5: dir.children = sorted"| root
`;static \u0275fac=function(i){return new(i||a)};static \u0275cmp=l({type:a,selectors:[["app-collaboration"]],decls:68,vars:2,consts:[[1,"page"],[1,"page-title"],[1,"concept-section"],[1,"section-title"],[1,"info-card"],[1,"tip-box"],[1,"diagram-section"],[1,"diagram-container"],[3,"definition"],[1,"key-points"],[1,"page-nav"],["routerLink","/class-diagram",1,"nav-link"],["routerLink","/sequence",1,"nav-link"]],template:function(i,m){i&1&&(u(0,"div",0)(1,"h2",1),e(2,"\u{1F91D} Collaboration Diagram \u2014 \u5408\u4F5C\u5716"),t(),u(3,"section",2)(4,"h3",3),e(5,"\u{1F4D6} \u4EC0\u9EBC\u662F Collaboration Diagram\uFF1F"),t(),u(6,"div",4)(7,"p"),e(8," Collaboration Diagram\uFF08\u5408\u4F5C\u5716\uFF09\u53C8\u7A31 Communication Diagram\uFF0C\u7528\u4F86\u5C55\u73FE"),u(9,"strong"),e(10,"\u7269\u4EF6\u4E4B\u9593\u7684\u95DC\u806F"),t(),e(11,"\uFF0C \u4EE5\u67D0\u500B\u7269\u4EF6\u70BA\u51FA\u767C\u9EDE\uFF0C\u4E86\u89E3\u5B83\u8207\u5176\u4ED6\u7269\u4EF6\u9054\u6210\u4E00\u4EF6\u4EFB\u52D9\u7684\u904E\u7A0B\u3002 "),t(),u(12,"ul")(13,"li"),e(14,"\u2705 \u5F37\u8ABF\u7269\u4EF6\u4E4B\u9593\u7684"),u(15,"strong"),e(16,"\u7D50\u69CB\u95DC\u4FC2"),t(),e(17,"\uFF08\u8AB0\u8A8D\u8B58\u8AB0\uFF09"),t(),u(18,"li"),e(19,"\u2705 \u7528\u7DE8\u865F\u8868\u793A\u8A0A\u606F\u7684"),u(20,"strong"),e(21,"\u9806\u5E8F"),t()(),u(22,"li"),e(23,"\u2705 \u9069\u5408\u5448\u73FE\u67D0\u500B\u5834\u666F\u4E2D\u7269\u4EF6\u4E4B\u9593\u7684"),u(24,"strong"),e(25,"\u5354\u4F5C\u65B9\u5F0F"),t()()(),u(26,"div",5)(27,"strong"),e(28,"\u{1F4A1} \u8207 Sequence Diagram \u7684\u5DEE\u7570\uFF1A"),t(),e(29," Collaboration Diagram \u5F37\u8ABF\u7269\u4EF6\u4E4B\u9593\u7684\u9023\u7D50\u95DC\u4FC2\uFF0CSequence Diagram \u5F37\u8ABF\u6642\u9593\u9806\u5E8F\u3002 \u5169\u8005\u53EF\u4EE5\u4E92\u76F8\u8F49\u63DB\uFF0C\u8868\u9054\u76F8\u540C\u7684\u4E92\u52D5\u908F\u8F2F\u3002 "),t()()(),u(30,"section",6)(31,"h3",3),e(32,"\u{1F4CA} \u5834\u666F\uFF1A\u641C\u5C0B\u6A94\u6848\uFF08Visitor + Observer\uFF09"),t(),u(33,"div",7),r(34,"app-mermaid-diagram",8),t()(),u(35,"section",6)(36,"h3",3),e(37,"\u{1F4CA} \u5834\u666F\uFF1A\u6392\u5E8F\u6A94\u6848\uFF08Command + Strategy\uFF09"),t(),u(38,"div",7),r(39,"app-mermaid-diagram",8),t()(),u(40,"div",9)(41,"h3",3),e(42,"\u{1F4A1} \u5408\u4F5C\u5716\u7684\u95B1\u8B80\u91CD\u9EDE"),t(),u(43,"div",4)(44,"ol")(45,"li")(46,"strong"),e(47,"\u7269\u4EF6\u540D\u7A31\u683C\u5F0F\uFF1A"),t(),u(48,"code"),e(49,"instanceName : ClassName"),t(),e(50,"\uFF08\u5E95\u7DDA\u8868\u793A\u662F\u7269\u4EF6\u5BE6\u4F8B\uFF09 "),t(),u(51,"li")(52,"strong"),e(53,"\u7DE8\u865F\u9806\u5E8F\uFF1A"),t(),e(54,"\u6578\u5B57\u4EE3\u8868\u8A0A\u606F\u7684\u547C\u53EB\u9806\u5E8F\uFF0C\u53EF\u4EE5\u6709\u5DE2\u72C0\u7DE8\u865F\uFF08\u5982 3.1, 3.2\uFF09"),t(),u(55,"li")(56,"strong"),e(57,"\u9023\u7DDA\u610F\u7FA9\uFF1A"),t(),e(58,"\u5169\u500B\u7269\u4EF6\u4E4B\u9593\u6709\u9023\u7DDA\u4EE3\u8868\u5B83\u5011\u4E4B\u9593\u6709\u95DC\u806F\uFF08\u4E00\u65B9\u8A8D\u8B58\u53E6\u4E00\u65B9\uFF09"),t(),u(59,"li")(60,"strong"),e(61,"\u8A0A\u606F\u65B9\u5411\uFF1A"),t(),e(62,"\u7BAD\u982D\u65B9\u5411\u4EE3\u8868\u547C\u53EB\u65B9\u5411"),t()()()(),u(63,"div",10)(64,"a",11),e(65,"\u2190 Class Diagram"),t(),u(66,"a",12),e(67,"\u4E0B\u4E00\u6B65\uFF1ASequence Diagram \u2192"),t()()()),i&2&&(n(34),o("definition",m.searchDiagram),n(5),o("definition",m.sortDiagram))},dependencies:[F,s],styles:["[_nghost-%COMP%]{display:block}.diagram-container[_ngcontent-%COMP%]{background:#0d1117;border:1px solid #333;border-radius:8px;padding:20px;overflow-x:auto;margin-bottom:20px}.uml-svg[_ngcontent-%COMP%]{width:100%;max-width:800px;height:auto;display:block;margin:0 auto}.key-points[_ngcontent-%COMP%]{margin-bottom:20px}.key-points[_ngcontent-%COMP%]   ol[_ngcontent-%COMP%]{padding-left:20px;margin:0}.key-points[_ngcontent-%COMP%]   ol[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{padding:6px 0;color:#ccc;font-size:.9rem;line-height:1.6}.key-points[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{background:#2d2d2d;padding:1px 5px;border-radius:3px;color:#4ec9b0;font-size:.85rem}"],changeDetection:0})};export{c as CollaborationComponent};
