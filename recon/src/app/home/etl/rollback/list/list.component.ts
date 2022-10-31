import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {MenuService} from '../../../../shared/menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined, isNumber} from 'util';
import {DatePipe} from '@angular/common';
import {AppConstants} from '../../../../shared/services/app.constants';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private filter: FilterService,
              private menuService: MenuService, private router: Router, private route: ActivatedRoute, private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/rollbacks', this.getColumnsDefinition());
    this.onDetailButtonSelect();
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

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'ID', data: 'id', render: (data, type, full) => {
        const html = '<a id ="detailBtn" data-id="' + data + '" href="javascript:void(0);" ' +
          '> ' + data + ' </a>';
        return html;
      }
    });
    columns.push({title: 'PIPE LINE NAME', data: 'pipeLineName', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'MODULE', data: 'moduleList'});
    columns.push({
      title: 'ROLLBACK DATE', data: 'rollbackDate', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }
    });
    columns.push({title: 'FILE NAME', data: 'fileName', render:  $.fn.dataTable.render.text()});
    columns.push({
      title: 'EXE START DATE', data: 'executionStartDate', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }
    });
    columns.push({
      title: 'EXE STOP DATE', data: 'executionEndDate', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }
    });
    columns.push({title: 'STATUS', data: 'rollbackStatus'});
    columns.push({title: 'FROM ROLL', data: 'fromRollbackDate',  visible: false});
    columns.push({title: 'TO ROLL', data: 'toRollbackDate',  visible: false});
    return columns;
  }

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a', function () {
      that.menuService.action.next(jQuery(this).data('id'));
      that.router.navigate(['/home/etl', 'rollback', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }

}
