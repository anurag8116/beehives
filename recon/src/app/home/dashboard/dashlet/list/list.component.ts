import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {Ng2TreeSettings, NodeEvent, TreeModel} from 'ng2-tree';
import {MenuService} from '../../../../shared/menu.service';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  public seletedNode: any;
  public settings: Ng2TreeSettings = {
    rootIsVisible: false
  };
  public tree: TreeModel;
  public modules: any;
  public subModules: any;
  public dashlets: any;
  public isSubModule: boolean;
  public selectedGroup: number;
  public selectedIndex: number;
  public selectedSubGroupIndex: number;

  constructor(private httpService: HttpService, private router: Router, private menuService: MenuService, private activeRoute: ActivatedRoute) {
    this.isSubModule = false;
  }

  ngOnInit() {
    this.selectedGroup = null;
    this.httpService.get('v1/dashlets?Find=ByModuleWithDashlet', true).subscribe(
      (data: any) => {
        this.modules = data;
      }
    );
  }

  select(index: number) {
    this.selectedIndex = index;
    this.selectedSubGroupIndex=null;
  }

  selectSubGroup(index: number) {
    this.selectedSubGroupIndex = index;
    this.selectedIndex = null;
  }

  public selectGroup(id: number) {
      this.selectedGroup = id;
  }

  public onDashletSelect(id: number): void {
    this.router.navigate(['/home/dashboard', 'dashlet', {outlets: {'bodyOutlet': ['detail', id]}}]);
  }

  public createNewDashlet(): void {
    if (!isNullOrUndefined(this.selectedGroup)) {
      this.router.navigate(['/home/dashboard/full', 'dashlet', {outlets: {'fullBodyOutlet': ['new']}}],
        {queryParams: {groupId: this.selectedGroup}});
    } else {
      $.confirm(this.getErrorModal('Please select group or sub group...!'));
    }
  }

  private getErrorModal(message: string): any {
    return {
      title: '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Error ...!',
      content: message,
      type: 'red',
      closeIcon: true,
      closeIconClass: 'fa fa-close',
      animation: 'none',
      offsetBottom: 400,
      height: 'auto',
      buttons: {
        close: {
          btnClass: 'btn-red', action: function () {
          }
        }
      }
    };
  }
}
