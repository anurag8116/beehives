import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import {ActivatedRoute, Params} from '@angular/router';
import {DatePipe} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {SubmitMultipleRowsComponent} from '../../../pop-up/submit-multiple-rows/submit-multiple-rows.component';
import {ValidationConstant} from '../../../../shared/services/validation-constant';
import {ReconDataType} from '../../../../shared/services/enum';

@Component({
  selector: 'app-form',
  templateUrl: './data-approval.component.html',
})
export class DataApprovalComponent implements OnInit {

  private type = 'PANDING_APPROVAL';

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public selectedCategory = null;
  public id: any;
  public selectedRowDataId: number[] = [];
  public showTable: any = false;
  public showForInvalidData: any = false;
  public html: String;
  public masterView: any;
  public searchFileds: any = [];
  public tableCoumnOrders: any = [];
  public dataSources = [];
  public selectedSourceId = null;

  public types: any = [{id: 'EDITED', name: 'Edited'}, {id: 'DISCARD', name: 'Discarded'}];

  constructor(private httpService: HttpService, private dateTableService: DataTableService, private dialog: MatDialog,
              private activeRoute: ActivatedRoute, private datePipe: DatePipe) {

  }

  ngOnInit() {
    this.activeRoute.params.subscribe((param: Params) => {
      this.activeRoute.queryParams.subscribe(params => {
        this.id = +params['id'] || null;
        this.selectedCategory = {id: +params['id'] || null, name: params['category']};
      });
      this.selectedSourceId = null;
      if (this.selectedCategory.name === 'EDIT_INVALID_DATA') {
        this.showTable = false;
        this.showForInvalidData = true;
        this.EditOperationType();
      } else {
        this.showForInvalidData = false;
        if (this.selectedCategory.name === 'RECONCILED' || this.selectedCategory.name === 'UNRECONCILED'
          || this.selectedCategory.name === 'DUPLICATE_MATCH_KNOCK_OFF') {
          this.onForceMatchSubCategorySelect(this.selectedCategory.id);
        }
        this.onSubCategotyChange(this.selectedCategory, {id: this.selectedCategory.id}, null);
      }
    });
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

  public EditOperationType() {
    this.onSubCategotyChange(this.selectedCategory, {id: this.selectedCategory.id}, 'EDITED');
  }

  public discardOperationType() {
    this.onSubCategotyChange(this.selectedCategory, {id: this.selectedCategory.id}, 'DISCARD');
  }

  public onSubCategotyChange(category: any, subCategory, type) {
    this.selectedRowDataId = [];
    this.selectedCategory = category;
    const url = this.getTableView(subCategory, type);
    this.showTable = false;
    this.httpService.get(url, true).subscribe(
      (data: any) => {
        this.masterView = data;
        this.searchFileds = data.filters;
        const viewDataUrl = this.getViewDataUrl(category, subCategory, type);
        this.dtOptions = Object.assign(this.dateTableService.getBasicTable(viewDataUrl, this.getColumnsDefinition(data.tableColumns))
          , {
            rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
              const self = this;
              $('td', row).unbind('click');
              $('td', row).bind('click', () => {
                self.onRowActionSelect(rowData);
              });
              return row;
            },
          });
        this.showTable = true;
      });
  }

  public updateDataStatus() {
    if (this.selectedRowDataId.length > 0) {
      const data = {
        status: status, rowIds: this.selectedRowDataId,
        category: this.selectedCategory.name, approvalSubCategory: this.id, type: this.type
      };
      const dialogRef = this.dialog.open(SubmitMultipleRowsComponent, {width: '50%', height: '40%', data});
      dialogRef.afterClosed().subscribe(result => {
        this.selectedRowDataId = [];
        this.cancel();
      });
    } else {
      this.httpService.displayErrorOnPopUp(ValidationConstant.SELECT_ATLEAST_ONE_ROW);
    }
  }

  public cancel() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  format(rowData) {
    const div = $('<div/>')
      .addClass('loading').addClass('table-detail-panal')
      .text('Loading...');

    this.httpService.get(this.getHistoryUrl(rowData), true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          if (!isNullOrUndefined(data.lastVersionData) && !isNullOrUndefined(data.sourceName)) {
            let html = '';
            html = html + this.getHtmlMasterDataDetail(data);
            div.html(html).removeClass('loading');
          } else {
            const html = this.getHtmlDataSourceDetail(data);
            div.html(html).removeClass('loading');
          }
        }
      }
    );
    return div;
  }

  private getHtmlMasterDataDetail(data: any): string {

    let page = '    <div class="col-md-12 left-pad2 right-pad2 source-detail-popup">\n' +
      '\n' +
      '      <div class="">\n' +
      '        <div class="">\n' +
      '          ' +
      '        </div>\n';
    const arr = data.lastVersionData;
    const source = arr[0];
    page += '<div class="row">\n' +
      '          <div class="col-md-12" style="margin-left: 22px"><h5></h5></div>\n' +
      '      </div>\n' +
      '      <div class="">\n' +
      '        <div class="panel panel-profile table-responsive border-none cover2 source-align">\n';
    const toKey = Object.keys(source);
    page += '        <table class="table history table-border-align" border="1"">' +
      '                 <thead> ' +
      '                     <tr>';
    for (let j = 0; j < toKey.length; j++) {
      if (j === 0) {
        page += '                 <th scope="col" class="bottom-th-border"></th>';
      }
      page += '                 <th scope="col"> ' + toKey[j] + '</th>';
    }
    page += '               </tr>' +
      '                 </thead>' +
      '                 <tbody>' +
      '                     <tr>';
    for (let j = 0; j < toKey.length; j++) {
      if (j === 0) {
        page += '                 <td scope="col" style="font-weight: bold;"> ' + data.sourceName + '</td>';
      }
      page += '                 <td scope="col"> ' + source[toKey[j]] + '</td>';
    }
    page += '               </tr>' +
      '                 </tbody>' +
      '              </table> ' +
      '          </div>\n' +
      '      </div>\n';
    page += '</div>' +
      '      </div>\n';
    return page;
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
        '        <div class="panel panel-profile table-responsive border-none cover2 source-align">\n' +

        '        <table class="table history table-border-align" border="1"">\n';
      for (let i = 0; i < data.length; i++) {
        const source = data[i].sourceData;
        const toKey = Object.keys(source);
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
          '                 <tbody>' +
          '                     <tr>';
        for (let j = 0; j < toKey.length; j++) {
          if (j === 0) {
            page += '                 <td scope="col" style="font-weight: bold;"> ' + data[i].sourceName + '</td>';
          }
          page += '                 <td scope="col"> ' + source[toKey[j]] + '</td>';
        }
        page += '               </tr>' +
          '                 </tbody>';
      }
      page += '              </table> ' +
        '          </div>\n' +
        '      </div>\n';

    }
    page += '</div>' +
      '      </div>\n';
    return page;
  }

  private getColumnsDefinition(dataa: any): any[] {
    const columns: any [] = [];
    let rest = 0;
    this.masterView.tableColumns.forEach((item, index) => {
      this.tableCoumnOrders.push({index: index, title: item.label, data: item.fieldName});
      if (rest === 0) {
        columns.push({
          title: '', data: 'id', orderable: false, bSortable: false, render: (data, type, full) => {
            const html = '<input type="checkbox" data-dataId="' + data + '" id="row-check" class="dt-checkboxes">';
            return html;
          }
        });
        for (const val of dataa) {
          if ((val.label === 'EDITED' && val.fieldName === 'invalid_data_type') ||
            (val.label === 'Master_data' && val.fieldName === 'Master_data') || (val.label === 'RECON' && val.fieldName === 'RECON')) {
            columns.push({
              title: 'ID', data: 'ID', size: 2, bSortable: false, render: (data, type, full) => {
                const html = '<a id ="detailBtn" class="details-control" data-id="' + data + '" href="javascript:void(0);" ' +
                  '> ' + data + ' </a>';
                return html;
              }
            });
          }
        }
      }
      rest = rest + 1;
      if (item.label !== 'TRAC_ID' && item.fieldName !== 'tracId' && item.fieldName !== 'ID') {
        if (item.fieldName === 'assigned_On') {
          columns.push({
            title: item.label, data: item.fieldName, bSortable: item.sorter, render: (data, type, full) => {
              return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
            }
          });
        } else if (item.label !== 'Invalid_data_type' && item.label !== 'EDITED' && item.label !== 'DISCARD'
          && item.label !== 'Master_data' && item.fieldName !== 'Master_data' && item.label !== 'RECON' && item.fieldName !== 'RECON'
          && item.label !== 'KNOCK_OFF' && item.fieldName !== 'KNOCK_OFF') {
          columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
        }
      }
    });
    return columns;
  }

  private onRowActionSelect(data: any) {
    $('table').unbind('click');
    this.onDetailButtonSelect();
    const that = this;
    jQuery('table').on('click', 'input', function () {
      const tr = $(this).closest('tr');
      that.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        const row = dtInstance.row(tr);
        if (jQuery(this).closest('tr').hasClass('row-selected')) {
          jQuery(this).closest('tr').removeClass('row-selected');
          const index: number = that.selectedRowDataId.indexOf(row.data()['tracId']);
          if (index !== -1) {
            that.selectedRowDataId.splice(index, 1);
          }
        } else {
          that.selectedRowDataId.push(row.data()['tracId']);
          jQuery(this).closest('tr').addClass('row-selected');
        }
      });
    });
  }

  private getHtmlForceMatch(): string {
    const html = '    <div class="col-md-12 left-pad2 right-pad2 source-detail-popup">\n' +
      '\n' +
      '      <div class="">\n' +
      '        <div class="">\n' +
      '          \n' +
      '        </div>\n';
    return html;
  }

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a#detailBtn', function () {
      const tr = $(this).closest('tr');
      that.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        const row = dtInstance.row(tr);
        if (row.child.isShown()) {
          row.child.hide();
          tr.removeClass('shown');
        } else {
          row.child(that.format(row.data())).show();
          tr.addClass('shown');
        }
      });
    });
  }

  private getTableView(subCategory, type): string {
    let url = '';
    switch (this.selectedCategory.name) {
      case ReconDataType[ReconDataType.EDIT_INVALID_DATA]:
        url = 'v1/invaliddataviews?Find=InvalidDataTrackerView&approvalSubCategoryId=' + subCategory.id + '&dataApprovalStatus=' + type;
        break;
      case ReconDataType[ReconDataType.RECONCILED]:
        if (this.selectedSourceId) {
          url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffView&approvalSubCategoryId=' + subCategory.id + '&sourceId=' + this.selectedSourceId + '&operationType=FORCE_MATCH';

        } else {
          url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffView&approvalSubCategoryId=' + subCategory.id + '&operationType=FORCE_MATCH';

        }
        break;
      case ReconDataType[ReconDataType.UNRECONCILED]:
        if (this.selectedSourceId) {
          url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffView&approvalSubCategoryId=' + subCategory.id + '&sourceId=' + this.selectedSourceId + '&operationType=FORCE_UNMATCH';
        } else {
          url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffView&approvalSubCategoryId=' + subCategory.id + '&operationType=FORCE_UNMATCH';
        }
        break;
      case ReconDataType[ReconDataType.KNOCK_OFF]:
        url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffView&approvalSubCategoryId=' + subCategory.id + '&operationType=KNOCK_OFF';
        break;
      case ReconDataType[ReconDataType.MASTER_DATA]:
        url = 'v1/masterdataviews?Find=MasterDataTrackerView&approvalSubCategoryId=' + subCategory.id;
        break;
      case ReconDataType[ReconDataType.DUPLICATE_MATCH_KNOCK_OFF]:
        if (this.selectedSourceId) {
          url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffView&approvalSubCategoryId=' + subCategory.id + '&sourceId=' + this.selectedSourceId + '&operationType=DUPLICATE_MATCH_KNOCK_OFF';

        } else {
          url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffView&approvalSubCategoryId=' + subCategory.id + '&operationType=DUPLICATE_MATCH_KNOCK_OFF';

        }
        break;
      default:
        break;
    }
    return url;
  }

  private getHistoryUrl(rowData): string {
    let url = '';
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
    switch (this.selectedCategory.name) {
      case ReconDataType[ReconDataType.EDIT_INVALID_DATA]:
        url = 'v1/datatrackers?Find=InvalidDataHistory&invalidDataTracker=' + rowData.tracId;
        break;
      case ReconDataType[ReconDataType.RECONCILED]:
        url = 'v1/datatrackers?Find=ForceMatchRelaxMatchAndUnMatchHistory&type=' + this.selectedCategory.name + '&reconDataTracker=' + rowData.tracId + '&module=PendingApproval&sourceId=' + rowData.sourceId;
        break;
      case ReconDataType[ReconDataType.UNRECONCILED]:
        url = 'v1/datatrackers?Find=ForceMatchRelaxMatchAndUnMatchHistory&type=' + this.selectedCategory.name + '&reconDataTracker=' + rowData.tracId + '&module=PendingApproval&sourceId=' + rowData.sourceId;
        break;
      case ReconDataType[ReconDataType.MASTER_DATA]:
        url = 'v1/datatrackers?Find=MasterDataHistory&masterDataTracker=' + rowData.tracId;
        break;
      case ReconDataType[ReconDataType.DUPLICATE_MATCH_KNOCK_OFF]:
        url = 'v1/datatrackers?Find=DataTrackerTrxnHistory&type=' + this.selectedCategory.name + '&reconDataTracker=' + rowData.tracId + '&module=PendingApproval&sourceId=' + rowData.sourceId;
        break;
      default:
        break;
    }
    return url;
  }

  private getViewDataUrl(category: any, subCategory, type: any): string {
    let url = '';
    switch (this.selectedCategory.name) {
      case ReconDataType[ReconDataType.EDIT_INVALID_DATA]:
        url = 'v1/datatrackers?Find=MasterAndInvalidData&approvalSubCategoryId=' + subCategory.id + '&type=INVALID_DATA' + '&dataApprovalStatus=' + type;
        break;
      case ReconDataType[ReconDataType.RECONCILED]:
        if (this.selectedSourceId) {
          url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffData&approvalSubCategoryId=' + subCategory.id + '&sourceId=' + this.selectedSourceId + '&operationType=FORCE_MATCH';
        } else {
          url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffData&approvalSubCategoryId=' + subCategory.id + '&operationType=FORCE_MATCH';
        }
        break;
      case ReconDataType[ReconDataType.UNRECONCILED]:
        if (this.selectedSourceId) {
          url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffData&approvalSubCategoryId=' + subCategory.id + '&sourceId=' + this.selectedSourceId + '&operationType=FORCE_UNMATCH';
        } else {
          url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffData&approvalSubCategoryId=' + subCategory.id + '&operationType=FORCE_UNMATCH';
        }
        break;
      case ReconDataType[ReconDataType.KNOCK_OFF]:
        url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffData&approvalSubCategoryId=' + subCategory.id + '&operationType=KNOCK_OFF';
        break;
      case ReconDataType[ReconDataType.MASTER_DATA]:
        url = 'v1/datatrackers?Find=MasterAndInvalidData&approvalSubCategoryId=' + subCategory.id + '&type=MASTER_DATA';
        break;
      case ReconDataType[ReconDataType.DUPLICATE_MATCH_KNOCK_OFF]:
        if (this.selectedSourceId) {
          url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffData&approvalSubCategoryId=' + subCategory.id + '&sourceId=' + this.selectedSourceId + '&operationType=DUPLICATE_MATCH_KNOCK_OFF';
        } else {
          url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffData&approvalSubCategoryId=' + subCategory.id + '&operationType=DUPLICATE_MATCH_KNOCK_OFF';
        }
        break;
      default:
        break;
    }
    return url;
  }

  onForceMatchSubCategorySelect(subCategoryId: string) {
    this.dataSources = [];
    this.httpService.get('v1/datasources?Find=ByReconSubCategory&subCategoryId=' + subCategoryId, true).subscribe(
      (data: any) => {
        this.dataSources = data.data;
      }
    );
  }
}
