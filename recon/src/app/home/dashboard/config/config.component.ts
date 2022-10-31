import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {DatePipe, Location} from '@angular/common';
import {HttpService} from '../../../shared/services/http-service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';

import {Subject} from 'rxjs/Subject';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog, MatSidenav, MatSnackBar} from '@angular/material';
import {FilterModelComponent} from '../filter-model/filter-model.component';
import {CustomSnackbarComponent} from '../../../shared/custom-snackbar/custom-snackbar.component';
import {KpiComponent} from '../kpi/kpi.component';
import {GridTableComponent} from '../grid-table/grid-table.component';
import {GraphComponent} from '../graph/graph.component';
import {AppConstants} from '../../../shared/services/app.constants';
import {AuthService} from "../../../shared/services/auth.service";

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {
  @ViewChild('sidenav') sidenav: MatSidenav;
  @ViewChild(GraphComponent) graph: GraphComponent;
  @ViewChild(KpiComponent) kpi: KpiComponent;
  @ViewChild(GridTableComponent) grid: GridTableComponent;
  changingValue: Subject<any> = new Subject();
  refresh: Subject<any> = new Subject();
  changetabValue: Subject<any> = new Subject();
  public form: FormGroup;
  public dashboardId: Number;
  public isLoading = false;
  public isEdit = false;
  public dashboard = {
    'id': '',
    name: '',
    drillDownMultiLevel: false,
    dashboardDashlets: [],
    dashboardConfigs: [],
    module: {id: ''},
    refreshType: '',
    refreshTime: null,
    filterDays: 0
  };
  public wgetMaterData = [];
  public dashboardParameters = [];
  public drillDowns = [];
  public isFilterViewAble = false;
  public shouldRun = true;
  public selectedDashboardId;
  public selectedModuleId = null;
  public interval: any;
  public wegtcontainerConfig = {
    'margins': [5],
    'draggable': false,
    'resizable': false,
    'max_cols': 150,
    'max_rows': 0,
    'visible_cols': 0,
    'visible_rows': 0,
    'min_cols': 1,
    'min_rows': 1,
    'col_width': 2,
    'row_height': 2,
    'cascade': 'left',
    'min_width': 35,
    'min_height': 68,
    'fix_to_grid': true,
    'auto_style': true,
    'auto_resize': false,
    'maintain_ratio': false,
    'prefer_new': false,
    'zoom_on_drag': false,
    'limit_to_screen': false,
    'allow_overlap': false,
    'widget_width_factor': 22
  };
  public dashboardMenu = [{id: '', name: '', dashboardLists: [{id: '', name: '', layoutType: ''}]}];
  public menuExpands = [{active: false}];
  public subMenuOpen = false;
  public drillDownStore = new Map();
  public requestFiltersStore = new Map();
  public userModule;

  close() {
    this.subMenuOpen = false;
    this.sidenav.close();
  }

  open() {
    this.subMenuOpen = true;
    this.sidenav.open();
  }

  constructor(private datePipe: DatePipe, public location: Location, private httpService: HttpService, private router: Router, private  route: ActivatedRoute, public dialog: MatDialog, public snackBar: MatSnackBar
  , private authService: AuthService) {
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(FilterModelComponent, {
      height: '600px',
      width: '400px',
      data: {parameters: this.dashboardParameters, name: this.dashboard.name, requestFiltersStore: this.requestFiltersStore}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
    const sub = dialogRef.componentInstance.onSearch.subscribe(result => {
      this.search(result);
    });
  }

  ngOnInit() {
    this.userModule = this.authService.getLoggedInUserModule();
    this.httpService.get('v1/dashboards?Find=MyDashbaord', true).subscribe(
      (data: any) => {
        this.dashboardMenu = data;
        data.forEach((item, index) => {
          this.menuExpands.push({active: false});
        });
        if (this.dashboardId == null) {
          if (this.getDefaultDashboard()) {
            this.iniitlizeDashboard();
          }
        } else {
          this.iniitlizeDashboard();
        }
      }
    );
    this.route.params.subscribe((param: Params) => {
      this.dashboardId = +param['id'] || null;
    });
  }

  public iniitlizeDashboard(): void {
    this.httpService.get('v1/dashboards/' + this.dashboardId + '?withConfig=' + true, true).subscribe(
      (data: any) => {
        this.wgetMaterData = [];
        this.dashboard = data;
        const date = new Date();
        date.setDate(date.getDate() - this.dashboard.filterDays);
        const fromDate = this.datePipe.transform(date, 'dd-MM-yyyy');
        const toDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy');

        // Sort dashboardConfigs for set order by row and col
        if (this.dashboard.dashboardConfigs) {
          this.dashboard.dashboardConfigs.sort(function (firstArg, secondArg) {
            return (firstArg.config.row - secondArg.config.row) + (firstArg.config.col - secondArg.config.col);
          });
        }
        this.selectedDashboardId = this.dashboardId;
        this.dashboardMenu.forEach((item, index) => {
          if (item.dashboardLists) {
            item.dashboardLists.forEach((itemDeshboard, indexDashboard) => {
              if (item.id === this.dashboard.module.id && itemDeshboard.id === this.dashboard.id) {
                this.menuExpands[index] = {active: true};
                this.selectedModuleId = this.dashboard.module.id;
                $('#dashbaord-sub-menu-' + item.id).addClass('in');
              } else {
                this.menuExpands[index].active ? this.menuExpands[index] = {active: true} : this.menuExpands[index] = {active: false};
              }
            });
          }
        });
        if (this.dashboard.refreshType) {
          if (this.dashboard.refreshType === 'AUTOMATIC') {
            const refreshTime = Number(this.dashboard.refreshTime) * 1000;
            if (refreshTime) {
              this.interval = setInterval(() => {
                this.refreshChild();
              }, refreshTime);
            }
          }
        }
        const rangFilterValue = {};
        this.dashboardParameters = data.dashboardParameters;
        if (this.dashboardParameters) {
          this.isFilterViewAble = true;
          this.dashboardParameters.forEach((item, index) => {
            if (item.inputType === 'CALENDER') {
              if (item.dateType === 'PAST') {
                rangFilterValue['fromDate'] = fromDate;
                this.requestFiltersStore.set(item.id, fromDate);
              } else if (item.dateType === 'FUTURE') {
                rangFilterValue['toDate'] = toDate;
                this.requestFiltersStore.set(item.id, toDate);
              }
            }
            if (item.inputType === 'DROPDOWN') {
              this.getLookUpProviderValue(item);
            }
          });
        }
        this.drillDowns = data.drillDowns;
        if (this.dashboard) {
          if (this.dashboard.dashboardConfigs && this.dashboard.dashboardConfigs.length > 0) {
            const order = {};
            this.dashboard.dashboardConfigs.forEach((item, index) => {
              this.wgetMaterData.push({
                'id': item.dashlet.id,
                'name': item.dashlet.name,
                'type': item.dashlet.dashletType,
                'rangFilterValue': rangFilterValue,
                'config': {
                  'dragHandle': '.handle',
                  'row': Number(item.config.row),
                  'col': Number(item.config.col),
                  'unitx': Number(item.config.unitx),
                  'unity': Number(item.config.unity),
                  'payload': Number(item.config.payload),
                  'sizex': Number(item.config.sizex),
                  'sizey': Number(item.config.sizey)
                }
              });
            });
          } else {
            this.dashboard.dashboardDashlets.forEach((item, index) => {
              if (index === (this.dashboard.dashboardDashlets.length - 1) && (this.dashboard.dashboardDashlets.length % 2) !== 0) {
                this.wgetMaterData.push({
                  'id': item.dashlet.id,
                  'type': item.dashlet.dashletType,
                  'config': {
                    'dragHandle': '.handle',
                    'row': 1,
                    'sizex': 110,
                    'sizey': item.dashlet.dashletType === 'LIST' ? 37 : 25,
                    'col': 1,
                    'unitx': 1.8,
                    'payload': index + 1
                  },
                  'name': item.dashlet.name,
                  'rangFilterValue': rangFilterValue
                });
              } else {
                this.wgetMaterData.push({
                  'id': item.dashlet.id,
                  'type': item.dashlet.dashletType,
                  'config': {
                    'dragHandle': '.handle',
                    'row': 1,
                    'sizex': 55,
                    'sizey': 25,
                    'col': 1,
                    'unitx': 1.8,
                    'payload': index + 1
                  },
                  'name': item.dashlet.name,
                  'rangFilterValue': rangFilterValue
                });
              }
            });
          }
        }
      }
    );
  }

  public getDefaultDashboard(): boolean {
    let found = false;
    let foudTablayout = false;
    let tabDashbaordId = null;
    if (this.dashboardMenu) {
      this.dashboardMenu.forEach((item, index) => {
        if (item.dashboardLists) {
          item.dashboardLists.forEach((itemDeshboard, indexDashboard) => {
            if (!found && itemDeshboard.layoutType === 'SIMPLE_LAYOUT') {
              found = true;
              this.selectedDashboardId = itemDeshboard.id;
              this.dashboardId = Number(itemDeshboard.id);
            } else {
              tabDashbaordId = Number(itemDeshboard.id);
              foudTablayout = true;
            }
          });
        }
      });
      if (!found && foudTablayout && tabDashbaordId != null) {
        this.router.navigate(['/home/dashboard', 'full', {outlets: {'fullBodyOutlet': ['config-tab-layout', tabDashbaordId]}}]);
      }
    }
    return found;
  }

  cancel(): void {
    this.isEdit = false;
    this.wegtcontainerConfig.resizable = false;
    this.wegtcontainerConfig.draggable = false;
    if (this.dashboardId == null) {
      if (this.getDefaultDashboard()) {
        this.iniitlizeDashboard();
      }
    } else {
      this.iniitlizeDashboard();
    }
  }

  onEdit(): void {
    this.isEdit = true;
    this.wegtcontainerConfig.resizable = true;
    this.wegtcontainerConfig.draggable = true;
  }

  public onResize(item) {
  }

  submit(): void {
    const dashboardConfigs = [];
    this.wgetMaterData.forEach((item, index) => {
      const config = {
        'sizey': item.config.sizey,
        'sizex': item.config.sizex,
        'unitx': item.config.unitx,
        'unity': item.config.unity,
        'col': item.config.col,
        'payload': item.config.payload,
        'row': item.config.row
      };
      const dashboardConfig = {'dashlet': {'id': item.id}, 'config': config};
      dashboardConfigs.push(dashboardConfig);
    });
    const dashboardConfigSetup = {'id': this.dashboard.id, 'dashboardConfigs': dashboardConfigs};
    this.isLoading = true;
    this.httpService.post('v1/dashboards/' + this.dashboard.id + '/configuration', dashboardConfigSetup, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 2000,
          horizontalPosition: 'right',
          extraClasses: 'green-color',
          verticalPosition: 'bottom',
          data: 'Dashboard Successfully Configured !',
        });
        this.wegtcontainerConfig.resizable = false;
        this.wegtcontainerConfig.draggable = false;
        this.isEdit = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
      }
    );
  }

  public searchByText(name: string, dashboardParameterId: number) {
    if (this.dashboardParameters.length > 0) {
      this.dashboardParameters.forEach((item, index) => {
        if (item.id === dashboardParameterId) {
          item.dashboardFilters.forEach((filter, indexFilter) => {
            const nameVal = {'value': name, 'column': filter.fieldName, 'dashletId': filter.dashlet.id};
            this.changingValue.next(nameVal);
          });
        }
      });
    }
  }

  public search(searchParameters) {
    const filterParameterArray = [];
    if (this.dashboardParameters.length > 0) {
      this.dashboardParameters.forEach((item, index) => {
        searchParameters.forEach((searchParameter, indexSearchParameter) => {
          if (item.id === searchParameter.column) {
            item.dashboardFilters.forEach((filter, indexFilter) => {
              const nameVal = {'value': searchParameter.value, 'column': filter.fieldName, 'dashletId': filter.dashlet.id};
              if (!this.isContains(nameVal, filterParameterArray)) {
                this.requestFiltersStore.set(searchParameter.column, searchParameter.value);
                filterParameterArray.push(nameVal);
              }
            });
          }
          if (searchParameter.column === 'archiveData') {
            const dashletids = this.getAllDashletIdUseInThisDashBoard(this.dashboardParameters);
            dashletids.forEach((dashletid, dashletidsIndex) => {
              const nameVal = {'value': searchParameter.value, 'column': 'archiveData', 'dashletId': dashletid};
              if (!this.isContains(nameVal, filterParameterArray)) {
                this.requestFiltersStore.set(searchParameter.column, searchParameter.value);
                filterParameterArray.push(nameVal);
              }
            });
          }
        });
      });
    }
    if (filterParameterArray.length === 0) {
      this.requestFiltersStore.clear();
    }
    this.changingValue.next(filterParameterArray);
  }

  private isContains(nameVal, filterParameterArray) {
    let isContain = false;
    filterParameterArray.forEach((searchParameter, indexSearchParameter) => {
      if (searchParameter.value === nameVal.value && searchParameter.column === nameVal.column && searchParameter.dashletId === nameVal.dashletId) {
        isContain = true;
      }
    });
    return isContain;
  }

  public updateDrillDown(value: any) {
    if (this.drillDowns) {
      let filterItemToBePass = [];
      this.drillDowns.forEach((item, index) => {
        if (value.search) {
          if (this.dashboard.drillDownMultiLevel) {
            if (this.getDrillDownParent(item, value.dashletId)) {
              if (this.drillDownStore.get(item.parent.id)) {
                const existingItem = this.drillDownStore.get(item.parent.id);
                if (existingItem.column === value.column && value.dashletId === existingItem.dashletId) {
                  existingItem.value = value.value;
                  this.drillDownStore.set(item.parent.id, existingItem);
                }
              }
            }
          }
        } else if (item.parent.id === value.dashletId) {
          const child = this.getDrillDownChild(item);
          if (this.dashboard.drillDownMultiLevel) {
            this.drillDownStore.set(item.parent.id, {dashletId: child.child.id, column: child.childFieldName, value: value.value});
            filterItemToBePass = this.getStoredDrillDownChilds(item, value, child);
          }
          filterItemToBePass.push({dashletId: child.child.id, column: child.childFieldName, value: value.value, isDrillDown: true});
          this.changingValue.next(filterItemToBePass);
        }
      });
    }
  }

  public getStoredDrillDownChilds(item: any, value: any, child: any) {
    const filterItemToBePass = [];
    if (item.drillDownChilds.length > 1) {
      item.drillDownChilds.forEach((childItem, index) => {
        if (childItem.child && childItem.childFieldName) {
          if (this.drillDownStore.has(childItem.child.id)) {
            const existingItem = this.drillDownStore.get(childItem.child.id);
            filterItemToBePass.push({dashletId: child.child.id, column: existingItem.column, value: existingItem.value, isDrillDown: true});
          }
        }
      });
    }
    return filterItemToBePass;
  }

  public getDrillDownChild(item: any) {
    let filteredItem;
    if (item.drillDownChilds.length === 1) {
      filteredItem = item.drillDownChilds[0];
    } else {
      item.drillDownChilds.forEach((childItem, index) => {
        if (childItem.child && !childItem.parentFieldName) {
          filteredItem = childItem;
        }
      });
    }
    return filteredItem;
  }

  public getDrillDownParent(item: any, childId: any) {
    let parentDrillDownId = false;
    item.drillDownChilds.forEach((childItem, index) => {
      if (childItem.child) {
        if (childItem.child.id === childId) {
          parentDrillDownId = true;
        }
      }
    });
    return parentDrillDownId;
  }

  private getLookUpProviderValue(item) {
    this.httpService.get('v1/lookupproviders/' + item.lookUpProvider + '/execute', true).subscribe(
      (lookUpProviderData: any) => {
        item['lookUpProviders'] = lookUpProviderData.data;
      }
    );
  }

  public dashbaordSelection(id: any, layoutType: any): void {
    if (id) {
      this.selectedDashboardId = id;
      if (layoutType === 'TAB_LAYOUT') {
        this.router.navigate(['/home/dashboard', 'full', {outlets: {'fullBodyOutlet': ['config-tab-layout', id]}}]);
      } else {
        this.dashboardId = id;
        this.iniitlizeDashboard();
        // this.router.navigate(['/home/dashboard', 'full' , {outlets: {'fullBodyOutlet': ['config', id]}}]);
      }
    }
  }

  public expandMainMenu(selectedIndex: any): void {
    this.menuExpands.forEach((item, index) => {
      if (selectedIndex === index) {
        item.active = item.active ? false : true;
        if (item.active) {
          this.selectedModuleId = this.dashboardMenu[index].id;
        } else {
          this.selectedModuleId = null;
        }
      } else {
        if (item.active) {
          $('#dashbaord-sub-menu-' + this.dashboardMenu[index].id).removeClass('in');
        }
        item.active = false;
      }
    });
  }

  public createNewDashdoard(): void {
    const moduleId = this.selectedModuleId;
    if (moduleId != null) {
      this.router.navigate(['/home/dashboard', 'full', {outlets: {'fullBodyOutlet': ['new']}}],
        {queryParams: {groupId: moduleId}});
    } else {
      $.confirm(this.getErrorModal('Please select group or sub group...!'));
    }
  }

  public refreshChild() {
    this.refresh.next(5);
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

  getAllDashletIdUseInThisDashBoard(dashboardParameters: any[]) {
    const dashletIds = [];
    this.dashboardParameters.forEach((item, index) => {
      item.dashboardFilters.forEach((filter, indexFilter) => {
        if (dashletIds.indexOf(filter.dashlet.id) === -1) {
          dashletIds.push(filter.dashlet.id);
        }
      });
    });
    return dashletIds;
  }

}
