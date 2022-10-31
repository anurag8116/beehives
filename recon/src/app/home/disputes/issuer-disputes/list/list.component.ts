import { RaisePreArbComponent } from './../../../pop-up/raise-pre-arb/raise-pre-arb.component';
import { ProcessDisputeComponent } from './../../../pop-up/process-dispute/process-dispute.component';
import { DisputeAdvanceComponent } from './../../../pop-up/dispute-advance/dispute-advance.component';
import { AuthService } from './../../../../shared/services/auth.service';
import {AfterViewChecked, AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HistoryComponent} from '../../../pop-up/history/history.component';
import {MatDialog} from '@angular/material';
import {TransactionComponent} from '../../../pop-up/transaction/transaction.component';
import {ChangeStatusComponent} from '../../../pop-up/change-status/change-status.component';
import {DocumentUploadComponent} from '../../../pop-up/document-upload/document-upload.component';
import {ViewResponseComponent} from '../../../pop-up/view-response/view-response.component';
import {DatePipe} from '@angular/common';
import {FilterService} from '../../../../shared/services/filter.service';
import {FormControl, FormGroup} from '@angular/forms';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../../shared/services/app.constants';
import {isNullOrUndefined} from 'util';
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {

  public id: number;
  public modules: any = [];
  public dataSources: any[] = [];
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public processType: string;
  public showTable: any = false;
  public idList: any[] = [];
  public filterStatus = [];
  public stages = [
    {name: 'charge Back', value: 'CHARGE_BACK'}
  ];
  public isLoading: boolean;
  public disputeListUrl: string;
  public disputeDocsListUrl: string;
  public heading: string;
  public disputeType = 'RAISED';
  public selectedIndexForMod = 0;
  public tableColumnOrder = [
    { title: '', data: 'checkbox_id', bSortable: false },
    { title: 'DISPUTE_ID', data: 'id', bSortable: false },
    { title: 'RAISED_BY', data: 'raisedBy', bSortable: false },
    { title: 'RRN', data: 'rrn', bSortable: false },
    { title: 'KIT_NUMBER', data: 'kitNumber', bSortable: false },
    { title: 'CUSTOMER_NAME', data: 'customerName', bSortable: true },
    { title: 'CUSTOMER_MOBILE', data: 'customerTelephone', bSortable: false },
    { title: 'CUSTOMER_EMAIL', data: 'customerEmail', bSortable: false },
    { title: 'REFUND_STATUS', data: 'refundStatus', bSortable: false },
    { title: 'STATUS', data: 'status', bSortable: false },
    { title: 'REVERSAL_DISPUTE', data: 'isReversalDispute', bSortable: false },
    { title: 'DUAL_DISPUTE', data: 'isDualDispute', bSortable: false },
    { title: 'FROM DATE', data: 'fromDate', bSortable: false },
    { title: 'TO DATE', data: 'toDate', bSortable: false },
    { title: 'M2P RAISED FROM DATE', data: 'm2pRaisedFromDate', bSortable: false },
    { title: 'M2P RAISED TO DATE', data: 'm2pRaisedToDate', bSortable: false }
  ];
  hasRoleCardOps = false;
  hasRoleCX = false;
  hasRoleM2p = false;
  redirectingToUrl = false;
  filterFormGroup: FormGroup = new FormGroup({
    isReversalDispute: new FormControl(false),
    rrn: new FormControl(null),
    kitNumber: new FormControl(null),
    customerName: new FormControl(null),
    customerTelephone: new FormControl(null),
    customerEmail: new FormControl(null),
    refundStatus: new FormControl(''),
    status: new FormControl(''),
    fromDate: new FormControl(null),
    toDate: new FormControl(null),
    m2pRaisedFromDate: new FormControl(null),
    m2pRaisedToDate: new FormControl(null),
    isDualDispute: new FormControl(false)
  });
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  private filterMap: Map<number, string> = new Map<number, string>();
  private filterDocsMap: Map<string, string> = new Map<string, string>();

  get fromDateControl(): FormControl {
    return this.filterFormGroup.controls.fromDate as FormControl;
  }

  get toDateControl(): FormControl {
    return this.filterFormGroup.controls.toDate as FormControl;
  }

  get m2pRaisedFromDateControl(): FormControl {
    return this.filterFormGroup.controls.m2pRaisedFromDate as FormControl;
  }

  get m2pRaisedToDateControl(): FormControl {
    return this.filterFormGroup.controls.m2pRaisedToDate as FormControl;
  }

  public docsDownload: boolean;
  private rejectedStatus: string[] = ['CHARGEBACK_DECLINED_BY_MERCHANT', 'CHARGEBACK_DECLINED_FOR_REFUNDED',
    'PRE_ARB_MERCHANT_REJECTED', 'PRE_ARB_DECLINED_FOR_REFUNDED', 'GOOD_FAITH_MERCHANT_REJECTED'];
  public rejectStatusSelected = false;

  constructor(private activatedRout: ActivatedRoute, private dateTableService: DataTableService, private httpService: HttpService,
              private router: Router, private dialog: MatDialog, private datePipe: DatePipe, private filter: FilterService,
              private authService: AuthService) {
    this.hasRoleCardOps = this.authService.hasRoleCardOps();
    this.hasRoleCX = this.authService.hasRoleCX();
    this.hasRoleM2p = this.authService.hasRoleM2p();
    // this.hasRoleCardOps = true;
    // this.hasRoleCX = true;
  }

  ngOnInit() {
    this.getDataSources();
    this.activatedRout.params.subscribe((param: Params) => {

      this.idList = [];
      this.processType = param['processType'] || null;
      let selectedIndex = 0;
      if (!isNullOrUndefined(this.getLocalStorageItem('selectedIndex'))) {
        selectedIndex = Number(JSON.parse(this.getLocalStorageItem('selectedIndex')));
      }

      switch (this.processType) {
        case 'ALL':
          this.stages = [];
          this.filterStatus = [];
          this.disputeListUrl = 'v1/disputes?stage=STAGE_NOT_ASSIGNED&assign=true&type=RAISED&dataSource=';
          this.disputeDocsListUrl = 'v1/disputes/docs?stage=STAGE_NOT_ASSIGNED&assign=true&type=RAISED&dataSource=';
          this.heading = 'Disputes';
          this.DisplayFirstModuleData();
          this.select(selectedIndex);
          break;
        case 'CHARGE_BACK':
          this.stages = [];
          if (this.hasRoleM2p) {
            this.filterStatus = [
              {label: 'APPROVED', value: 'APPROVED'},
              {label: 'REJECTED_BY_M2P', value: 'REJECTED_BY_M2P'},
              {label: 'CHARGEBACK RAISED (WAITING FOR REPLY FROM VISA)', value: 'CHARGEBACK_RAISED_WAITING_FOR_REPLY_FROM_VISA'},
              {label: 'CHARGEBACK DECLINED BY MERCHANT', value: 'CHARGEBACK_DECLINED_BY_MERCHANT'},
              {label: 'CHARGEBACK DECLINED FOR REFUNDED', value: 'CHARGEBACK_DECLINED_FOR_REFUNDED'},
              {label: 'CHARGEBACK PARTIALLY ACCEPTED', value: 'CHARGEBACK_PARTIALLY_ACCEPTED'},
              {label: 'CHARGEBACK MERCHANT ACCEPTED', value: 'CHARGEBACK_MERCHANT_ACCEPTED'},
              {label: 'CHARGEBACK DEEMED ACCEPTED', value: 'CHARGEBACK_DEEMED_ACCEPTED'},
              {label: 'CLOSED', value: 'CLOSED'}
            ];
          } else {
            this.filterStatus = [
              {label: 'CREATED', value: 'CREATED'},
              {label: 'SEND FOR APPROVAL', value: 'SEND_FOR_APPROVAL'},
              {label: 'APPROVED', value: 'APPROVED'},
              {label: 'REJECTED', value: 'REJECTED'},
              {label: 'REJECTED_BY_M2P', value: 'REJECTED_BY_M2P'},
              {label: 'CHARGEBACK RAISED (WAITING FOR REPLY FROM VISA)', value: 'CHARGEBACK_RAISED_WAITING_FOR_REPLY_FROM_VISA'},
              {label: 'CHARGEBACK DECLINED BY MERCHANT', value: 'CHARGEBACK_DECLINED_BY_MERCHANT'},
              {label: 'CHARGEBACK DECLINED FOR REFUNDED', value: 'CHARGEBACK_DECLINED_FOR_REFUNDED'},
              {label: 'CHARGEBACK PARTIALLY ACCEPTED', value: 'CHARGEBACK_PARTIALLY_ACCEPTED'},
              {label: 'CHARGEBACK MERCHANT ACCEPTED', value: 'CHARGEBACK_MERCHANT_ACCEPTED'},
              {label: 'CHARGEBACK DEEMED ACCEPTED', value: 'CHARGEBACK_DEEMED_ACCEPTED'},
              {label: 'CLOSED', value: 'CLOSED'}
            ];
          }
          this.disputeListUrl = 'v1/disputes?stage=CHARGE_BACK&type=RAISED&goodFaith=false&assign=true&dataSource=';
          this.disputeDocsListUrl = 'v1/disputes/docs?stage=CHARGE_BACK&type=RAISED&goodFaith=false&assign=true&dataSource=';
          this.heading = 'Charge Back';
          this.DisplayFirstModuleData();
          this.select(selectedIndex);
          break;
        case 'ARBITRATIONS':
          this.stages = [];
          this.filterStatus = [];
          this.disputeListUrl = 'v1/disputes?stage=ARBITRATION&type=RAISED&assign=true&dataSource=';
          this.disputeDocsListUrl = 'v1/disputes/docs?stage=ARBITRATION&type=RAISED&assign=true&dataSource=';
          this.heading = 'Arbitrations';
          this.DisplayFirstModuleData();
          this.select(selectedIndex);
          break;
        case 'PRE_ARBITRATION':
          this.stages = [];
          if (this.hasRoleM2p) {
            this.filterStatus = [
              {label: 'APPROVED', value: 'APPROVED'},
              {label: 'REJECTED_BY_M2P', value: 'REJECTED_BY_M2P'},
              {label: 'PRE-ARB RAISED (WAITING FOR REPLY FROM VISA)', value: 'PRE_ARB_RAISED_WAITING_FOR_REPLY_FROM_VISA'},
              {label: 'PRE-ARB MERCHANT REJECTED', value: 'PRE_ARB_MERCHANT_REJECTED'},
              {label: 'PRE-ARB DECLINED FOR REFUNDED', value: 'PRE_ARB_DECLINED_FOR_REFUNDED'},
              {label: 'PRE-ARB MERCHANT ACCEPTED', value: 'PRE_ARB_MERCHANT_ACCEPTED'},
              {label: 'PRE-ARB DEEMED ACCEPTED', value: 'PRE_ARB_DEEMED_ACCEPTED'},
              {label: 'CLOSED', value: 'CLOSED'}
            ];
          } else {
            this.filterStatus = [
              {label: 'CREATED', value: 'CREATED'},
              {label: 'SEND FOR APPROVAL', value: 'SEND_FOR_APPROVAL'},
              {label: 'APPROVED', value: 'APPROVED'},
              {label: 'REJECTED', value: 'REJECTED'},
              {label: 'REJECTED_BY_M2P', value: 'REJECTED_BY_M2P'},
              {label: 'PRE-ARB RAISED (WAITING FOR REPLY FROM VISA)', value: 'PRE_ARB_RAISED_WAITING_FOR_REPLY_FROM_VISA'},
              {label: 'PRE-ARB MERCHANT REJECTED', value: 'PRE_ARB_MERCHANT_REJECTED'},
              {label: 'PRE-ARB DECLINED FOR REFUNDED', value: 'PRE_ARB_DECLINED_FOR_REFUNDED'},
              {label: 'PRE-ARB MERCHANT ACCEPTED', value: 'PRE_ARB_MERCHANT_ACCEPTED'},
              {label: 'PRE-ARB DEEMED ACCEPTED', value: 'PRE_ARB_DEEMED_ACCEPTED'},
              {label: 'CLOSED', value: 'CLOSED'}
            ];
          }
          this.disputeListUrl = 'v1/disputes?stage=PRE_ARBITRATION&type=RAISED&assign=true&dataSource=';
          this.disputeDocsListUrl = 'v1/disputes/docs?stage=PRE_ARBITRATION&type=RAISED&assign=true&dataSource=';
          this.heading = 'Pre Arbitrations';
          this.DisplayFirstModuleData();
          this.select(selectedIndex);
          break;
        case 'GOOD_FAITH':
          this.stages = [];
          if (this.hasRoleM2p) {
            this.filterStatus = [
              {label: 'APPROVED', value: 'APPROVED'},
              {label: 'REJECTED_BY_M2P', value: 'REJECTED_BY_M2P'},
              {label: 'GOOD-FAITH RAISED (WAITING FOR REPLY FROM VISA)', value: 'GOOD_FAITH_RAISED_WAITING_FOR_REPLY_FROM_VISA'},
              {label: 'GOOD-FAITH MERCHANT REJECTED', value: 'GOOD_FAITH_MERCHANT_REJECTED'},
              {label: 'GOOD-FAITH MERCHANT ACCEPTED', value: 'GOOD_FAITH_MERCHANT_ACCEPTED'},
              {label: 'CLOSED', value: 'CLOSED'}
            ];
          } else {
            this.filterStatus = [
              {label: 'CREATED', value: 'CREATED'},
              {label: 'SEND FOR APPROVAL', value: 'SEND_FOR_APPROVAL'},
              {label: 'APPROVED', value: 'APPROVED'},
              {label: 'REJECTED', value: 'REJECTED'},
              {label: 'REJECTED_BY_M2P', value: 'REJECTED_BY_M2P'},
              {label: 'GOOD-FAITH RAISED (WAITING FOR REPLY FROM VISA)', value: 'GOOD_FAITH_RAISED_WAITING_FOR_REPLY_FROM_VISA'},
              {label: 'GOOD-FAITH MERCHANT REJECTED', value: 'GOOD_FAITH_MERCHANT_REJECTED'},
              {label: 'GOOD-FAITH MERCHANT ACCEPTED', value: 'GOOD_FAITH_MERCHANT_ACCEPTED'},
              {label: 'CLOSED', value: 'CLOSED'}
            ];
          }
          this.disputeListUrl = 'v1/disputes?stage=GOOD_FAITH&type=RAISED&goodFaith=true&assign=true&dataSource=';
          this.disputeDocsListUrl = 'v1/disputes/docs?stage=GOOD_FAITH&type=RAISED&goodFaith=true&assign=true&dataSource=';
          this.heading = 'Good Faith';
          this.DisplayFirstModuleData();
          this.select(selectedIndex);
          break;
        default :
          this.disputeListUrl = 'v1/disputes?assign=true&dataSource=';
          this.disputeDocsListUrl = 'v1/disputes/docs?assign=true&dataSource=';
          this.DisplayFirstModuleData();
          this.select(selectedIndex);
          break;
      }
      this.showTable = false;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.patchFilterFromStorage();
    }, 1000);
  }

  ngAfterViewChecked(): void {
    setTimeout(() => {
      $('.dataTables_wrapper').on('mousedown touchstart', '.paginate_button:not(.disabled)', () => {
        this.idList = [];
      });
    }, 100);
  }

  getDataSources() {
    this.httpService.get('v1/datasources', true).subscribe(
      (data: any) => {
        this.dataSources = data.data.filter((dataSource: any) => dataSource.id == 87 || dataSource.id == 91).map((dataSource: any) => {
          if (dataSource.id == 87) { dataSource.name = 'Old Bin (4844)'; }
          else if (dataSource.id == 91) { dataSource.name = 'New Bin (4251)'; }
          return dataSource;
        });
        this.DisplayFirstModuleData();
      }
    );
  }

  public getToDatePickerConfig(fromDate: string): void {
    const date = AppConstants.getDateFromString(fromDate);
    this.getDatePickerConfigRestrictPastDate = AppConstants.getDatePickerConfig(false, date);
  }

  public search(val: string, columnName: string): void {
    this.docsDownload = false;
    if (columnName === 'status') {
      this.rejectStatusSelected = this.rejectedStatus.includes(val);
    }
    const columnIndex = this.findColumnIndex(columnName);
    if (columnIndex >= 0 && !isNullOrUndefined(this.dtElement)) {
      this.filterMap.set(columnIndex, val);
      if (val == '' || val == 'false') {
        let value = this.filterDocsMap.get(columnName);
        if (value != null) {
          this.filterDocsMap.delete(columnName);
        }
      } else {
        this.filterDocsMap.set(columnName, val);
      }
      if (this.filterDocsMap.size > 0) {
        this.docsDownload = true;
      }
    this.filter.search(val, columnIndex, this.dtElement);
      this.idList = [];
    }
  }

  onCheckboxSelect(checked: boolean, columnName: string) {
    this.search(String(checked), columnName);
  }

  public searchByDate(value: string, columnName: string): void {
    const date = value ? this.httpService.driveDate(value) : '';
    this.search(date, columnName);
  }

  public searchByDateTime(value: string, columnName: string): void {
    const date = value ? this.datePipe.transform(value, 'dd-MM-yyyy hh:mm a') : '';
    this.search(date, columnName);
  }

  findColumnIndex(column: string) {
    return this.tableColumnOrder.findIndex(tableColumn => tableColumn.data === column);
  }

  select(index: number) {
    this.selectedIndexForMod = index;
  }

  public DisplayFirstModuleData() {
    let index = 0;
    for (const obj of this.dataSources) {
      if (index === this.selectedIndexForMod) {
      this.onModuleChange(obj.id);
      break;
    }
      ++index;
    }
  }

  public onModuleChange(id: number) {
    this.id = id;
    this.filterFormGroup.reset({isReversalDispute: false, refundStatus: '', status: '', isDualDispute: false});
    this.filterMap.clear();
    this.filterDocsMap.clear();
    this.docsDownload = false;
    this.showTable = false;

    this.idList = [];
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

  public onProcess() {
    const checkIdCount = this.idList.length;
    if (checkIdCount === 0) {
      this.showMessage();
    } else if (checkIdCount > 1) {
      this.showMessage(false);
    } else {
      const id = this.idList[0].id;
      const stage = this.idList[0].stage;
      const status = this.idList[0].status;
      const data = {rowList: [{ids: id}], stage: stage, status: status};

      const dialogRef = this.dialog.open(ChangeStatusComponent, {width: '600px', height: '317px', data});
      dialogRef.afterClosed().subscribe(result => {
        if (result && result == 'refresh') { this.refreshTable(); }
      });
      }
        }

  onRaiseByM2P() {
    const checkIdCount = this.idList.length;
    if (checkIdCount === 0) {
      this.showMessage();
    } else if (checkIdCount > 1) {
      this.showMessage(false);
    } else {
      const disputeId = this.idList[0].id;
      const data = {rowList: [{ids: disputeId}], status: 'RAISED_BY_M2P', heading: 'M2P Response'};
      const dialogRef = this.dialog.open(ProcessDisputeComponent, {width: '600px', height: '317px', data});
      dialogRef.afterClosed().subscribe(result => {
        if (result && result == 'refresh') { this.refreshTable(); }
      });
    }
  }

  public refreshTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });

    this.idList = [];
  }

  onViewResponse() {
    const checkIdCount = this.idList.length;
    if (checkIdCount === 0) {
      this.showMessage();
    } else if (checkIdCount > 1) {
      this.showMessage(false);
    } else {
      const dialogRef = this.dialog.open(ViewResponseComponent, {width: '600px', height: '354px'});
      dialogRef.afterClosed().subscribe(result => {
        this.refreshTable();
      });
    }
  }

  onEdit() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      if (!this.hasRoleCardOps && this.idList[0].status !== 'CREATED' && this.idList[0].status !== 'REJECTED' &&
        this.idList[0].status !== 'REJECTED_BY_M2P') {
        this.httpService.displayErrorOnPopUp('You can edit dispute only before send for approval.');
        return;
      }
      const disputeId = this.idList[0].id;
      const transactionId = this.idList[0].transactionId;
      const isArchive = this.idList[0].isArchive;
      const isReversalDispute = this.idList[0].isReversalDispute;
      const isDualDispute = this.idList[0].isDualDispute;
      this.saveFilterInStorage();
      this.router.navigate(['/home/disputes', 'issuer-disputes', {outlets: {'fullBodyOutlet': ['disputeform', this.id, transactionId, isArchive, 'RAISED', isReversalDispute, isDualDispute]}}], {queryParams: {disputeId: disputeId}});
    }
  }

  onDelete() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      const disputeId = this.idList[0].id;
      $.confirm({
        title: 'Are you sure you want to delete dispute', columnClass: 'col-md-4 col-md-offset-4', offsetBottom: 400, type: 'blue',
        buttons: {
          formSubmit: {
            text: 'Submit', btnClass: 'submit-btn', action: () => {
              this.httpService.delete('v1/disputes/' + disputeId, true).subscribe(
                (data: any) => {
                  this.httpService.displaySuccessOnPopUp('Dispute successfully deleted !');
                  this.refreshTable();
                });
            }
          },
          cancel: {
            btnClass: 'btn btn-primary cancel-btn', action: () => {}
          },
        },
      });
    }
  }

  onRaisePreArb() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      const disputeId = this.idList[0].id;
      const data = {id: disputeId};
      const dialogRef = this.dialog.open(RaisePreArbComponent, {width: '600px', height: '317px', data});
      dialogRef.afterClosed().subscribe(result => {
        if (result && result == 'refresh') { this.refreshTable(); }
      });
    }
  }

  onSendForApproval() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      const disputeId = this.idList[0].id;
      const data = {rowList: [{ids: disputeId}], status: 'SEND_FOR_APPROVAL', heading: 'Send for Approval'};
      const dialogRef = this.dialog.open(ProcessDisputeComponent, {width: '600px', height: '317px', data});
      dialogRef.afterClosed().subscribe(result => {
        if (result && result == 'refresh') { this.refreshTable(); }
      });
    }
  }

  onApprove() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      const disputeId = this.idList[0].id;
      const data = {rowList: [{ids: disputeId}], status: 'APPROVED', heading: 'Approve'};
      const dialogRef = this.dialog.open(ProcessDisputeComponent, {width: '600px', height: '317px', data});
      dialogRef.afterClosed().subscribe(result => {
        if (result && result == 'refresh') { this.refreshTable(); }
      });
    }
  }

  onReject() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      const disputeId = this.idList[0].id;
      const data = {rowList: [{ids: disputeId}], status: this.hasRoleM2p ? 'REJECTED_BY_M2P' : 'REJECTED', heading: 'Reject'};
      const dialogRef = this.dialog.open(ProcessDisputeComponent, {width: '600px', height: '317px', data});
      dialogRef.afterClosed().subscribe(result => {
        if (result && result == 'refresh') { this.refreshTable(); }
      });
    }
  }

  onCloseDispute() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      const disputeId = this.idList[0].id;
      const data = {rowList: [{ids: disputeId}], status: 'CLOSED', heading: 'Close Dispute'};
      const dialogRef = this.dialog.open(ProcessDisputeComponent, {width: '600px', height: '450px', data});
      dialogRef.afterClosed().subscribe(result => {
        if (result && result == 'refresh') { this.refreshTable(); }
      });
    }
  }

  onAdvancePayment() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      const disputeId = this.idList[0].id;
      const data = {id: disputeId};
      const dialogRef = this.dialog.open(DisputeAdvanceComponent, {width: '600px', height: '317px', data});
      dialogRef.afterClosed().subscribe(result => {
        if (result && result == 'refresh') { this.refreshTable(); }
      });
    }
  }

  onRefundProcess() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      const disputeId = this.idList[0].id;
      const data = {rowList: [{ids: disputeId}], status: 'REFUND_PROCESSED', heading: 'Process Refund'};
      const dialogRef = this.dialog.open(ProcessDisputeComponent, {width: '600px', height: '450px', data});
      dialogRef.afterClosed().subscribe(result => {
        if (result && result == 'refresh') { this.refreshTable(); }
      });
    }
  }

  public onTransactionClick() {
    const checkIdCount = this.idList.length;
    if (checkIdCount === 0) {
      this.showMessage();
    } else if (checkIdCount > 1) {
      this.showMessage(false);
    } else {
      const id = this.idList[0].id;
      const data = {id: id};
      this.dialog.open(TransactionComponent, {width: '600px', height: '354px', data});
    }
  }

  public onHistory() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      let id;
      for (const val of this.idList) {
        id = val.id;
      }
      const data = {id: id, disputeId: id};
      this.dialog.open(HistoryComponent, {width: '900px', height: '568px', data});
    }
  }

  public showMessage(messageType: boolean = true) {
    if (messageType === true) {
      this.httpService.displayErrorOnPopUp('Select at least one record ');
    } else {
      this.httpService.displayErrorOnPopUp('select only one record ');
    }
  }

  public onDocument() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      const data = {rowList: [{ids: this.idList[0].id}]};
      const dialogRef = this.dialog.open(DocumentUploadComponent, {width: '600px', height: '229px', data});
      dialogRef.afterClosed().subscribe(result => {
        if (result && result == 'refresh') { this.refreshTable(); }
      });
    }
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    this.tableColumnOrder.forEach((column) => {
      if (column.data === 'checkbox_id') {
    columns.push({
      title: '', data: 'id', orderable: false, render: (data, type, full) => {
        const html = '<input type="checkbox" data-dataId="' + data + '" id="row-check" class="dt-checkboxes">';
        return html;
      }
    });
      } else if (column.data === 'id') {
    columns.push({
          title: column.title, data: 'id', orderable: false, render: (data, type, full) => {
        const html = '<a id ="detailBtn" data-id="' + data + '" href="javascript:void(0);" ' +
          '> ' + data + ' </a>';
        return html;
      }
    });
      } else if (column.data === 'fromDate' || column.data === 'toDate'
        || column.data === 'm2pRaisedFromDate' || column.data === 'm2pRaisedToDate') {
        columns.push({title: column.title, data: column.data,
          render: (data, type, full) => {
            return '';
          }, bSortable: false, visible: false});
      } else if (column.data === 'isReversalDispute') {
        columns.push({title: column.title, data: column.data,
          render: (data, type, full) => {
            return '';
          }, bSortable: column.bSortable, visible: false});
      }  else if (column.data === 'isDualDispute') {
        columns.push({title: column.title, data: column.data,
          render: (data, type, full) => {
            return '';
          }, bSortable: column.bSortable, visible: false});
      } else {
        columns.push({title: column.title, data: column.data, bSortable: column.bSortable});
      }
    });
    return columns;
  }

  private onDetailButtonSelect(rowData: any) {
    const id: number = rowData.id;
    const status: string = rowData.status;
    const stage: string = rowData.stage;
    const transactionId: number = rowData.transactionId;
    const isArchive: boolean = rowData.isArchive;
    const isReversalDispute: boolean = rowData.isReversalDispute;
    const isDualDispute: boolean = rowData.isDualDispute;
    $('table').unbind('click');
    const that = this;
    jQuery('table').on('click', 'input', function () {
      const tr = $(this).closest('tr');
      if (jQuery(this).closest('tr').hasClass('row-selected')) {
        jQuery(this).closest('tr').removeClass('row-selected');
        const index = that.idList.findIndex((data) => data.id == id);
        if (index !== -1) {
          that.idList.splice(index, 1);
        }
      } else {
        that.idList.push({ id: id, status: status, stage: stage, transactionId: transactionId, isArchive: isArchive, isReversalDispute: isReversalDispute, isDualDispute: isDualDispute });
        jQuery(this).closest('tr').addClass('row-selected');
      }
    });
    this.saveFilterInStorage();
    jQuery('table').on('click', 'a#detailBtn', function () {
      that.router.navigate(['/home/disputes', 'dispute-detail', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }

  saveFilterInStorage() {
    this.redirectingToUrl = true;
    this.clearLocalStorageItem();
    localStorage.setItem('selectedIndex', JSON.stringify(this.selectedIndexForMod));
    localStorage.setItem('formData', JSON.stringify(this.filterFormGroup.getRawValue()));
    if (this.filterMap.size > 0) {
      localStorage.setItem('filterData', JSON.stringify(Array.from(this.filterMap.entries())));
    }
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      localStorage.setItem('dtPageInfo', JSON.stringify(dtInstance.page.info()));
    });
  }

  patchFilterFromStorage() {
    if (!isNullOrUndefined(this.getLocalStorageItem('formData'))) {
      const formData = JSON.parse(this.getLocalStorageItem('formData'));
      this.filterFormGroup.patchValue(formData);
      this.rejectStatusSelected = this.rejectedStatus.includes(this.filterFormGroup.value.status);
    }
    if (!isNullOrUndefined(this.getLocalStorageItem('filterData'))) {
      const filterData = JSON.parse(this.getLocalStorageItem('filterData'));
      this.filterMap = new Map(filterData);
      const {page, length} = JSON.parse(this.getLocalStorageItem('dtPageInfo'));
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        this.filterMap.forEach((searchdata, columnIndex) => {
          dtInstance.columns(columnIndex).search(searchdata);
        });
        dtInstance.page(page);
        dtInstance.page.len(length);
        dtInstance.draw(false);
      });
    } else if (!isNullOrUndefined(this.getLocalStorageItem('dtPageInfo'))) {
      const {page, length} = JSON.parse(this.getLocalStorageItem('dtPageInfo'));
/*      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.page(page);
        dtInstance.page.len(length);
        dtInstance.draw(false);
      });*/
    }
    this.clearLocalStorageItem();
  }

  getLocalStorageItem(key) {
    return localStorage.getItem(key);
  }

  clearLocalStorageItem() {
    localStorage.removeItem('selectedIndex');
    localStorage.removeItem('formData');
    localStorage.removeItem('filterData');
    localStorage.removeItem('dtPageInfo');
  }

  ngOnDestroy() {
    if (!this.redirectingToUrl) {
      this.clearLocalStorageItem();
    }
  }

  downloadRejectedDisputeFiles() {
    const checkIdCount = this.idList.length;
    if (checkIdCount === 0) {
      this.showMessage();
    }
    const ids = [];
    for (const data of this.idList) {
      ids.push(data.id);
    }
    this.httpService.get('v1/disputes?Operation=DownloadRejectedDisputesDocs&disputeIds=' + ids, true).subscribe( action => {
      const blob = AppConstants.base64ToBlob(action.path, action.filename);
      FileSaver.saveAs(blob, action.filename);
      this.httpService.displaySuccessOnPopUp('Downloaded.');
    });
    this.httpService.displaySuccessOnPopUp('Downloading started.');

  }

  downloadAll() {
    const filterDocsMap = {};
    this.filterDocsMap.forEach((val: string, key: string) => {
      filterDocsMap[key] = val;
    });
    this.httpService.post(this.disputeDocsListUrl + this.id, filterDocsMap, true).subscribe( action => {
        const blob = AppConstants.base64ToBlob(action.path, action.filename);
        FileSaver.saveAs(blob, action.filename);
        this.httpService.displaySuccessOnPopUp('Downloaded.');
      });
    this.httpService.displaySuccessOnPopUp('Downloading started.');
  }
}
