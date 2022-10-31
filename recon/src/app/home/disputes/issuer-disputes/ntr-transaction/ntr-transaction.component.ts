import { HistoryComponent } from '../../../pop-up/history/history.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { AppConstants } from '../../../../shared/services/app.constants';
import {AfterViewChecked, Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import {DatePipe} from '@angular/common';
import {AuthService} from '../../../../shared/services/auth.service';
import {DisputeFormComponent} from '../../../pop-up/dispute-form/dispute-form.component';

@Component({
  selector: 'app-ntr-transaction',
  templateUrl: './ntr-transaction.component.html'
})
export class NtrTransactionComponent implements OnInit, AfterViewChecked {

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public dataSources: any[] = [];
  public selectedIndex: number;
  public showTable: any = false;
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  hasRoleCardOps = false;
  public tableCoumnsOrders = [
    {
        'title': '',
        'data': 'ID_CHK_BOX'
    },
    {
        'title': 'ID',
        'data': 'ID'
    },
    {
        'title': 'STATUS',
        'data': 'STATUS'
    },
    {
        'title': 'ACK STATUS',
        'data': 'ACK_STATUS'
    },
    {
        'title': 'CH',
        'data': 'CH'
    },
    {
        'title': 'TXN_DATE_AND_TIME',
        'data': 'TXN_DATE_AND_TIME'
    },
    {
        'title': 'CARD_NUMBER',
        'data': 'CARD_NUMBER'
    },
    {
        'title': 'PROXY_CARD_NUMBER',
        'data': 'PROXY_CARD_NUMBER'
    },
    {
        'title': 'ACTIVATION_DATE',
        'data': 'ACTIVATION_DATE'
    },
    {
        'title': 'MTI',
        'data': 'MTI'
    },
    {
        'title': 'PRODUCT_CODE',
        'data': 'PRODUCT_CODE'
    },
    {
        'title': 'TXN_CODE',
        'data': 'TXN_CODE'
    },
    {
        'title': 'BIN',
        'data': 'BIN'
    },
    {
        'title': 'TXN_POSTAL_DATE',
        'data': 'TXN_POSTAL_DATE'
    },
    {
        'title': 'TXN_REF_NO',
        'data': 'TXN_REF_NO'
    },
    {
        'title': 'TXN_DESCRIPTION',
        'data': 'TXN_DESCRIPTION'
    },
    {
        'title': 'TXN_CURRENCY',
        'data': 'TXN_CURRENCY'
    },
    {
        'title': 'TXN_AMOUNT',
        'data': 'TXN_AMOUNT'
    },
    {
        'title': 'BILLING_CURRENCY',
        'data': 'BILLING_CURRENCY'
    },
    {
        'title': 'BILLING_AMOUNT',
        'data': 'BILLING_AMOUNT'
    },
    {
        'title': 'DEBIT_CREDIT_INDICATOR',
        'data': 'DEBIT_CREDIT_INDICATOR'
    },
    {
        'title': 'EXCHANGE_RATE',
        'data': 'EXCHANGE_RATE'
    },
    {
        'title': 'AUTH_ID',
        'data': 'AUTH_ID'
    },
    {
        'title': 'NETWORK',
        'data': 'NETWORK'
    },
    {
        'title': 'MCC',
        'data': 'MCC'
    },
    {
        'title': 'EXCHANGE_RATE_1',
        'data': 'EXCHANGE_RATE_1'
    },
    {
        'title': 'MERCHANT_ID',
        'data': 'MERCHANT_ID'
    },
    {
        'title': 'MERCHANT_NAME_LOCATION',
        'data': 'MERCHANT_NAME_LOCATION'
    },
    {
        'title': 'TERMINAL_ID',
        'data': 'TERMINAL_ID'
    },
    {
        'title': 'MERCHANT_COUNTRY_CODE',
        'data': 'MERCHANT_COUNTRY_CODE'
    },
    {
        'title': 'RESP_CODE',
        'data': 'RESP_CODE'
    },
    {
        'title': 'TXN_STATUS',
        'data': 'TXN_STATUS'
    },
    {
        'title': 'RRN',
        'data': 'RRN'
    },
    {
        'title': 'STAN',
        'data': 'STAN'
    },
    {
        'title': 'DESCRIPTION',
        'data': 'DESCRIPTION'
    },
    {
        'title': 'NWDATA',
        'data': 'NWDATA'
    },
    {
        'title': 'TXN_STATUS_ACK',
        'data': 'TXN_STATUS_ACK'
    },
    {
        'title': 'SETTLEMENT_STATUS',
        'data': 'SETTLEMENT_STATUS'
    },
    {
        'title': 'SETTLEMENT_DATE',
        'data': 'SETTLEMENT_DATE'
    },
    {
        'title': 'SETTLEMENT_AMOUNT',
        'data': 'SETTLEMENT_AMOUNT'
    },
    {
        'title': 'SOURCE',
        'data': 'SOURCE'
    },
    {
        'title': 'AUTH_TCC',
        'data': 'AUTH_TCC'
    },
    {
        'title': 'FROM DATE',
        'data': 'fromTrxn'
    },
    {
        'title': 'TO DATE',
        'data': 'toTrxn'
    },
    {
        'title': 'VIEW ARCHIVE DATA',
        'data': 'isArchive'
    },
    {
        'title': 'VIEW REVERSAL TXN',
        'data': 'isReversalTxn'
    }
    ];
  form: FormGroup = this.fb.group({
    isArchive: this.fb.control(false),
    isReversalTxn: this.fb.control(false),
    nwData: this.fb.control(null),
    rrn: this.fb.control(null),
    kitNo: this.fb.control(null),
    fromDate: this.fb.control(null),
    toDate: this.fb.control(null),
  });
  get isReversalTxnControl(): FormControl {
    return this.form.controls.isReversalTxn as FormControl;
  }
  selectedTransaction: {transactionId: number, isArchive: number}[] = [];
  dataSourceId: number;
  filterData: Map<number, string> = new Map<number, string>();

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private router: Router,
              private datePipe: DatePipe, private elRef: ElementRef, private fb: FormBuilder, private dialog: MatDialog,
              private authService: AuthService) {
    this.hasRoleCardOps = this.authService.hasRoleCardOps();
  }

  ngOnInit() {
    this.getDataSources();
    this.select(0);
  }

  ngAfterViewChecked(): void {
    setTimeout(() => {
      this.elRef.nativeElement.querySelectorAll('input#trxnCheckbox ').forEach((item) => {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          const transactionId = $(item).data('id');
          const isArchive = $(item).data('archive');

          const index = this.selectedTransaction.findIndex((transaction) => transaction.transactionId == transactionId);
          if (index >= 0) {
            this.selectedTransaction.splice(index, 1);
          } else {
            this.selectedTransaction.push({transactionId: transactionId, isArchive: isArchive});
          }
        });
      });
      $('.dataTables_wrapper').on('mousedown touchstart', '.paginate_button:not(.disabled)', () => {
        this.selectedTransaction = [];
      });
    }, 100);
  }

  getDataSources() {
    this.httpService.get('v1/datasources', true).subscribe(
      (data: any) => {
        this.dataSources = data.data.filter((dataSource: any) => dataSource.id == 87 || dataSource.id == 91).map((dataSource: any) => {
          if (dataSource.id == 87) { dataSource.name = 'Old Bin (4844)'; } else if (dataSource.id == 91) { dataSource.name = 'New Bin (4251)'; }
          return dataSource;
        });

        for (const dataSource of this.dataSources) {
          this.onSelectDataSource(dataSource.id);
          break;
        }
      }
    );
  }

  onFilterTransaction() {
    const kitNo = this.form.controls.kitNo.value;
    const fromDate = this.form.controls.fromDate.value;
    const toDate = this.form.controls.toDate.value;
    if (kitNo) {
      if (!fromDate) {
        this.httpService.displayErrorOnPopUp('Select from date.');
        return;
      }
      if (!toDate) {
        this.httpService.displayErrorOnPopUp('Select to date.');
        return;
      }
    }
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.filterData.forEach((value, index) => {
          dtInstance.columns(index).search(value || '');
      });
      dtInstance.draw();
    });
    this.selectedTransaction = [];
  }

  select(index: number) {
    this.selectedIndex = index;
  }

  onCheckboxSelect(checked: boolean, searchField: string) {
    const index = this.findColumnIndex(searchField);
    if (index >= 0) { this.filterData.set(index, String(checked)); }
  }

  public search(value: string, searchField: string): void {
    const index = this.findColumnIndex(searchField);
    if (index >= 0) { this.filterData.set(index, value); }
  }

  public searchByDate(value: string, searchField: string): void {
    const index = this.findColumnIndex(searchField);
    const date = value ? this.httpService.driveDate(value) : null;
    if (index >= 0) { this.filterData.set(index, date); }
  }

  findColumnIndex(column: string) {
    return this.tableCoumnsOrders.findIndex(tableColumn => tableColumn.data === column);
  }

  onRaiseDispute(isReversalDispute: boolean, isDualDispute: boolean) {
    if (this.selectedTransaction.length <= 0) {
      this.showMessage();
      return;
    } else if (this.selectedTransaction.length > 1) {
      this.showMessage(false);
      return;
    }

    if (isReversalDispute && !this.isReversalTxnControl.value) {
      this.httpService.displayErrorOnPopUp('Select reversal txn !!!');
      return;
    }

    if (!isReversalDispute && this.isReversalTxnControl.value) {
      this.httpService.displayErrorOnPopUp('Select settled txn !!!');
      return;
    }

    const transactionId = this.selectedTransaction[0].transactionId;
    const isArchive = this.selectedTransaction[0].isArchive == 1;

    const data = { disputeId: null, dataSourceId: this.dataSourceId, transactionId: transactionId,
      isArchive: isArchive, isReversalDispute: isReversalDispute, disputeType: 'RAISED', isDualDispute: isDualDispute};
    const dialogRef = this.dialog.open(DisputeFormComponent, {width: '1200px', maxWidth: '1200px', height: '600px', disableClose: true, data});
    dialogRef.afterClosed().subscribe(result => {
      if (result && result === 'refresh') { this.cancel(); }
    });
    // this.router.navigate(['/home/disputes', 'issuer-disputes', {outlets: {'fullBodyOutlet': ['disputeform', this.dataSourceId, transactionId, isArchive, 'RAISED', isReversalDispute]}}]);
  }

  public showMessage(messageType: boolean = true) {
    if (messageType === true) {
      this.httpService.displayErrorOnPopUp('Select at least one record ');
    } else {
      this.httpService.displayErrorOnPopUp('select only one record ');
    }
  }

  onViewHistory() {
    if (this.selectedTransaction.length <= 0) {
      this.showMessage();
      return;
    } else if (this.selectedTransaction.length > 1) {
      this.showMessage(false);
      return;
    }
    const data = { transactionId: this.selectedTransaction[0].transactionId, dataSourceId: this.dataSourceId };
    this.dialog.open(HistoryComponent, {width: '900px', height: '568px', data});
  }

  public getToDatePickerConfig(fromDate: string): void {
    const date = AppConstants.getDateFromString(fromDate);
    this.getDatePickerConfigRestrictPastDate = AppConstants.getDatePickerConfig(false, date);
  }

  public onSelectDataSource(dataSourceId: number): void {
    this.showTable = false;
    this.dataSourceId = dataSourceId;
    this.form.reset();
    this.filterData.clear();

      const today = new Date();
      const pastDate = new Date(today.setDate(today.getDate() - 5));
      const fromDateNew = this.httpService.driveDate(pastDate.toString());
      this.form.patchValue({fromDate: fromDateNew});
      this.searchByDate(pastDate.toString(), 'fromTrxn');
      const toDateNew = this.httpService.driveDate(new Date().toString());
      this.form.patchValue({toDate: toDateNew});
      this.searchByDate(new Date().toString(), 'toTrxn');

    setTimeout(() => {
      const url = 'v1/ntrtransaction?dataSourceId=' + dataSourceId;
      this.dtOptions = Object.assign(this.dateTableService.getBasicTable(url, this.getColumnsDefinition()),
        {searchCols: this.getSearchColumns()});
      this.showTable = true;
    }, 100);
    this.selectedTransaction = [];

  }

  refresh() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  public cancel() {
    this.refresh();
    this.selectedTransaction = [];
  }

  getSearchColumns(): any [] {
    const columns: any [] = [];

    this.tableCoumnsOrders.forEach((value) => {
      let filterValue = null;
      if (value.data === 'fromTrxn' || value.data === 'toTrxn') {
        const index = this.findColumnIndex(value.data);
        if (index >=0 ) filterValue = {search: this.filterData.get(index)};
      }
      columns.push(filterValue);
    });
    return columns;
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];

      this.tableCoumnsOrders.forEach((value) => {
        if (value.data === 'ID_CHK_BOX') {
          columns.push({
            title: '', data: 'ID_CHK_BOX', render: (data, type, row) => {
              return '<input id="trxnCheckbox" data-id="' + row.ID + '" data-archive="' + row.IS_ARCHIVE + '" type="checkbox">';
            }
          });
        } else if (value.data === 'TXN_DATE_AND_TIME' || value.data === 'ACTIVATION_DATE') {
          columns.push({title: value.title, data: value.data, bSortable: false, render: (data, type, full) => {
            return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
          }});
        } else if (value.data === 'SETTLEMENT_DATE') {
          columns.push({title: value.title, data: value.data, bSortable: false, render: (data, type, full) => {
            return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
          }});
        } else if (value.data === 'fromTrxn' || value.data === 'toTrxn' || value.data === 'isArchive' || value.data === 'isReversalTxn') {
          columns.push({title: value.title, data: value.data,
          render: (data, type, full) => {
            return '';
          }, bSortable: false, visible: false});
        } else {
          columns.push({title: value.title, data: value.data, bSortable: false});
        }
      });
    return columns;
  }
}
