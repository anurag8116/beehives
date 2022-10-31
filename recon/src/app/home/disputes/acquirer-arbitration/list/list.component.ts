import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {isNullOrUndefined} from 'util';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {HistoryComponent} from '../../../pop-up/history/history.component';
import {TransactionComponent} from '../../../pop-up/transaction/transaction.component';
import {ProcessComponent} from '../../../pop-up/process/process.component';
import {DatePipe} from '@angular/common';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public modules: any[] = [];
  public roles: any[] = [];
  public form: FormGroup;
  public status = ['CREATED', 'REJECT'];
  public stages = [{name: 'Accept', value: 'ACCEPT'}, {name: 'Reject', value: 'REJECT'}];
  public rowList: any[] = [];
  public idList: any[] = [];
  public isLoading: boolean;
  public showTable: any = false;
  public disputeListUrl: string;
  public processType: string;
  public heading: string;
  public selectedIndexForMod: number;

  constructor(private activatedRout: ActivatedRoute, private dateTableService: DataTableService, private filter: FilterService,
              private httpService: HttpService, private router: Router, private dialog: MatDialog, private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.httpService.get('v1/modules?start=0&length=1000', true).subscribe(
      (data: any) => {
        this.modules = data.data;
        this.DisplayFirstModuleData();
      });
    this.httpService.get('v1/roles?start=0&length=1000', true).subscribe(
      (data: any) => {
        this.roles = data.data;
      });

    this.activatedRout.params.subscribe((param: Params) => {
      this.processType = param['processType'] || null;
      switch (this.processType) {
        case 'CHARGE_BACK':
          this.disputeListUrl = 'v1/disputes?stage=CHARGE_BACK&type=RECEIVED&goodFaith=false&assign=true&module=';
          this.heading = 'Charge Back';
          this.DisplayFirstModuleData();
          this.select(0);
          break;
        case 'ARBITRATIONS':
          this.disputeListUrl = 'v1/disputes?stage=ARBITRATION&type=RECEIVED&assign=true&module=';
          this.heading = 'Arbitrations';
          this.DisplayFirstModuleData();
          this.select(0);
          break;
        case 'PRE_ARBITRATIONS':
          this.disputeListUrl = 'v1/disputes?stage=PRE_ARBITRATION&type=RECEIVED&assign=true&module=';
          this.heading = 'Pre-Arbitrations';
          this.DisplayFirstModuleData();
          this.select(0);
          break;
        case 'GOOD_FAITH':
          this.disputeListUrl = 'v1/disputes?stage=CHARGE_BACK&type=RECEIVED&goodFaith=true&assign=true&module=';
          this.heading = '  Good Faith';
          this.DisplayFirstModuleData();
          this.select(0);
          break;
        default :
          this.disputeListUrl = 'v1/disputes?assign=true&module=';
          this.DisplayFirstModuleData();
          this.select(0);
          break;
      }
      this.showTable = false;
    });
    this.form = new FormGroup({
      'remark': new FormControl(null),
      'status': new FormControl(null),
      'rowList': new FormArray([])
    });
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  select(index: number) {
    this.selectedIndexForMod = index;
  }

  public DisplayFirstModuleData() {
    for (const obj of this.modules) {
      this.onModuleChange(obj.id);
      break;
    }
  }

  public onModuleChange(id: number) {
    this.showTable = false;
    this.dtOptions = Object.assign(this.dateTableService.getBasicTable(this.disputeListUrl + id, this.getColumnsDefinition())
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
    setTimeout(() => {
      this.showTable = true;
    }, 0);
  }

  public showMessage(messageType: boolean = true) {
    if (messageType === true) {
      this.httpService.displayErrorOnPopUp('select at least one record ');
    } else {
      this.httpService.displayErrorOnPopUp('select only one record ');
    }
    // this.refreshTable();
  }

  public cancelMessage() {
    this.refreshTable();
    jQuery('#message-modal').modal('hide');
  }

  public onTransactionClick() {
    const checkIdCount = this.idList.length;
    if (checkIdCount === 0) {
      this.showMessage();
    } else if (checkIdCount > 1) {
      this.showMessage(false);
    } else {
      let id;
      for (const val of this.idList) {
        id = val;
      }
      const data = {id: id};
      const dialogRef = this.dialog.open(TransactionComponent, {width: '600px', height: '354px', data});
      dialogRef.afterClosed().subscribe(result => {
        this.refreshTable();
      });
    }
  }

  public refreshTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
    this.rowList = [];
    this.idList = [];
    this.form.reset();
  }

  // ------------------------------------------- Document -----------------------------
  public onDocument() {
    const checkIdCount = this.idList.length;
    if (checkIdCount === 0) {
      this.showMessage();
    } else {
      let id;
      for (const val of this.idList) {
        id = val.ids;
      }
      for (const vals of this.idList) {
        if (!isNullOrUndefined(vals)) {
          this.rowList.push({ids: vals});
        }
      }
      const data = {rowList: this.rowList};
      const dialogRef = this.dialog.open(ProcessComponent, {width: '600px', height: '448px', data});
      dialogRef.afterClosed().subscribe(result => {
        this.refreshTable();
      });
    }
  }

// ------------------------------------------- History -----------------------------
  public onHistory() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      let id;
      for (const val of this.idList) {
        id = val;
      }
      const data = {id: id};
      const dialogRef = this.dialog.open(HistoryComponent, {width: '800px', height: '368px', data});
      dialogRef.afterClosed().subscribe(result => {
        this.refreshTable();
      });
    }
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
      title: 'ID', data: 'id', orderable: false, render: (data, type, full) => {
        const html = '<a id ="detailBtn" data-id="' + data + '" href="javascript:void(0);" ' +
          '> ' + data + ' </a>';
        return html;
      }
    });
    columns.push({title: 'MODULE', data: 'module', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'CARD NUMBER', data: 'cardNumber', bSortable: false});
    columns.push({title: 'ACCOUNT NUMBER', data: 'accountNumber', bSortable: false});
    columns.push({title: 'CUSTOMER NAME', data: 'customerName', render:  $.fn.dataTable.render.text()});
    columns.push({
      title: 'CREATED ON', data: 'createdOn', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }
    });
    columns.push({title: 'STATUS', data: 'status'});
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
        const index: number = that.idList.indexOf(id);
        if (index !== -1) {
          that.idList.splice(index, 1);
        }
      } else {
        that.idList.push(id);
        jQuery(this).closest('tr').addClass('row-selected');
      }
    });
    jQuery('table').on('click', 'a#detailBtn', function () {
      that.router.navigate(['/home/disputes', 'dispute-detail', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }

}
