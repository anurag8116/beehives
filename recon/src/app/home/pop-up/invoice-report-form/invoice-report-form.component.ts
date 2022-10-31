import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-invoice-report-form',
  templateUrl: './invoice-report-form.component.html'
})
export class InvoiceReportFormComponent implements OnInit {

  public isLoading: boolean;
  public form: FormGroup;
  public stages = [{name: 'Accept', value: 'ACCEPT'}, {name: 'Reject', value: 'REJECT'}];
  monthYear = new FormControl(null);

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<InvoiceReportFormComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.form = new FormGroup({
      'id': new FormControl(null),
      'visaExpenseOtherCharges': new FormControl(null),
      'month': new FormControl(null),
      'year': new FormControl(null)
    });
  }

  public onSubmit() {
    if (isNullOrUndefined(this.monthYear.value)) {
      this.httpService.displayErrorOnPopUp('Please select month & year');
      return;
    }
    if (isNullOrUndefined(this.form.controls.visaExpenseOtherCharges.value)) {
      this.httpService.displayErrorOnPopUp('Please enter visa expense other charges.');
      return;
    }
    const year = this.monthYear.value.split('-')[0];
    const month = this.monthYear.value.split('-')[1];
    this.form.patchValue({month: month, year: year});
    this.isLoading = true;
    this.httpService.post('v1/brsreports?Operation=InvoiceReport', this.form.getRawValue(), true).subscribe(
      (data: any) => {
        this.httpService.displaySuccessOnPopUp('Visa Expense Charges submitted successfully.');
        this.isLoading = false;
        this.close();
      }, err => {
        this.isLoading = false;
      });
  }

  public close() {
    this.dialogRef.close();
  }
}
