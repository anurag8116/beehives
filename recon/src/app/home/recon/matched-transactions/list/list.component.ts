import {AfterViewChecked, Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {HttpService} from '../../../../shared/services/http-service';
import {Subject} from 'rxjs/Subject';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import {MatDialog} from '@angular/material/dialog';
import {SubmitMultipleRowsComponent} from '../../../pop-up/submit-multiple-rows/submit-multiple-rows.component';
import {ValidationConstant} from '../../../../shared/services/validation-constant';
import {ReconDataType} from '../../../../shared/services/enum';
import {TimelineCharComponent} from '../../../pop-up/timeline-char/timeline-char.component';
import {DatePipe} from '@angular/common';
import {ActivatedRoute} from '@angular/router';

enum DataType {
  DATE = 'DATE'
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit, AfterViewChecked {

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings = {};
  public recons: any[] = [];
  public tableCoumnOrders: any = [];
  public searchFileds: any = [];
  public showTable: any = false;
  public masterView: any;
  public dataSourcesViews: any[] = [{datasourceVo: {}}];
  public reconIterations: any[] = [];
  public rules: any[] = [];
  public dataSourcee: any[] = [];
  public restriket = 0;
  public selectedSourceViewId = null;
  public selectedIterationId = null;
  public selectedRuleId = null;
  public selectedDataSourceId = null;
  public exist = false;
  private id: number;
  public selectedIndex: number;
  private sourceId: number;
   duplicateList = false;

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private dialog: MatDialog,
              private datePipe: DatePipe, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.url.subscribe(url => {
      this.duplicateList = url[0].path === 'duplicate-list' ? true : false;
    });
    this.httpService.get('v1/recons', true).subscribe(
      (data: any) => {
        this.recons = data.data;
        for (const recon of this.recons) {
          this.onSelectRecon(recon.id);
          break;
        }
      }
    );
    this.select(0);
  }

  ngAfterViewChecked(): void {
    this.restriket = 0;
  }

  select(index: number) {
    this.selectedIndex = index;
  }

  public onDataSourceChange(selectedSourceViewId: number, reconIterationId: number, ruleId: number = null): void {
    this.selectedIterationId = reconIterationId;
    this.selectedRuleId = ruleId;
    this.showTable = false;
    if (selectedSourceViewId) {
      this.httpService.get('v1/unmatchedtransactions/' + selectedSourceViewId, true).subscribe(
        (data: any) => {
          this.sourceId = data.datasourceVo.id;

          if (this.selectedDataSourceId !== data.datasourceVo.id) {
            this.selectedDataSourceId = data.datasourceVo.id;
            this.httpService.get('v1/rules?Find=ByDataSource&reconType=MATCHING&dataSourceId=' + data.datasourceVo.id, true).subscribe(
              (rules: any) => {
                this.rules = rules;
              }
            );
          }


          let dataSourceDataUrl = this.duplicateList ? 'v1/datasources/' + this.sourceId + '/data?reconStatus=DUPLICATE_MATCH' : 'v1/datasources/' + this.sourceId + '/data?reconStatus=RECONCILED';

          if (!isNullOrUndefined(reconIterationId) && !isNaN(reconIterationId)) {
            dataSourceDataUrl += '&reconIterationId=' + reconIterationId;
          }
          if (!isNullOrUndefined(ruleId)) {
            dataSourceDataUrl += '&ruleId=' + ruleId;
          }
          this.masterView = data;
          this.searchFileds = data.filters;
          this.dtOptions = Object.assign(this.dateTableService.getBasicTable(dataSourceDataUrl, this.getColumnsDefinition())
            , {
              rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                const self = this;
                $('td', row).unbind('click');
                $('td', row).bind('click', () => {
                  self.onCheckBoxButtonSelect(rowData);
                });
                return row;
              },
            });
          this.showTable = true;
        });
    } else {
      this.rules = [];
    }
  }

  public searchByName(name: string, searchField: string) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      console.log(searchField);
      this.tableCoumnOrders.forEach(function (value) {
        if (value.data === searchField) {
          dtInstance.columns(value.index + 1).search(name).draw();
        }
      });
    });
  }

  public onSelectRecon(reconId: number): void {
    this.id = reconId;
    this.httpService.get('v1/unmatchedtransactions?Find=ByRecon&recon=' + reconId, true).subscribe(
      (data: any) => {
        this.dataSourcesViews = data;
        for (const sourceView of this.dataSourcesViews) {
          this.selectedSourceViewId = sourceView.id;
          this.sourceId = sourceView.datasourceVo.id;
          break;
        }
        this.httpService.get('v1/reconiterations?Find=ByRecon&descendingOrder=true&reconId=' + reconId, true).subscribe(
          (iterations: any) => {
            this.reconIterations = iterations;
            !isNullOrUndefined(this.reconIterations) && this.reconIterations.length > 0 ? this.selectedIterationId = this.reconIterations[0].id : this.selectedIterationId = null;
            this.onDataSourceChange(this.selectedSourceViewId, this.selectedIterationId);
          }
        );
      }
    );
  }

  refresh() {
    this.dataSourcee = [];
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  onForcedUnMatch() {
    if (this.dataSourcee.length > 0) {
      const data = {reconId: this.id, dataSource: this.sourceId, mappingList: [], type: ReconDataType.UNRECONCILED};
      for (const source of this.dataSourcee) {
        data.mappingList.push({id: source.rowid});
      }
      const dialogRef = this.dialog.open(SubmitMultipleRowsComponent, {width: '50%', height: '40%', data});
      dialogRef.afterClosed().subscribe(result => {
        this.dataSourcee = [];
        this.cancel();
      });
    } else {
      this.httpService.displayErrorOnPopUp(ValidationConstant.SELECT_ATLEAST_ONE_ROW);
    }
  }

  showHistoryPopUp(dataId: number) {
    this.httpService.get('v1/transactionhistory?mapping=' + dataId +
      '&datasource=' + this.sourceId, true).subscribe(
      (dataa: any) => {
        if (!isNullOrUndefined(dataa)) {
          const data = {data: dataa};
          const dialogRef = this.dialog.open(TimelineCharComponent, {width: '853px', height: '522px', data});
          dialogRef.afterClosed().subscribe(result => {
            this.cancel();
          });
        }
      },
    );
  }

  public cancel() {
    this.dataSourcee = [];
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });

  }

  viewTransactionHistory() {
    if (this.dataSourcee.length === 0) {
      this.httpService.displayErrorOnPopUp('Select One Transaction Row');
    } else if (this.dataSourcee.length > 1) {
      this.httpService.displayErrorOnPopUp('Select Only One Transaction Row');
    } else {
      let dataId = null;
      for (const source of this.dataSourcee) {
        dataId = source.rowid;
      }
      this.showHistoryPopUp(dataId);
    }
  }

  format(rowId, sourceId) {
    const div = $('<div/>')
      .addClass('loading').addClass('table-detail-panal')
      .text('Loading...');
    this.httpService.get('v1/reconmapping?Find=ByRowAndSource&rowId=' + rowId + '&sourceId=' + sourceId, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          const html = this.getHtmlDataSourceDetail(data);
          div.html(html)
            .removeClass('loading');
        }
      }
    );
    return div;
  }

  private getHtmlDataSourceDetail(data: any): string {

    let page = '    <div class="col-md-12 left-pad2 right-pad2 source-detail-popup">\n' +
      '\n' +
      '      <div class="">\n' +
      '        <div class="">\n' +
      '          ' +
      '        </div>\n';
    if (!isNullOrUndefined(data) && data.length > 0) {
      page += '<div class="row">\n' +
        '          <div class="col-md-12" style="margin-left: 22px"><h5></h5></div>\n' +
        '      </div>\n' +
        '      <div class="">\n' +
        '        <div class="panel panel-profile table-responsive border-none cover2 source-align">\n';
      page += '        <table class="table history table-border-align" border="1">';
      for (let i = 0; i < data.length; i++) {
        const sourceRows = data[i].mappedRowSourceData;
        for (let z = 0; z < sourceRows.length; z++) {
          const toKey = Object.keys(sourceRows[z].data);
          page += '                 <thead> ' +
            '                     <tr>';
          for (let j = 0; j < toKey.length; j++) {
            if (j === 0) {
              page += '                 <th scope="col" class="bottom-th-border"></th>';
            }
            page += '                 <th scope="col"> ' + toKey[j] + '</th>';
          }
          page += '               </tr>' +
            '                 </thead>' +
            '                 <tbody>';
          page += '                     <tr>';
          for (let j = 0; j < toKey.length; j++) {
            if (j === 0) {
              page += '                 <td scope="col" style="font-weight: bold;"> ' + data[i].sourceName + '</td>';
            }
            page += '                 <td scope="col"> ' + sourceRows[z]['data'][toKey[j]] + '</td>';
          }
          page += '               </tr>' +
            '                 </tbody>';
        }
      }
      page += '              </table> ' +
        '          </div>\n' +
        '      </div>\n';
    }
    page += '</div>' +
      '      </div>\n';
    return page;
  }

  private onDetailButtonSelect(rowId, sourceId) {
    const that = this;
    jQuery('table').on('click', 'a#detailBtn', function () {
      const tr = $(this).closest('tr');
      that.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        const row = dtInstance.row(tr);
        if (row.child.isShown()) {
          row.child.hide();
          tr.removeClass('shown');
        } else {
          row.child(that.format(rowId, sourceId)).show();
          console.log(row.data());
          tr.addClass('shown');
        }
      });
    });
  }

  private onCheckBoxButtonSelect(rowData: any) {
    let rowIds;
    if (!isNullOrUndefined(rowIds = rowData['ID'])) {
      rowIds = rowData['ID'];
    } else if (!isNullOrUndefined(rowIds = rowData['id'])) {
      rowIds = rowData['id'];
    } else if (!isNullOrUndefined(rowIds = rowData['Id'])) {
      rowIds = rowData['Id'];
    } else if (!isNullOrUndefined(rowIds = rowData['iD'])) {
      rowIds = rowData['iD'];
    }

    $('table').unbind('click');
    this.onDetailButtonSelect(rowIds, this.sourceId);
    const that = this;
    jQuery('table').on('click', 'input#check', function () {
      const dataTableName = $(this).closest('table').attr('id');
      const status = $('input#check').prop('checked');
      that.getData(rowIds);
    });
  }

  private getData(rowId: number) {
    if (this.dataSourcee === null || this.dataSourcee.length < 1) {
      this.dataSourcee.push({rowid: rowId, dataSourceId: this.sourceId});
    } else {
      for (let i = 0; i < this.dataSourcee.length; i++) {
        if (this.dataSourcee[i].rowid === rowId) {
          this.exist = true;
          this.dataSourcee.splice(i, 1);
        }
      }
      if (!this.exist) {
        this.dataSourcee.push({rowid: rowId, dataSourceId: this.sourceId});
      }
    }
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    let restriket = 0;
    this.tableCoumnOrders = [];
    this.masterView.tableColumns.forEach((item, index) => {
      restriket++;
      this.tableCoumnOrders.push({
        index: index,
        title: item.label,
        data: item.fieldName,
        bSortable: item.sorter,
        render: $.fn.dataTable.render.text()
      });
      if (restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2, render: (data, type, full) => {
            let html = '  <input id="check"  type="checkbox">';
            html += '<a id ="detailBtn" class="details-control" href="javascript:void(0);" >  </a>';
            return html;
          }
        });
      }
      if (item.dataType === DataType.DATE) {
        columns.push({
          title: item.label, data: item.fieldName, render: (data, type, full) => {
            return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
          }
        });
      } else {
        columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter, render: $.fn.dataTable.render.text()});
      }
    });
    return columns;
  }

}
