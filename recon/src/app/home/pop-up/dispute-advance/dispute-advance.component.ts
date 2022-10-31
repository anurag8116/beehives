import { AppConstants } from './../../../shared/services/app.constants';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-dispute-advance',
  templateUrl: './dispute-advance.component.html'
})
export class DisputeAdvanceComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();

  get advanceRefundFileNameControl(): FormControl {
    return this.form.controls.advanceRefundFileName as FormControl;
  }

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<DisputeAdvanceComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    const advanceDate = this.httpService.driveDate(new Date().toDateString());
    this.form = new FormGroup({
      'id': new FormControl(this.data.id),
      'advanceAmount': new FormControl(null),
      'txnReferenceNumber': new FormControl(null),
      'advanceDate': new FormControl(advanceDate),
      'advanceRefundFileName': new FormControl(null),
      'advanceRefundFilePath': new FormControl(null)
    });
  }

  public onFileSelect(files: any[]) {
    if(files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.form.patchValue({advanceRefundFilePath: (reader.result as any).split(',')[1], advanceRefundFileName: file.name});
        };
    } else {
      this.form.patchValue({advanceRefundFilePath: null, advanceRefundFileName: null});
    }
  }

  public processSubmit() {
    this.isLoading = true;
    this.httpService.put('v1/disputes?OperationType=AdvanceRefund', this.form.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.httpService.displaySuccessOnPopUp('Advance Refund Successfully Submitted ! ');
        this.dialogRef.close('refresh');
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
      }
    );
  }

  public close() {
    this.dialogRef.close();
  }
}
