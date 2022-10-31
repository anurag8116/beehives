import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../../shared/services/app.constants';
import {ActivatedRoute, Router} from '@angular/router';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  public form: FormGroup;
  public recons: any[] = [];
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public url: any = null;
  public reportData: any = [];
  public ledgerData: any;
  public totalDifference: number;
  public celioFuture = 1459703;
  public taibahCollection = 1524394;
  public balanceDifference: number;
  public roundoff = 0;
  public isReconData: boolean;
  public isLedgerField: boolean;
  public ledgers = [{id: 'Celio'}, {id: 'Taibah'}];
  public celioData = [];
  public taibahData = [];
  public isCelio: boolean;
  public isTaibah: boolean;
  public isNoDataMessage: boolean;
  public isLedgerViewButton: boolean;
  public getLedger: any;
  public celioOpeningAmount = 11188922;
  public taibahOpeningAmount = 4513104;
  public celioClosingAmount = 0;
  public taibahClosingAmount = 0;
  public sumOfCelioDebit = 0;
  public sumOfCelioCredit = 0;
  public sumOfTaibahDebit = 0;
  public sumOfTaibahCredit = 0;
  private id: number;
  public reconIds: number;
  public reconName = null;

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute) {
    this.isReconData = false;
    this.isLedgerField = false;
    this.isCelio = false;
    this.isTaibah = false;
    this.isNoDataMessage = true;
    this.isLedgerViewButton = false;
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
      this.reconIds = +params['reconIds'] || null;
      console.log(this.id, this.reconIds);
      if (this.id) {
        this.getReport(this.reconIds, null);
      }
    });
    this.form = new FormGroup({
      'reconId': new FormControl(null),
      'asOnDate': new FormControl(null)
    });

    this.getRecons();
    this.setLedgerData();
  }

  getRecons() {
    this.httpService.get('v1/recons', true).subscribe(
      (data: any) => {
        this.recons = data.data;
        if (this.reconIds) {
          this.form.patchValue({reconId: this.reconIds});
        }
      }
    );
  }

  getReport(reconId, isledger) {
    this.reconIds = reconId;
    this.getReconName(reconId);
    let errorMsg = '';
    if (!reconId || reconId === 'null') {
      errorMsg += 'Recon is required.' + '<br>';
    }
    /*if (!asOnDate) {
      errorMsg += 'Date is required.' + '<br>';
    }*/
    if (errorMsg) {
      this.httpService.displayErrorOnPopUp(errorMsg);
    }
    if (reconId) {
      // this.validation(isledger);
      console.log(reconId);
      this.httpService.get('v1/brsreports?reconId=' + reconId, true).subscribe(
        (data: any) => {
          this.reportData = data;
          if (this.reportData) {
            this.isNoDataMessage = false;
          }

          /*   if (this.isReconData) {
               this.totalDifference = 0;
               let dr = 0;
               let cr = 0;
               for (const val of data) {
                 if (val.type === 'DR') {
                   dr = dr + val.amount;
                 } else {
                   cr = cr + val.amount;
                 }
               }
               this.totalDifference = Math.abs(dr - cr + this.roundoff);
               const baldiff = Math.abs(dr - cr) + (this.celioFuture - this.taibahCollection);
               this.balanceDifference = Math.abs(baldiff) - this.roundoff;
             } else {
               this.setLedgerData();
             }*/
        }
      );
    }
  }

  public getTransactionData(id: number, header: string) {
    this.router.navigate(['/home/recon/brs', {outlets: {'fullBodyOutlet': ['report-transaction']}}],
      {queryParams: {id: id, reconIds: this.reconIds, header: header}});
  }

  public downloadReport(id: number): any {
    this.httpService.get('v1/brsreports/celio/download?reconId=' + id, true).subscribe(
      (data: any) => {
        FileSaver.saveAs(AppConstants.base64ToExcel(data.filePath), 'Brs Report ' + new Date());
      }
    );
  }

  public onCheckBoxClick(val: boolean) {
    if (val === true) {
      this.isLedgerField = true;
      this.isReconData = false;
      this.isLedgerViewButton = true;
      this.isNoDataMessage = true;
    } else {
      this.isLedgerField = false;
      this.isTaibah = false;
      this.isCelio = false;
      this.isLedgerViewButton = false;
      this.isNoDataMessage = true;
    }
  }

  public onLedgerChange(val: any) {
    this.getLedger = val;
    if (val === 'Celio') {
      this.isCelio = true;
      this.isTaibah = false;
    } else {
      this.isTaibah = true;
      this.isCelio = false;
    }

  }

  private validation(isledger) {
    if (isledger === false) {
      this.isReconData = true;
    } else {
      this.isReconData = false;
      if (this.getLedger === 'Celio') {
        this.isCelio = true;
      } else {
        this.isTaibah = true;
      }
    }
  }

  public getLedgerReport(reconId, isledger) {
    this.isNoDataMessage = true;
    this.celioData = [];
    this.taibahData = [];
    this.celioClosingAmount = 0;
    this.taibahClosingAmount = 0;
    if (reconId) {
      this.validation(isledger);
      this.httpService.get('v1/brsreports?CelioLedger&reconId=' + reconId, true).subscribe(
        (data: any) => {
          this.ledgerData = data;
          this.isNoDataMessage = false;
          for (const val of data) {
            if (val.actionOwner === 'Celio') {
              this.celioData.push(val);
              if (val.type === 'Cr') {
                this.sumOfCelioCredit = this.sumOfCelioCredit + val.amount;
              } else {
                this.sumOfCelioDebit = this.sumOfCelioDebit + val.amount;
              }
            } else {
              this.taibahData.push(val);
              if (val.type === 'Cr') {
                this.sumOfTaibahCredit = this.sumOfTaibahCredit + val.amount;
              } else {
                this.sumOfTaibahDebit = this.sumOfTaibahDebit + val.amount;
              }
            }
          }
        }
      );
    }
  }

  private setLedgerData() {
    for (const cel of this.reportData) {
      if (cel.actionOwner === 'Celio') {
        this.celioData.push(cel);
        if (cel.type === 'Dr') {
          this.sumOfCelioDebit = this.sumOfCelioDebit + cel.amount;
        } else {
          this.sumOfCelioCredit = this.sumOfCelioCredit + cel.amount;
        }
      } else {
        this.taibahData.push(cel);
        if (cel.type === 'Dr') {
          this.sumOfTaibahDebit = this.sumOfTaibahDebit + cel.amount;
        } else {
          this.sumOfTaibahCredit = this.sumOfTaibahCredit + cel.amount;
        }
      }
    }
  }

  public getCelioClosingAmount(amount: any, type: any, i: number): any {
    if (type === 'Dr') {
      if (i === 0) {
        this.celioClosingAmount = this.celioOpeningAmount + amount;
      } else {
        this.celioClosingAmount = this.celioClosingAmount - amount;
      }
    } else {
      if (i === 0) {
        this.celioClosingAmount = this.celioOpeningAmount - amount;
      } else {
        this.celioClosingAmount = this.celioClosingAmount - amount;
      }
    }
    return this.celioClosingAmount > 0 ? (this.celioClosingAmount.toFixed(2) + ' Cr') : (Math.abs(this.celioClosingAmount).toFixed(2) + ' Dr');
  }

  public getTaibahClosingAmount(amount: any, type: any, i: number): any {
    if (type === 'Dr') {
      if (i === 0) {
        this.taibahClosingAmount = this.taibahOpeningAmount - amount;
      } else {
        this.taibahClosingAmount = this.taibahClosingAmount - amount;
      }
    } else {
      if (i === 0) {
        this.taibahClosingAmount = this.taibahOpeningAmount + amount;
      } else {
        this.taibahClosingAmount = this.taibahClosingAmount + amount;
      }
    }
    return this.taibahClosingAmount > 0 ? (this.taibahClosingAmount.toFixed(2) + ' Cr') : (Math.abs(this.taibahClosingAmount).toFixed(2) + ' Dr');
  }

  public getCelioTotalClosingAmount(): any {
    const amount = Math.round(this.celioClosingAmount);
    return amount > 0 ? (amount.toFixed(2) + ' Cr') : (Math.abs(amount).toFixed(2) + ' Dr');

  }

  public getTaibahTotalClosingAmount(): any {
    const amount = Math.round(this.taibahClosingAmount);
    return amount > 0 ? (amount.toFixed(2) + ' Cr') : (Math.abs(amount).toFixed(2) + ' Dr');

  }

  private getReconName(reconId: number) {
    for (const recon of this.recons) {
      if (recon.id === +reconId) {
        this.reconName = recon.name;
        break;
      }

    }

  }
}
