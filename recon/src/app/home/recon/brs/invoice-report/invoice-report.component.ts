import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import * as FileSaver from 'file-saver';
import {isNullOrUndefined} from 'util';
import {DisputeFormComponent} from '../../../pop-up/dispute-form/dispute-form.component';
import {MatDialog} from '@angular/material';
import {InvoiceReportFormComponent} from '../../../pop-up/invoice-report-form/invoice-report-form.component';

@Component({
  selector: 'app-invoice-report',
  templateUrl: './invoice-report.component.html'
})
export class InvoiceReportComponent implements OnInit {

  month = new FormControl(null);
  invoiceReport = [];
  invoiceSummary;
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

  constructor(private httpService: HttpService, private dialog: MatDialog) { }

  ngOnInit() { }

  exportReport() {
    if (isNullOrUndefined(this.month.value)) {
      this.httpService.displayErrorOnPopUp('Please select month');
      return;
    }
    const year = this.month.value.split('-')[0];
    const month = this.month.value.split('-')[1];
    this.httpService.downloadFile('v1/brsreports/invoicereport?Operation=Export&month=' + month + '&year=' + year).subscribe(
      (data: any) => {
        console.log(data);
        const monthName = this.monthNames[Number(month) - 1];
        FileSaver.saveAs(data, 'InvoiceReport_' + monthName + '_' + year);
      }
    );
  }

  getReport() {
    if (isNullOrUndefined(this.month.value)) {
      this.httpService.displayErrorOnPopUp('Please select month');
      return;
    }
    const year = this.month.value.split('-')[0];
    const month = this.month.value.split('-')[1];
    this.httpService.get('v1/brsreports?InvoiceReport&month=' + month + '&year=' + year, true).subscribe(
      (data: any) => {
        this.invoiceReport = data;
        // this.invoiceReport.push(data.settledAmount);
        // this.invoiceReport.push(data.interchangeCr);
        // this.invoiceReport.push({DESCRIPTION: 'Fee on ATM Transactions', AMOUNT: ''});
        // this.invoiceReport.push(data.interchangeDr);
        // data.atmTrxnFee = {DESCRIPTION: 'Fee on ATM Transactions', AMOUNT: ''};
        // data.interchangeBooked = {DESCRIPTION: 'Interchange Booked', AMOUNT: (data.interchangeCr.AMOUNT - data.interchangeDr.AMOUNT)};
        // data.gstComponent = {DESCRIPTION: 'Less: Removing GST Component', AMOUNT: ((data.interchangeBooked.AMOUNT * 0.18) / 1.18)};
        // data.incomeBooked = {DESCRIPTION: 'Income Booked', AMOUNT: (data.interchangeBooked.AMOUNT - data.gstComponent.AMOUNT)};
        // data.bankShare = {DESCRIPTION: 'Less: Bank Share on Interchange', AMOUNT: (data.incomeBooked.AMOUNT * 0.1)};
        // data.m2pShare = {DESCRIPTION: 'Less: M2P Share', AMOUNT: (data.settledAmount.AMOUNT * 0.065)};
        // data.grossRevenue = {DESCRIPTION: 'Gross Revenue', AMOUNT: (data.incomeBooked.AMOUNT - data.bankShare.AMOUNT - data.m2pShare.AMOUNT - data.networkCost.AMOUNT)};
        // data.otpFee = {DESCRIPTION: 'ECOM OTP fee @0.65 (@0.35 from April21)', AMOUNT: ''};
        // data.smsCost = {DESCRIPTION: 'SMS Delivery Cost @ 0.12', AMOUNT: ''};
        // data.kycCollection = {DESCRIPTION: 'KYC Collection / Verification on Actuals (PAN @2 & Aadhaar @3)', AMOUNT: ''};
        // data.grossIncome = {DESCRIPTION: 'Gross Invoice / Taxable Income', AMOUNT: data.grossRevenue.AMOUNT};
        // this.invoiceSummary = data;
        console.log(data);
      }
    );
  }

  onAddVisaExpenseCharge() {
    this.dialog.open(InvoiceReportFormComponent, {width: '350px', height: '350px'});
  }
}
