import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DatePipe} from '@angular/common';
import {ActivatedRoute, Params} from '@angular/router';
import {isNullOrUndefined} from 'util';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl, FormGroup} from '@angular/forms';
import {SubmitMultipleRowsComponent} from '../../../pop-up/submit-multiple-rows/submit-multiple-rows.component';
import {ValidationConstant} from '../../../../shared/services/validation-constant';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-relax-match',
  templateUrl: './relax-match.component.html'
})
export class RelaxMatchComponent implements OnInit {

  private type = 'PANDING_APPROVAL';

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public isLoading: boolean;
  public selectedCategory = null;
  public id: any;
  public selectedRowDataId: number[] = [];
  public showTable: any = false;
  public html: String;
  public masterView: any;
  public searchFileds: any = [];
  public tableCoumnOrders: any = [];
  public dataSourceId = null;
  public isShown: boolean;
  public form: FormGroup;

  constructor(private httpService: HttpService, private dateTableService: DataTableService, private datePipe: DatePipe,
              private activeRoute: ActivatedRoute, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      'description': new FormControl(null),
    });
    this.isLoading = false;
    this.activeRoute.params.subscribe((param: Params) => {
      this.activeRoute.queryParams.subscribe(params => {
        this.id = +params['id'] || null;
        this.selectedCategory = {id: +params['id'] || null, name: params['category']};
      });
      this.onSubCategotyChange(this.selectedCategory, {id: this.selectedCategory.id});
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

  public onSubCategotyChange(category: any, subCategory) {
    this.selectedRowDataId = [];
    this.selectedCategory = category;
    const url = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffView&approvalSubCategoryId=' + subCategory.id + '&operationType=RELAX_MATCH';
    this.showTable = false;
    this.httpService.get(url, true).subscribe(
      (data: any) => {
        this.masterView = data;
        this.searchFileds = data.filters;
        this.dataSourceId = data.datasourceVo.id;
        const viewDataUrl = 'v1/datatrackers?Find=ForceMatchUnMatchRelaxMatchAndKnockOffData&approvalSubCategoryId=' + subCategory.id + '&operationType=RELAX_MATCH';
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

  format(rowData) {
    const div = $('<div/>')
      .addClass('loading').addClass('table-detail-panal')
      .text('Loading...');
    const historyUrl = 'v1/datatrackers?Find=ForceMatchRelaxMatchAndUnMatchHistory&type=' + this.selectedCategory.name + '&reconDataTracker=' + rowData.tracId + '&module=PendingApproval&sourceId=' + this.dataSourceId;
    this.httpService.get(historyUrl, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          let html = '';
          html += this.getHtmlDataSourceDetail(data);
          div.html(html)
            .removeClass('loading');
        }
      }
    );
    return div;
  }

  public addDescription() {
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
         '        <table class="table history table-border-align" border="1">';
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
          '                 </tbody>' ;
      }
      page +=   '              </table> ' +
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
          title: '', data: 'id', orderable: false, render: (data, type, full) => {
            const html = '<input type="checkbox" data-dataId="' + data + '" id="row-check" class="dt-checkboxes">';
            return html;
          }
        });
        for (const val of dataa) {
          if ((val.label === 'EDITED' && val.fieldName === 'invalid_data_type') ||
            (val.label === 'Master_data' && val.fieldName === 'Master_data') || (val.label === 'RECON' && val.fieldName === 'RECON')) {
            columns.push({
              title: 'ID', data: 'ID', bSortable: false, render: (data, type, full) => {
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
        } else if (item.label !== 'RECON' && item.fieldName !== 'RECON') {
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
        if (that.selectedRowDataId.length > 0) {
          that.isShown = true;
        } else {
          that.isShown = false;
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
}
