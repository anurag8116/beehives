import { AppConstants } from './../../../shared/services/app.constants';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-process-dispute',
  templateUrl: './process-dispute.component.html'
})
export class ProcessDisputeComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  sendForApproval = false;
  heading = 'Update Status';
  status = null;
  closeDispute = false;
  approval = false;
  raisedByM2p = false;
  refundProcess = false;
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  solvedTicketReason = [
    {label: 'ASC', value: 'ASC'},
    {label: 'ChargeBack Process', value: 'CHARGEBACK_PROCESS'},
    {label: 'Duplicate ticket', value: 'DUPLICATE_TICKET'},
    {label: 'No response from user', value: 'NO_RESPONSE_FROM_USER'},
    {label: 'Refund Process', value: 'REFUND_PROCESS'},
    {label: 'Reversed Process', value: 'REVERSED_PROCESS'},
    {label: 'Slicecash Conversion', value: 'SLICECASH_CONVERSION'},
    {label: 'User confirmed issue resolved', value: 'USER_CONFIRMED_ISSUE_RESOLVED'}
  ];

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<ProcessDisputeComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) {
    if (this.popUpData.status) {
      this.status = this.popUpData.status;
      this.heading = this.popUpData.heading ? this.popUpData.heading : this.heading;
      this.closeDispute = this.status === 'CLOSED';
      this.approval = this.status === 'APPROVED';
      this.raisedByM2p = this.status === 'RAISED_BY_M2P';
      this.refundProcess = this.status === 'REFUND_PROCESSED';
    }
  }

  ngOnInit() {
    const activityDate = this.httpService.driveDate(new Date().toDateString());
    this.form = new FormGroup({
      'remark': new FormControl(null),
      'reversalAmount': new FormControl(null),
      'refundAmount': new FormControl(null),
      'txnReferenceNumber': new FormControl(null),
      'reversalDate': new FormControl(null),
      'solvedTicketReason': new FormControl(null),
      'status': new FormControl(this.status ),
      'activityDate': new FormControl(activityDate),
      'rowList': new FormArray([])
    });

    if (this.sendForApproval) {
      this.form.patchValue({status: 'SEND_FOR_APPROVAL'});
    }
    if (this.refundProcess) {
      this.form.patchValue({status: null});
    }
  }

  public processSubmit() {
    this.isLoading = true;
    this.form.removeControl('rowList');
    this.form.addControl('rowList', new FormArray([]));
    for (let i = 0; i < this.popUpData.rowList.length; i++) {
      const control = new FormGroup({
        ids: new FormControl(null),
      });
      (<FormArray>this.form.get('rowList')).push(control);
    }
    this.form.get('rowList').patchValue(this.popUpData.rowList);
    this.httpService.put('v1/disputes?OperationType=Process', this.form.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.httpService.displaySuccessOnPopUp('Dispute status updated ! ');
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
