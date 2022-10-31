import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DataTableDirective} from 'angular-datatables';
import {isNullOrUndefined} from 'util';
import {DatePipe} from '@angular/common';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../../shared/services/app.constants';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('tableContainer') tableContainer: ElementRef;
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public modules = [];
  public escalationTypes = ['EDIT_INVALID_DATA', 'RECONCILED', 'UNRECONCILED', 'REPORTS', 'KNOCK_OFF', 'MASTER_DATA', 'RELAX_MATCH'];

  constructor(private http: HttpService, private dateTableService: DataTableService, private datePipe: DatePipe, private filter: FilterService) {
  }

  ngOnInit() {
    this.http.get('v1/modules', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      });
    this.dtOptions = Object.assign(this.dateTableService.getBasicTable('v1/escalations', this.getColumnsDefinition()), {
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        const self = this;
        $('td', row).unbind('click');
        $('td', row).bind('click', () => {
          self.onRowActionSelect(data);
        });
        return row;
      }, retrieve: true
    });
  }

  public getToDatePickerConfig(fromDate: string): void {
    const date = AppConstants.getDateFromString(fromDate);
    this.getDatePickerConfigRestrictPastDate = AppConstants.getDatePickerConfig(false, date);
  }

  public searchByDate(val: string, columnIndex: number): void {
    this.filter.searchByDate(val, columnIndex, this.dtElement);
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  format(rowData) {
    const div = $('<div/>')
      .addClass('loading').addClass('table-detail-panal')
      .text('Loading...');

    this.http.get('v1/escalations/' + rowData.id, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          const url = this.genrateUrl(data, rowData);
          this.http.get(url, true).subscribe(
            (dataa: any) => {
              if (!isNullOrUndefined(dataa.lastVersionData) && !isNullOrUndefined(dataa.latestData)) {
                let html = this.getHtmlForTracker(data, 'Detail');
                html = html + this.getHtmlInvalidHistoryData(dataa.lastVersionData, 'Previous');
                html = html + this.getHtmlInvalidCurrentData(dataa.latestData, 'Current');
                div.html(html)
                  .removeClass('loading');
              } else if (!isNullOrUndefined(dataa.mappedRowOne)) {
                let html = this.getHtmlForReconTracker(data);
                html = html + this.getHtmlReconDataOne(dataa.mappedRowOne);
                if (!isNullOrUndefined(dataa.mappedRowTwo)) {
                  html = html + this.getHtmlReconDataTwo(dataa.mappedRowTwo);
                }
                if (!isNullOrUndefined(dataa.mappedRowThree)) {
                  html = html + this.getHtmlReconDataThree(dataa.mappedRowThree);
                }
                div.html(html)
                  .removeClass('loading');
              } else if (!isNullOrUndefined(dataa.rowData)) {
                const html = this.getHtmlDataSourceForceUnMatch(dataa.rowData, dataa.allSourceDetail);
                div.html(html)
                  .removeClass('loading');
              } else {
                const html = this.getHtmlReport(dataa);
                div.html(html)
                  .removeClass('loading');
              }
            }
          );
        }
      }
    );
    return div;
  }

  genrateUrl(data: any, rowData: any) {
    const forceMatch = 'FORCE_MATCH';
    const forceUnMatch = 'FORCE_UNMATCH';
    const knockOff = 'KNOCK_OFF';
    let url = '';
    switch (rowData.type) {
      case 'EDIT_INVALID_DATA':
        url = 'v1/datatrackers?Find=ByDataIdAndDataSource&dataId=' + data.dataIdOne + '&dataSourceId=' + data.datasourceOneId;
        break;
      case 'RECONCILED':
        url = 'v1/datatrackers?Find=MatchedKnockProposedHistory&type=' + rowData.type + '&reconDataTracker=' + data.reconDataTrackerId + '&module=' +
          'Escalation';
        break;
      case 'UNRECONCILED':
        url = 'v1/reconmapping?Find=ByRowAndSource&rowId=' + data.dataIdOne + '&sourceId=' + data.datasourceOneId;
        break;
      case 'PROPOSE_MATCH':
        url = 'v1/datatrackers?Find=MatchedKnockProposedHistory&type=' + rowData.type + '&reconDataTracker=' + data.reconDataTrackerId + '&module=Escalation';
        break;
      case 'Knock Off':
        url = 'v1/datatrackers?Find=MatchedKnockProposedHistory&type=' + rowData.type + '&reconDataTracker=' + data.reconDataTrackerId + '&module=Escalation';
        break;
      case 'MASTER_DATA':
        url = 'v1/datatrackers?Find=ByDataIdAndMasterSource&dataId=' + data.dataIdOne + '&dataSourceId=' + data.datasourceOneId;
        break;
      case 'REPORTS':
        url = 'v1/reportexecutions/' + data.reportExecutionId;
        break;
      default:
        break;
    }
    return url;
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'ID', data: 'id', bSortable: false, render: (data, type, full) => {
        const html = '<a id ="detailBtn" class="details-control" data-id="' + data + '" href="javascript:void(0);" ' +
          '> ' + data + ' </a>';
        return html;
      }
    });
    columns.push({title: 'MODULE NAME', data: 'moduleName'});
    columns.push({
      title: 'ESCALATION DATE', data: 'escalationDate', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
      }
    });
    columns.push({title: 'TYPE', data: 'type', bSortable: false});
    columns.push({title: 'USER', data: 'appuser', bSortable: false});
    columns.push({title: 'FROM DATE', data: 'fromDate', bSortable: false, visible: false});
    columns.push({title: 'TO DATE', data: 'toDate', bSortable: false, visible: false});
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
        }
      });
    });
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
          console.log(row.data());
          tr.addClass('shown');
        }
      });
    });
  }

  private getHtmlForTracker(data: any, title): string {
    let html = '<div class="row datatable-detail">\n' +
      '          </div><div class="row">\n' +
      '              <div class="col-md-12 ">\n';
    const toKey = Object.keys(data);
    for (const field of toKey) {
      if (field === 'datasourceOne' || field === 'datasourceTwo' || field === 'datasourceThree' || field === 'currentStatus') {
        if (!isNullOrUndefined(data[field])) {
          html = html + '<div class="col-md-3 form-group">\n' +
            '                  <div class="data-approval-inline">\n' +
            '                    <label>' + field + '</label> :\n' +
            '                    <span>' + data[field] + '</span>\n' +
            '                  </div>\n' +
            '                </div>';
        }
      }
    }
    html = html + '\n' +
      '              </div>\n' +
      '            </div>';
    return html;
  }

  private getHtmlInvalidHistoryData(data: any, title): string {
    let html = '<div class="row datatable-detail">\n' +
      '            <div class="col-md-12"><label>' + title + ' </label></div>\n' +
      '          </div><div class="row">\n' +
      '              <div class="col-md-12 ">\n';
    const toKey = Object.keys(data);
    for (const field of toKey) {
      html = html + '<div class="col-md-3 form-group">\n' +
        '                  <div class="data-approval-inline">\n' +
        '                    <label>' + field + '</label> :\n' +
        '                    <span>' + data[field] + '</span>\n' +
        '                  </div>\n' +
        '                </div>';
    }
    html = html + '\n' +
      '              </div>\n' +
      '            </div>';
    return html;
  }

  private getHtmlInvalidCurrentData(data: any, title): string {
    let html = '<div class="row datatable-detail">\n' +
      '            <div class="col-md-12"><label>' + title + ' </label></div>\n' +
      '          </div><div class="row">\n' +
      '              <div class="col-md-12 ">\n';
    const toKey = Object.keys(data);
    for (const field of toKey) {
      html = html + '<div class="col-md-3 form-group">\n' +
        '                  <div class="data-approval-inline">\n' +
        '                    <label>' + field + '</label> :\n' +
        '                    <span>' + data[field] + '</span>\n' +
        '                  </div>\n' +
        '                </div>';

    }
    html = html + '\n' +
      '              </div>\n' +
      '            </div>';
    return html;
  }

  private getHtmlForReconTracker(data: any): string {
    let html = '<div class="row datatable-detail">\n' +
      '          </div><div class="row">\n' +
      '              <div class="col-md-12 ">\n';
    const toKey = Object.keys(data);
    for (const field of toKey) {
      if (field === 'currentStatus') {
        if (!isNullOrUndefined(data[field])) {
          html = html + '<div class="col-md-3 form-group">\n' +
            '                  <div class="data-approval-inline">\n' +
            '                    <label>' + field + '</label> :\n' +
            '                    <span>' + data[field] + '</span>\n' +
            '                  </div>\n' +
            '                </div>';
        }
      }
    }
    html = html + '\n' +
      '              </div>\n' +
      '            </div>';
    return html;
  }

  private getHtmlReconDataOne(data: any): string {
    let html = '<div class="row datatable-detail">\n' +
      '            <div class="col-md-12"><label>' + data.dataSourceName + ' </label></div>\n' +
      '          </div><div class="row">\n' +
      '              <div class="col-md-12 ">\n';
    for (const element of data.dataElement) {
      const toKey = Object.keys(element);
      for (const field of toKey) {
        html = html + '<div class="col-md-3 form-group">\n' +
          '                  <div class="data-approval-inline">\n' +
          '                    <label>' + field + '</label> :\n' +
          '                    <span>' + element[field] + '</span>\n' +
          '                  </div>\n' +
          '                </div>';
      }
    }
    html = html + '\n' +
      '              </div>\n' +
      '            </div>';
    return html;
  }

  private getHtmlReconDataTwo(data: any): string {
    let html = '<div class="row datatable-detail">\n' +
      '            <div class="col-md-12"><label>' + data.dataSourceName + ' </label></div>\n' +
      '          </div><div class="row">\n' +
      '              <div class="col-md-12 ">\n';
    for (const element of data.dataElement) {
      const toKey = Object.keys(element);
      for (const field of toKey) {
        html = html + '<div class="col-md-3 form-group">\n' +
          '                  <div class="data-approval-inline">\n' +
          '                    <label>' + field + '</label> :\n' +
          '                    <span>' + element[field] + '</span>\n' +
          '                  </div>\n' +
          '                </div>';
      }
    }
    html = html + '\n' +
      '              </div>\n' +
      '            </div>';
    return html;
  }

  private getHtmlReconDataThree(data: any): string {
    let html = '<div class="row datatable-detail">\n' +
      '            <div class="col-md-12"><label>' + data.dataSourceName + ' </label></div>\n' +
      '          </div><div class="row">\n' +
      '              <div class="col-md-12 ">\n';
    for (const element of data.dataElement) {
      const toKey = Object.keys(element);
      for (const field of toKey) {
        html = html + '<div class="col-md-3 form-group">\n' +
          '                  <div class="data-approval-inline">\n' +
          '                    <label>' + field + '</label> :\n' +
          '                    <span>' + element[field] + '</span>\n' +
          '                  </div>\n' +
          '                </div>';
      }
    }
    html = html + '\n' +
      '              </div>\n' +
      '            </div>';
    return html;
  }

  private getHtmlDataSourceForceUnMatch(data: any, dataSource: any): string {
    let html = '<div class="row datatable-detail">\n' +
      '            <div class="col-md-12"><label>' + dataSource + '</label></div>\n' +
      '          </div><div class="row">\n' +
      '              <div class="col-md-12 ">\n';
    const toKey = Object.keys(data);
    for (const field of toKey) {
      html = html + '<div class="col-md-3 form-group">\n' +
        '                  <div class="data-approval-inline">\n' +
        '                    <label>' + field + '</label> :\n' +
        '                    <span>' + data[field] + '</span>\n' +
        '                  </div>\n' +
        '                </div>';
    }
    html = html + '\n' +
      '              </div>\n' +
      '            </div>';
    return html;
  }

  private getHtmlReport(data: any): string {
    let html = '<div class="row datatable-detail">\n' +
      '            <div class="col-md-12"></div>\n' +
      '          </div><div class="row">\n' +
      '              <div class="col-md-12 ">\n';
    const toKey = Object.keys(data);
    for (const field of toKey) {
      if (!isNullOrUndefined(data[field])) {
        html = html + '<div class="col-md-3 form-group">\n' +
          '                  <div class="data-approval-inline">\n' +
          '                    <label>' + field + '</label> :\n' +
          '                    <span>' + data[field] + '</span>\n' +
          '                  </div>\n' +
          '                </div>';
      }
    }
    html = html + '\n' +
      '              </div>\n' +
      '            </div>';
    return html;
  }
}
