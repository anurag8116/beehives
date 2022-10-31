import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {isNullOrUndefined} from 'util';
import {HttpErrorResponse} from '@angular/common/http';
import {AppConstants} from '../../../../shared/services/app.constants';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {HistoryComponent} from '../../../pop-up/history/history.component';
import {MatDialog} from '@angular/material';
import {TransactionComponent} from '../../../pop-up/transaction/transaction.component';
import {ProcessComponent} from '../../../pop-up/process/process.component';
import {DatePipe} from '@angular/common';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  public form: FormGroup;
  public modules: any[];
  public type = 'ONUS';
  public status = ['CREATED', 'ACCEPT', 'REJECT'];
  public stages = [{name: 'Accept', value: 'ACCEPT'}, {name: 'Reject', value: 'REJECT'}];
  public upload: FormGroup;
  public rowList: any[] = [];
  public responseList: any[] = [];
  public isLoading: boolean;
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public moduleId: number = null;
  public disputeType = 'ONUS';

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private router: Router,
              private dialog: MatDialog, private datePipe: DatePipe, private filter: FilterService) {
  }

  ngOnInit() {
    this.dtOptions = Object.assign(this.dateTableService.getBasicTable('v1/disputes?type=ONUS&assign=true', this.getColumnsDefinition())
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

    this.form = new FormGroup({
      'remark': new FormControl(null),
      'status': new FormControl(null),
      'rowList': new FormArray([])
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

    this.upload = new FormGroup({
      'id': new FormControl(null),
      'remark': new FormControl(null),
      'status': new FormControl(null),
      'document': new FormArray([
        new FormGroup({
          'path': new FormControl(null),
          'filename': new FormControl(null),
          'title': new FormControl(null)
        })
      ]),
      'rowList': new FormArray([])
    });
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
    this.upload.reset();
    this.form.reset();
  }

  // -------------------------------- Process -----------------------------------

  public onProcess() {
    const checkIdCount = this.responseList.length;
    if (checkIdCount === 0) {
      this.showMessage();
    } else {
      let id;
      for (const val of this.responseList) {
        id = val.ids;
      }
      for (const vals of this.responseList) {
        if (!isNullOrUndefined(vals)) {
          this.rowList.push({ids: vals});
        }
      }
      const data = {rowList: this.rowList, disputeType: this.type};
      const dialogRef = this.dialog.open(ProcessComponent, {width: '600px', height: '448px', data});
      dialogRef.afterClosed().subscribe(result => {
        this.refreshTable();
      });
    }
  }

  // -------------------------------- TRANSACTION -----------------------------------
  public onTransactionClick() {
    const checkIdCount = this.responseList.length;
    if (checkIdCount === 0) {
      this.showMessage();
    } else if (checkIdCount > 1) {
      this.showMessage(false);
    } else {
      let id;
      for (const val of this.responseList) {
        id = val;
      }
      const data = {id: id};
      const dialogRef = this.dialog.open(TransactionComponent, {width: '600px', height: '354px', data});
      dialogRef.afterClosed().subscribe(result => {
        this.refreshTable();
      });
    }
  }

  // -------------------------------- History -----------------------------------

  public onHistory() {
    const checkIdCount = this.responseList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      let id;
      for (const val of this.responseList) {
        id = val;
      }
      const data = {id: id};
      const dialogRef = this.dialog.open(HistoryComponent, {width: '800px', height: '368px', data});
      dialogRef.afterClosed().subscribe(result => {
        this.refreshTable();
      });
    }
  }

  public showMessage(messageType: boolean = true) {
    if (messageType === true) {
      this.httpService.displayErrorOnPopUp('select at least one record ');
    } else {
      this.httpService.displayErrorOnPopUp('select only one record ');
    }
    // this.refreshTable();
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
    columns.push({title: 'MODULE', data: 'module', render:  $.fn.dataTable.render.text()});
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
