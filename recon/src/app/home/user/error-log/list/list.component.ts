import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DataTableDirective} from 'angular-datatables';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../../shared/services/app.constants';
import {DatePipe} from '@angular/common';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('tableContainer') tableContainer: ElementRef;
  public stackTrace: any = {};
  public errorLogTypes = ['NOTIFICATION', 'SERVICE'];
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();

  constructor(private http: HttpService, private dateTableService: DataTableService, private datePipe: DatePipe,
              private filter: FilterService) {
  }

  ngOnInit() {
    this.dtOptions = Object.assign(this.dateTableService.getDataTableFixColSIze('v1/errorlogs', this.getColumnsDefinition())
      , {
        rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
          const self = this;
          $('td:eq(5)', row).unbind('click');
          $('td:eq(5)', row).bind('click', () => {
            self.onDetailButtonSelect(rowData);
          });
          return row;
        },
      });
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  public searchByDate(val: string, columnIndex: number): void {
    this.filter.searchByDate(val, columnIndex, this.dtElement);
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({title: 'USER', data: 'userName', render:  $.fn.dataTable.render.text()});
    columns.push({
      title: 'CREATED ON', data: 'createdOn', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }
    });
    columns.push({title: 'COMPONENT', data: 'component', bSortable: false});
    columns.push({title: 'ERROR', data: 'error', bSortable: false});
    columns.push({title: 'TYPE', data: 'errorLogType', bSortable: false});
    columns.push({
      title: 'ACTION', data: 'id', bSortable: false, render: (data, type, full) => {
        const html = '  <a id ="detailBtn" data-id="' + full.id + '" href="javascript:void(0);"><i class="fa fa-info-circle" ,aria-hidden="true" style="font-size:24px"></i></a>';
        return html;
      }
    });
    columns.push({title: 'FROM DATE', data: 'fromDate', bSortable: false, visible: false});
    columns.push({title: 'TO DATE', data: 'toDate', bSortable: false, visible: false});
    return columns;
  }

  private onDetailButtonSelect(rowData: any) {
    const id: number = rowData.id;
    $('table').unbind('click');
    const that = this;
    jQuery('#stack-modal').modal('show');
    this.getApiData(id);
  }

  getApiData(id: number) {
    this.http.get('v1/errorlogs/' + id, true).subscribe(
      (data: any) => {
        this.stackTrace = data;
      }
    );
  }

  cancel() {
    jQuery('#stack-modal').modal('hide');
  }

  public getToDatePickerConfig(fromDate: string): void {
    const date = AppConstants.getDateFromString(fromDate);
    this.getDatePickerConfigRestrictPastDate = AppConstants.getDatePickerConfig(false, date);
  }

}
