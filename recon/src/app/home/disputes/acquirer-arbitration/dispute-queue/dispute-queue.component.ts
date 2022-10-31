import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DataTableDirective} from 'angular-datatables';
import {isNullOrUndefined} from 'util';
import {DatePipe} from '@angular/common';
import {AssignDisputeToRoleComponent} from '../../../pop-up/assign-dispute-to-role/assign-dispute-to-role.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-dispute-queue',
  templateUrl: './dispute-queue.component.html'
})
export class DisputeQueueComponent implements OnInit {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public id: number;
  public modules: any[] = [];
  public disputeListUrl: string;
  public stage: string;
  public showModules: boolean;
  public showList: boolean;
  public idList: any[] = [];
  public rowList: any[] = [];
  public status = ['CREATED', 'REJECT'];
  public selectedIndexForMod: number;

  constructor(private activatedRout: ActivatedRoute, private dateTableService: DataTableService, private httpService: HttpService,
              private router: Router, private datePipe: DatePipe, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.chargebackClick(true);
  }

  select(index: number) {
    this.selectedIndexForMod = index;
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
    columns.push({title: 'MODULE', data: 'module'});
    columns.push({title: 'CARD NUMBER', data: 'cardNumber', bSortable: false});
    columns.push({title: 'ACCOUNT NUMBER', data: 'accountNumber', bSortable: false});
    columns.push({title: 'CUSTOMER NAME', data: 'customerName'});
    columns.push({
      title: 'CREATED ON', data: 'createdOn', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }
    });
    columns.push({title: 'STATUS', data: 'status'});
    return columns;
  }

  chargebackClick(isFirstTime = false) {
    this.showModules = true;
    this.disputeListUrl = 'v1/disputequeues?Find=ByUnassigned&stage=CHARGE_BACK&type=RECEIVED&goodFaith=false&assign=false&module=';
    this.moduleService(isFirstTime);
    this.select(0);
  }

  goodfaithClick() {
    this.showModules = true;
    this.disputeListUrl = 'v1/disputequeues?Find=ByUnassigned&stage=CHARGE_BACK&type=RECEIVED&goodFaith=true&assign=false&module=';
    this.moduleService();
    this.select(0);
  }

  prearbitrationClick() {
    this.showModules = true;
    this.disputeListUrl = 'v1/disputequeues?Find=ByUnassigned&stage=PRE_ARBITRATION&type=RECEIVED&assign=false&module=';
    this.moduleService();
    this.select(0);
  }

  arbitrationClick() {
    this.showModules = true;
    this.disputeListUrl = 'v1/disputequeues?Find=ByUnassigned&stage=ARBITRATION&type=RECEIVED&assign=false&module=';
    this.moduleService();
    this.select(0);
  }

  moduleService(isFirstTime = false) {
    this.httpService.get('v1/modules?start=0&length=1000', true).subscribe(
      (data: any) => {
        this.modules = data.data;
        for (const obj of this.modules) {
          this.onModuleChange(obj.id, isFirstTime);
          break;
        }
      });
  }

  public onModuleChange(id: number, isFirstTime) {
    this.id = id;
    this.showList = false;
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
      this.showList = true;
    }, 0);
    this.refreshTable(isFirstTime);
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

  public refreshTable(isFirstTime = false) {
    if (!isFirstTime) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.draw();
      });
      this.showList = false;
      this.rowList = [];
      this.idList = [];
    }
  }

  searchByStatus(module: string) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(7).search(module).draw();
    });
  }

  searchByName(module: string) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(5).search(module).draw();
    });
  }

  searchByAccount(module: string) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(4).search(module).draw();
    });
  }

  searchByCardNumber(module: string) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(3).search(module).draw();
    });
  }

  // ------------------------------------------- Assign -----------------------------
  public onAssignClick() {
    const checkIdCount = this.idList.length;
    if (checkIdCount === 0) {
      this.showMessage();
    } else {
      let id;
      for (const val of this.idList) {
        id = val.ids;
      }
      this.onSubmit();
    }
  }

  public showMessage() {
    this.httpService.displayErrorOnPopUp('Select at least one record ');
  }

  public onSubmit() {
    for (const vals of this.idList) {
      if (!isNullOrUndefined(vals)) {
        this.rowList.push({ids: vals});
      }
    }
    const data = {rowList: this.rowList};
    const dialogRef = this.dialog.open(AssignDisputeToRoleComponent, {width: '40%', height: '35%', data});
    dialogRef.afterClosed().subscribe(result => {
      this.rowList = [];
      this.refreshTable();
      this.showList = true;
    });
  }
}
