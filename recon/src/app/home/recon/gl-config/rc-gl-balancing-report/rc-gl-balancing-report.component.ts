import {Component, OnInit} from '@angular/core';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../../shared/services/app.constants';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {ServiceConstant} from '../../../../shared/services/service-constant';
import {DatePipe} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-rc-gl-balancing-report',
  templateUrl: './rc-gl-balancing-report.component.html'
})
export class RcGlBalancingReportComponent implements OnInit {

  public reportData: any = {creditEntries: [], debitEntries: []};
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public glBalanceConfigs: any = [];
  public segregateReport: any = [];
  private type: string;
  private configId: number;
  public fromDate: string;
  public toDate: string;
  public form: FormGroup;
  public url: any = null;
  private reportType: any = 'Segregated';
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public unreconcieldTrxn: any = [];
  public unreconcieldAmount = 0;

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute, private datePipe: DatePipe, private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      'glName': new FormControl(null),
      'fromGlDate': new FormControl(null),
      'toGlDate': new FormControl(null),
    });
    this.activeRoute.queryParams.subscribe(params => {
      this.type = params['type'];
      this.configId = +params['configId'];
      this.toDate = params['toDate'];
      this.fromDate = params['fromDate'];
      this.reportType = params['tab'];
      this.form.get('glName').patchValue(this.configId ? this.configId : null);
      this.form.get('fromGlDate').patchValue(this.fromDate);
      this.form.get('toGlDate').patchValue(this.toDate);
      if (this.configId) {
        this.getReport(this.configId, this.fromDate, this.toDate);
      }
    });
    this.httpService.get('v1/glconfigrations', true).subscribe(
      (data: any) => {
        this.glBalanceConfigs = data.data;
      }
    );
  }

  selectReport(report: string) {
    this.reportType = report;

    let reportUrl = 'v1/glbalancingexecutions/downloads?reportType=Consolidated&glConfigId=' + this.configId + '&date=' + this.fromDate + '&toDate=' + this.toDate + '&rcReport=true';
    if (this.reportType === 'Segregated') {
      reportUrl = 'v1/glbalancingexecutions/downloads?reportType=Segregated&glConfigId=' + this.configId + '&date=' + this.fromDate + '&toDate=' + this.toDate + '&rcReport=true';
    }
    this.httpService.downloadFile(reportUrl).subscribe(response => {
      const blob = new Blob([response.body], {type: 'application/octet-stream'});
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    });

  }

  getReport(configId, fromDate, toDate) {
    let errorMsg = '';
    if (!configId || configId === 'null') {
      errorMsg += 'GL is required.' + '<br>';
    }
    if (!fromDate) {
      errorMsg += 'GL trxn from date is required.' + '<br>';
    }
    if (!toDate) {
      errorMsg += 'GL trxn till date is required.' + '<br>';
    }
    if (errorMsg) {
      this.httpService.displayErrorOnPopUp(errorMsg);
    }
    if (configId && fromDate && toDate) {
      this.configId = configId;
      this.fromDate = fromDate;
      this.toDate = toDate;
      this.httpService.get('v1/glbalancingexecutions/rcreport?glConfigId=' + configId + '&fromDate=' + fromDate + '&toDate=' + toDate, true).subscribe(
        (data: any) => {
          this.reportData = data;
          this.setReportDataForConsolidate(data);
        }
      );
    }
  }

  setReportDataForConsolidate(data: any) {
    const report = [];
    this.unreconcieldTrxn = [];
    this.unreconcieldAmount = 0;
    let closingBalance = this.reportData.glClosingBalance;
   // this.reportData.sumOfDebitEntries = closingBalance < 0 ? (this.reportData.sumOfDebitEntries + Math.abs(closingBalance)) : this.reportData.sumOfDebitEntries;
  //  this.reportData.sumOfCreditEntries = closingBalance > 0 ? (this.reportData.sumOfCreditEntries + closingBalance) : this.reportData.sumOfCreditEntries;
    this.segregateReport = [];
    for (let i = 0; i < data.creditEntries.length; i++) {
      report.push(data.creditEntries[i]);
    }
    for (let i = 0; i < data.debitEntries.length; i++) {
      report.push(data.debitEntries[i]);
    }
    /* report.sort(function (a, b) {
       return a.id - b.id;
     });*/
    for (let i = 0; i < report.length; i++) {

      if (report[i].discription && (report[i].discription.toLowerCase().indexOf('unreconciled') > -1)) {
        this.unreconcieldTrxn.push(report[i]);
        this.unreconcieldAmount = (report[i].type === 'CREDIT') ? (this.unreconcieldAmount + report[i].amount) : (this.unreconcieldAmount - report[i].amount);
      } else {
        closingBalance = (report[i].type === 'CREDIT') ? (closingBalance + report[i].amount) : (closingBalance - report[i].amount);
        const reportData = Object.assign(report[i], {closingBalance: (closingBalance)});
        this.segregateReport.push(reportData);
      }

    }
  }

  glConfigDetails(glConfigId: number, trxnDate: string) {
    this.router.navigate(['/home/recon', 'gl-config', {
      outlets: {
        'fullBodyOutlet':
          ['gl-detail']
      }
    }], {
      queryParams: {
        id: glConfigId,
        type: this.type,
        configId: this.configId,
        date: this.datePipe.transform(trxnDate, 'dd-MM-yyyy'),
        fromDate: this.fromDate,
        toDate: this.toDate,
        tab: 'rc-report',
      }
    });
  }

  ExportTOExcel() {
    const url = ServiceConstant.URL + 'v1/reportexecutions/downloads?glConfigId=' + this.configId + '&date=' + this.fromDate + '&toDate=' + this.toDate + 'rcReport=true';
  }

  public getToDatePickerConfig(fromDate: string): void {
    const date = AppConstants.getDateFromString(fromDate);
    this.getDatePickerConfigRestrictPastDate = AppConstants.getDatePickerConfig(false, date);
  }

  getTranTypeAmount(closingBalance: number) {
    return closingBalance > 0 ? (closingBalance.toFixed(2) + ' Cr') : (Math.abs(closingBalance).toFixed(2) + ' Dr');
  }
}
