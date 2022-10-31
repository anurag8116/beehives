import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MenuService} from '../../../shared/menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TreeModel, NodeEvent, Ng2TreeSettings} from 'ng2-tree';
import {HttpService} from '../../../shared/services/http-service';

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
  public tableCoumnOrders: any = [];

  constructor(private httpService: HttpService, private router: Router, private menuService: MenuService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.httpService.get('v1/modules?Find=Parents', true).subscribe(
      (data: any) => {
        const children: any = [];
        if (data.data.length > 0) {
          data.data.forEach(function (value) {
            children.push({
              emitLoadNextLevel: true,
              id: value.id,
              value: value.name,
              type: 'parent',
              settings: {
                'static': true,
                'isCollapsedOnInit': true,
                'rightMenu': false,
                'leftMenu': false,
                'cssClasses': {
                  'expanded': 'fa fa-folder-open-o',
                  'collapsed': 'fa fa-folder',
                  'leaf': 'fa fa-bar-chart',
                  'empty': 'fa fa-folder'
                }
              }
            });
          });
          this.tree = {value: '', children: children};
        }
      }
    );
  }


  public handleExpanded(nodeEvent: NodeEvent): void {
    // Call here here child structre API
    if (nodeEvent.node.id && nodeEvent.node.node.type === 'parent') {
      const newChildren: Array<TreeModel> = [];
      const sideChildren: Array<TreeModel> = [];
      const columns: any[] = [];
      this.httpService.get('v1/modules/' + nodeEvent.node.id + '/children', true).subscribe(
        (data: any) => {
          if (data.length > 0) {
            data.forEach(function (value) {
              newChildren.push({
                id: value.id,
                value: value.name,
                type: 'parent',
                children: [{value: ''}],
                settings: {
                  'static': true,
                  'isCollapsedOnInit': true,
                  'rightMenu': false,
                  'leftMenu': false,
                  'cssClasses': {
                    'expanded': 'fa fa-folder-open-o',
                    'collapsed': 'fa fa-folder',
                    'leaf': 'fa fa-bar-chart',
                    'empty': 'fa fa-folder'
                  }
                }
              });
            });
            nodeEvent.node.setChildren(newChildren);
          }
        }
      );

      this.httpService.get('v1/reports?get=bymodule&moduleId=' + nodeEvent.node.id, true).subscribe(
        (data: any) => {
          if (data.length > 0) {
            this.tableCoumnOrders = [];
            data.forEach(function (value) {
                  const icon = value.reportType === 'pdf' ? 'fa fa-file-pdf-o pdf-icon-color' : value.reportType === 'csv' ? 'fa fa-file-excel-o csv-icon-color' : value.reportType === 'text' ? 'fa fa-file-text-o text-file-icon-color' :  value.reportType === 'excel' ? 'fa fa-table csv-icon-color' : 'fa fa-bar-chart';
            newChildren.push({
                id: value.id,
                const: 'report',
                value: value.name,
                type: 'child',
                settings: {
                  'static': true,
                  'isCollapsedOnInit': true,
                  'rightMenu': false,
                  'leftMenu': false,
                  'cssClasses': {
                    'expanded': 'fa fa-folder-open-o',
                    'collapsed': 'fa fa-folder',
                         'leaf': icon,
                    'empty': 'fa fa-folder'
                  }
                }
              });
            });
            nodeEvent.node.setChildren(newChildren);
          }
        }
      );
    }
  }

  public nodeSelection(nodeEvent: NodeEvent): void {
    if (nodeEvent.node.node.type === 'parent') {
      this.seletedNode = {'id': nodeEvent.node.node.id, 'type': nodeEvent.node.node.type};
    } else {
      this.seletedNode = {'id': nodeEvent.node.node.id, 'type': nodeEvent.node.node.type};
      // call here report deails page
      this.router.navigate(['/home/reports/part', {outlets: {'bodyOutlet': ['detail', nodeEvent.node.node.id]}}]);
    }
  }

  public createNewReport(): void {
    if (this.seletedNode && this.seletedNode.id && this.seletedNode.type === 'parent') {
      // call here create report page
      this.router.navigate(['/home/reports/full', {outlets: {'fullBodyOutlet': ['new']}}],
        {queryParams: {groupId: this.seletedNode.id}});
    } else {
      $.confirm(this.getErrorModal('Please select group or sub group...!'));
    }
  }

  public getTreeSetting(): any {
    return {
      'static': true,
      'isCollapsedOnInit': true,
      'rightMenu': false,
      'leftMenu': false,
      'cssClasses': {
        'expanded': 'fa fa-folder-open-o',
        'collapsed': 'fa fa-folder',
        'leaf': 'fa fa-bar-chart',
        'empty': 'fa fa-folder'
      }
    };
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
