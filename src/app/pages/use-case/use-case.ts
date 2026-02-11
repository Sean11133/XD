import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MermaidDiagramComponent } from '../../shared/mermaid-diagram';

@Component({
  selector: 'app-use-case',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MermaidDiagramComponent],
  templateUrl: './use-case.html',
  styleUrl: './use-case.scss',
})
export class UseCaseComponent {
  readonly useCaseDiagram = `
graph LR
  subgraph System["雲端檔案管理系統 Cloud File Manager"]
    UC1([瀏覽檔案階層])
    UC2([搜尋檔案])
    UC3([顯示搜尋進度])
    UC4([排序檔案])
    UC5([選擇排序策略])
    UC6([刪除檔案])
    UC7([標記檔案])
    UC8([撤銷 / 重做])
    UC9([匯出 XML])
    UC10([計算總容量])
    UC11([即時通知觀察者])
  end

  User(("👤 使用者<br/>Primary"))
  Observer(("👁 Observer<br/>Secondary"))

  User --> UC1
  User --> UC2
  User --> UC4
  User --> UC6
  User --> UC7
  User --> UC9
  User --> UC10

  Observer --> UC3
  Observer --> UC11

  UC2 -.->|include| UC3
  UC2 -.->|include| UC11
  UC4 -.->|include| UC5
  UC6 -.->|extend| UC8
  UC7 -.->|extend| UC8
  UC4 -.->|extend| UC8
`;
}
