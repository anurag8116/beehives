import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpErrorResponse} from '@angular/common/http';
import {DatePipe} from '@angular/common';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public recons = [];
  public modules: any[];
  public status = [{id: 'STARTED', name: 'Started'}, {id: 'RUNNING', name: 'Running'}, {id: 'FINISH', name: 'Finish'}];

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private datePipe: DatePipe,
              private filter: FilterService) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/reconiterations', this.getColumnsDefinition());
    this.httpService.get('v1/recons?start=0', true).subscribe(
      (data: any) => {
        this.recons = data.data;
      }
    );
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
    this.onActionButtonSelect();
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'ID', data: 'id', bSortable: false
    });
    columns.push({title: 'RECON', data: 'reconName', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'MODULE', data: 'moduleName', bSortable: false, render:  $.fn.dataTable.render.text()});
    columns.push({title: 'CYCLE', data: 'cycle', bSortable: false, render:  $.fn.dataTable.render.text()});
    columns.push({
      title: 'STARTED ON', data: 'executionStartTime', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }
    });
    columns.push({
      title: 'FINISHED ON', data: 'executionEndTime', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }
    });
    columns.push({title: 'EXECUTION STATUS', data: 'reconExecutionStatus'});
    columns.push({title: 'ITERATION STATUS', data: 'iterationStatus'});
    columns.push({
      title: 'ACTION', data: 'id', bSortable: false, render: (data, type, full) => {
        if (full.reconExecutionStatus === 'FINISH' && full.iterationStatus === 'STARTED') {
          return '<a class="btn btn activate-btn"  style="padding: 1px 15px;" #actionBtn id ="actionBtn" data-id="' + data + '" href="javascript:void(0);" ' +
            '> Close</a>';
        } else {
          return '';
        }
      }
    });
    return columns;
  }

  private onActionButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a#actionBtn', function () {
      const form = {id: jQuery(this).data('id')};
      that.httpService.put('v1/reconiterations', form, true).subscribe(
        (data: any) => {
          that.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.ajax.reload();
          });
          that.httpService.displaySuccessOnPopUp('Recon Iteration Successfully Updated !');
        },
        (errorResponse: HttpErrorResponse) => {
        }
      );
    });
  }
}
