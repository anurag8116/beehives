import {Component, OnInit, ViewChild} from '@angular/core';
import {AppConstants} from '../../../../shared/services/app.constants';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {DataTableDirective} from 'angular-datatables';
import {Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import {MatDialog} from '@angular/material';
import {DatePipe} from '@angular/common';
import {AssignDisputeToRoleComponent} from '../../../pop-up/assign-dispute-to-role/assign-dispute-to-role.component';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-onus-queue',
  templateUrl: './onus-queue.component.html'
})
export class OnusQueueComponent implements OnInit {
  public modules: any[];
  public type = 'ONUS';
  public status = ['CREATED', 'REJECT'];
  public stages = [{name: 'Accept', value: 'ACCEPT'}, {name: 'Reject', value: 'REJECT'}];
  public rowList: any[] = [];
  public responseList: any[] = [];
  public isLoading: boolean;

  public id: number;
  public showTable: any = false;
  public dataSource: any;
  public dataSourceRecord: any[] = [];
  public showTransactionTable: any = false;
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public moduleId: number = null;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private router: Router,
              private datePipe: DatePipe, private dialog: MatDialog, private filter: FilterService) {
  }

  ngOnInit() {
    this.dtOptions = Object.assign(this.dateTableService.getBasicTable('v1/disputequeues?Find=ByUnassigned&type=ONUS&assign=false', this.getColumnsDefinition())
      , {
        rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
          const self = this;
          $('td', row).unbind('click');
          $('td', row).bind('click', () => {
            self.onDetailButtonSelect(rowData);
          });
          return row;
        },
      });

    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
        for (const mod of this.modules) {
          if (mod.name === 'Onus') {
            this.moduleId = mod.id;
          }
        }
      }
    );
  }
  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  public searchByDate(val: string, columnIndex: number): void {
    this.filter.searchByDate(val, columnIndex, this.dtElement);
  }

  public getToDatePickerConfig(fromDate: string): void {
    const date = AppConstants.getDateFromString(fromDate);
    this.getDatePickerConfigRestrictPastDate = AppConstants.getDatePickerConfig(false, date);
  }

  public refreshTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
    this.rowList = [];
    this.responseList = [];
    this.dataSourceRecord = [];
    this.showTransactionTable = false;
  }

  // -------------------------------- Assign -----------------------------------
  public onAssignClick() {
    const checkIdCount = this.responseList.length;
    if (checkIdCount === 0) {
      this.showProcessMessage();
    } else {
      let id;
      for (const val of this.responseList) {
        id = val.ids;
      }
      this.onSubmit();
    }
  }

  public showProcessMessage() {
    this.httpService.displayErrorOnPopUp('Select at least one record ');
    this.refreshTable();
  }

  public onSubmit() {
    this.isLoading = true;
    for (const vals of this.responseList) {
      if (!isNullOrUndefined(vals)) {
        this.rowList.push({ids: vals});
      }
    }
    const data = {rowList: this.rowList};
    const dialogRef = this.dialog.open(AssignDisputeToRoleComponent, {width: '40%', height: '35%', data});
    dialogRef.afterClosed().subscribe(result => {
      this.rowList = [];
      this.refreshTable();
    });
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: '', data: 'id', orderable: false, render: (data, type, full) => {
        const html = '<input type="checkbox" data-dataId="' + data + '" id="row-check" class="dt-checkboxes">';
        return html;
      }
    });
    columns.push({
      title: 'DISPUTE ID', data: 'id', orderable: false, render: (data, type, full) => {
        const html = '<a id ="detailBtn" data-id="' + data + '" href="javascript:void(0);" ' +
          '> ' + data + ' </a>';
        return html;
      }
    });
    columns.push({title: 'MODULE', data: 'module'});
    columns.push({title: 'CARD TYPE', data: 'cardType', bSortable: false});
    columns.push({title: 'TRANSACTION REF NO ', data: 'transactionSequenceId', bSortable: false});
    columns.push({
      title: 'CREATED ON', data: 'createdOn', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }
    });
    // columns.push({title: '', data: 'toDate', visible: false});
    columns.push({title: 'STATUS', data: 'status'});
    columns.push({title: 'FROM DATE', data: 'fromDate', bSortable: false, visible: false});
    columns.push({title: 'TO DATE', data: 'toDate', bSortable: false, visible: false});
    return columns;
  }

  private onDetailButtonSelect(rowData: any) {
    const id: number = rowData.id;
    $('table').unbind('click');
    const that = this;
    jQuery('table').on('click', 'input', function () {
      const tr = $(this).closest('tr');
      if (jQuery(this).closest('tr').hasClass('row-selected')) {
        jQuery(this).closest('tr').removeClass('row-selected');
        const index: number = that.responseList.indexOf(id);
        if (index !== -1) {
          that.responseList.splice(index, 1);
        }
      } else {
        that.responseList.push(id);
        jQuery(this).closest('tr').addClass('row-selected');
      }
    });
    jQuery('table').on('click', 'a#detailBtn', function () {
      that.router.navigate(['/home/disputes', 'dispute-detail', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }

}
