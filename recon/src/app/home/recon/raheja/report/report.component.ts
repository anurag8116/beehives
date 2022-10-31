import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../../shared/services/app.constants';
import {HttpService} from '../../../../shared/services/http-service';
import {ServiceConstant} from '../../../../shared/services/service-constant';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html'
})
export class ReportComponent implements OnInit {

  public form: FormGroup;
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public fromDate: string;
  public toDate: string;
  public reportData: any;
  public reportlist: any = [];
  public url: any = null;
  public segregateReport: any = [];
  public isData = false;
  public agentCode: string;


  constructor(private httpService: HttpService) { }

  ngOnInit() {
    this.form = new FormGroup({
      'agentCode': new FormControl(null),
      'fromDate': new FormControl(null),
      'toDate': new FormControl(null),
    });
  }

  public getToDatePickerConfig(fromDate: string): void {
    const date = AppConstants.getDateFromString(fromDate);
    this.getDatePickerConfigRestrictPastDate = AppConstants.getDatePickerConfig(false, date);
  }

  getReport() {
    const agentCode = (<FormControl>this.form.controls['agentCode']).value;
    this.agentCode = agentCode;
    const fromDate = (<FormControl>this.form.controls['fromDate']).value;
    const toDate = (<FormControl>this.form.controls['toDate']).value;
    this.httpService.get('v1/brsreports?RahejaReport&agentCode=' + agentCode + '&fromDate=' + fromDate + '&toDate=' + toDate, true).subscribe(
      (data: any) => {
        this.reportData = data;
        this.reportlist = data.response;
        this.isData = true;
      }
    );
  }

  getTranTypeAmount(closingBalance: number) {
    return closingBalance > 0 ? (closingBalance.toFixed(2) + ' Cr') : (Math.abs(closingBalance).toFixed(2) + ' Dr');
  }

  getClosingAmount(debit: number, credit: number, closing: number) {
    if (debit > credit) {
      let debitConv = Math.abs(debit);
       let deb =  credit - debitConv;
       let closingBal = closing - deb;
       return Math.abs(closingBal).toFixed(2);
    } else {
      let debitConv = Math.abs(debit);
      let cred =  credit - debitConv;
      let closingBal = closing - cred;
      return Math.abs(closingBal).toFixed(2);
    }
  }

/*  ExportTOExcel() {
    const url = ServiceConstant.URL + 'v1/reportexecutions/downloads?glConfigId=' + this.configId + '&date=' + this.fromDate + '&toDate=' + this.toDate + 'rcReport=true';
  }*/

}
