import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataTableService} from '../../../shared/services/data-table-service';
import {DataTableDirective} from 'angular-datatables';
import {Subject} from 'rxjs/Subject';
import {HttpService} from '../../../shared/services/http-service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {AppConstants} from '../../../shared/services/app.constants';
import {FilterModelComponent} from '../filter-model/filter-model.component';
import {MatDialog, MatSnackBar} from '@angular/material';
import {CustomSnackbarComponent} from '../../../shared/custom-snackbar/custom-snackbar.component';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html'
})
export class GridComponent implements OnInit, OnDestroy {
  @Input() changing: Subject<any>;
  @Input() refresh: Subject<any>;
  @Input() public dashletId: number;
  @Input() rangFilterValue: any;
  @Output() drillDownValue: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public dashlet = {name: '', dashletType: '', dataProvider: null, tableColumns: [], colors: [], sorters: [], filters: [], dashletActions: [], refreshType: null, refreshTime : null};
  public searchFileds = [];
  public showTable: any = false;
  public tableCoumnOrders: any = [];
  public isFilterViewAble = false;
  public interval: any;
  public requestFiltersStore = new Map();
  public isComponetActive = true;
  public drillDownFilters = [];

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private router: Router, private  activatedRoute: ActivatedRoute, public dialog: MatDialog, public snackBar: MatSnackBar) {
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(FilterModelComponent, {
      height: '600px',
      width: '400px',
      data: {parameters : this.searchFileds, name : this.dashlet.name, requestFiltersStore: this.requestFiltersStore }
    });

    dialogRef.afterClosed().subscribe(result => {
    });
    const sub = dialogRef.componentInstance.onSearch.subscribe(result => {
      this.search(result);
      result.forEach((item, index) => {
        const value = {'value': item.value, 'column': item.column, 'dashletId': this.dashletId, search : true};
        this.drillDownValue.emit(value);
      });
    });
  }
  ngOnDestroy() {
    this.isComponetActive = false;
  }
  ngOnInit() {
    const me = this;
    this.changing.subscribe(filterDatas => {
      let itsForMe = false;
      let isDrillDown = false ;
      const ownedFilterData = [];
      this.drillDownFilters = [];
      filterDatas.forEach((item, index) => {
        if (this.dashletId === item.dashletId) {
          itsForMe = true;
        }
        if (item.isDrillDown) {
          isDrillDown = true;
        }
        if (this.dashletId === item.dashletId && item.isTab) {
        } else if (this.dashletId === item.dashletId && item.value != null) {
          ownedFilterData.push({'value': item.value, 'column': item.column});
          if (isDrillDown && itsForMe) {
            let isContains = false ;
            this.drillDownFilters.forEach((drillDownFilter, indexdrillDownFilter) => {
              if (drillDownFilter.column === item.column) {
                drillDownFilter.value = item.value;
                isContains = true ;
              }
            });
            if (!isContains) {
              this.drillDownFilters.push({'value': item.value, 'column': item.column});
            }
          } else {
            this.drillDownFilters = [];
          }
        }
      });
      if (itsForMe && this.isComponetActive) {
        this.search(ownedFilterData);
      } else if (!isDrillDown && ownedFilterData.length === 0 && this.isComponetActive) {
        this.search(ownedFilterData);
      }
    });
  this.refresh.subscribe(v => {
        this.refreshGrid();
    });
    this.showTable = false;
    this.httpService.get('v1/dashlets/' + this.dashletId, true).subscribe(
      (data: any) => {
        this.dashlet = data;
        if (this.dashlet.refreshType) {
          if (this.dashlet.refreshType === 'AUTOMATIC') {
            const refreshTime = Number(this.dashlet.refreshTime) * 1000;
            if (refreshTime) {
              this.interval = setInterval(() => {
                this.refreshGrid();
              }, refreshTime);
            }
          }
        }
        this.searchFileds = data.filters;
        const dateRangeFilters =  [];
        if (this.searchFileds) {
          this.searchFileds.forEach((item, index) => {
            if (item.inputType === 'CALENDER') {
              if (item.dateType === 'PAST' && this.rangFilterValue['fromDate']) {
                dateRangeFilters.push({column: item.fieldName, value: this.rangFilterValue.fromDate})
                this.requestFiltersStore.set(item.fieldName, this.rangFilterValue.fromDate);
              } else if (item.dateType === 'FUTURE' && this.rangFilterValue['toDate']) {
                this.requestFiltersStore.set(item.fieldName, this.rangFilterValue.toDate);
                dateRangeFilters.push({column: item.fieldName, value: this.rangFilterValue.toDate});
              }
            }
            if (item.inputType === 'DROPDOWN') {
              this.getLookUpProviderValue(item);
            }
          });
          this.searchFileds.length > 0 ? this.isFilterViewAble = true : this.isFilterViewAble = false;
        }
        if (this.dtElement) {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            this.dtOptions = this.dateTableService.getDashboardGridTable('v1/datasets/' + this.dashlet.dataProvider + '/execute', this.getColumnsDefinition(), this.dashlet);
            this.dtOptions['initComplete'] = function (settings, json) {
              jQuery(this).closest('table').on('click', 'a', function () {
                jQuery(this).closest('table').find('td').removeClass('row-selected');
                jQuery(this).closest('td').addClass('row-selected');
                const value = {'value': jQuery(this).data('data'), 'column': jQuery(this).data('filed'), 'dashletId': me.dashletId};
                me.drillDownValue.emit(value);
              });
              me.applyDateRangeFilter(dateRangeFilters, me);
            };
          });
        } else {
          this.dtOptions = this.dateTableService.getDashboardGridTable('v1/datasets/' + this.dashlet.dataProvider + '/execute', this.getColumnsDefinition(), this.dashlet);
          this.dtOptions['initComplete'] = function (settings, json) {
            jQuery(this).closest('table').on('click', 'a', function () {
              jQuery(this).closest('table').find('td').removeClass('row-selected');
              jQuery(this).closest('td').addClass('row-selected');
              const value = {'value': jQuery(this).data('data'), 'column': jQuery(this).data('filed'), 'dashletId': me.dashletId};
              me.drillDownValue.emit(value);
            });
            me.applyDateRangeFilter(dateRangeFilters, me);
          };
        }
        this.showTable = true;
      }
    );
  }

  public applyDateRangeFilter(dateRangeFilters: any, me: any) {
    if (dateRangeFilters.length > 0) {
      me.dtElement.dtInstance.then(( dtOneInstance: DataTables.Api) => {
        me.tableCoumnOrders.forEach(function (value) {
          dateRangeFilters.forEach(function (filterData) {
            if (filterData.column) {
              if (value.data === filterData.column && filterData.value) { // column
                dtOneInstance.columns(value.index).search(filterData.value); // value
              }
            }
          });
        });
        dtOneInstance.draw();
      });
    }
  }

  public search(filterDatas) {
    const me = this;
    if (filterDatas.length === 0) {
      this.drillDownFilters = [];
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        this.requestFiltersStore.clear();
        this.tableCoumnOrders.forEach(function (value) {
          dtInstance.columns(value.index).search('');
        });
        dtInstance.draw();
      });
    } else {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        this.tableCoumnOrders.forEach(function (value) {
          filterDatas.forEach(function (filterData) {
            if (filterData.column) {
              if (value.data === filterData.column && filterData.value) { // column
                me.requestFiltersStore.set(filterData.column, filterData.value);
                dtInstance.columns(value.index).search(filterData.value); // value
              }
            }
          });
        });
        dtInstance.draw();
      });
    }
  }

  private getLookUpProviderValue(item) {
    this.httpService.get('v1/lookupproviders/' + item.lookUpProvider + '/execute', true).subscribe(
      (lookUpProviderData: any) => {
        item['lookUpProviders'] = lookUpProviderData.data;
      }
    );
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    let columnName = '';
    this.dashlet.tableColumns.forEach((item, index) => {
      this.tableCoumnOrders.push({index: index, title: item.label, data: item.fieldName});
      columnName = item.fieldName;
      columns.push({
        title: item.label,
        data: item.fieldName, render: (data, type, full) => {
          return '<a  data-data="' + data + '" data-filed="' + item.fieldName + '" href="javascript:void(0);"> ' + data + '</a>';
        }, bSortable: this.checkColumnSortable(item.fieldName)
      });
    });
    if (this.dashlet.filters) {
      this.dashlet.filters.forEach((filter, index) => {
        if (! this.checkColumnAlreadyAdded(filter.fieldName)) {
          this.tableCoumnOrders.push({index: this.tableCoumnOrders.length, title: filter.label, data: filter.fieldName});
          columns.push({
            title: filter.label,
            data: filter.fieldName,
            render: (data, type, full) => {
              return '';
            }, bSortable: false, visible: false
          });
        }
      });
    }
    return columns;
  }

  private checkColumnAlreadyAdded(fieldName: string): boolean {
    let found = false;
    this.tableCoumnOrders.forEach((tableColumn, indexTable) => {
      if (fieldName === tableColumn.data) {
        found = true;
      }
    });
    return found;
  }

  private checkColumnSortable(fieldName: string): boolean {
    let isSort = false;
    this.dashlet.sorters.forEach((sort, sortIndex) => {
      if (sort.name === fieldName && sort.enable) {
        isSort = true;
      }
    });
    return isSort;
  }

  public refreshGrid() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  public downloadAsExcel() {
    const requestFilters = [];
    if (this.requestFiltersStore.size > 0) {
      for (const requestFilter of  Array.from(this.requestFiltersStore)) {
        requestFilters.push({ fieldName : requestFilter[0], value : requestFilter[1]});
      }
    }
    const dashletDownloadRequest = {dashlet : {id : this.dashletId}, requestFilters: requestFilters};
    this.httpService.post('v1/dashletdownloads', dashletDownloadRequest, true).subscribe(
      (data: any) => {
        this.snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 2000,
          horizontalPosition: 'right',
          extraClasses: 'green-color',
          verticalPosition: 'bottom',
          data: 'Download Request Successfully Submitted !',
        });
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }
}
