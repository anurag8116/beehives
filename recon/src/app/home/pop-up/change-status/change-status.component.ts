import { AppConstants } from './../../../shared/services/app.constants';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-change-status',
  templateUrl: './change-status.component.html'
})
export class ChangeStatusComponent implements OnInit {

  public form: FormGroup;
  public stages = [];
  public isLoading: boolean;
  sendForApproval = false;
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public item = [];
  public filesName = '';

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<ChangeStatusComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) {
    console.log(this.popUpData);
    // this.stages = this.popUpData.stages;
    this.stages = [];
    if (this.popUpData.stage) {
      if (this.popUpData.stage === 'CHARGE_BACK') {
        this.stages = [
          {name: 'Chargeback declined by Merchant', value: 'CHARGEBACK_DECLINED_BY_MERCHANT'},
          {name: 'Chargeback Declined for Refunded', value: 'CHARGEBACK_DECLINED_FOR_REFUNDED'},
          {name: 'Chargeback Partially Accepted', value: 'CHARGEBACK_PARTIALLY_ACCEPTED'},
          {name: 'Chargeback Merchant Accepted', value: 'CHARGEBACK_MERCHANT_ACCEPTED'},
          {name: 'Chargeback Deemed Accepted', value: 'CHARGEBACK_DEEMED_ACCEPTED'}
        ];
      } else if (this.popUpData.stage === 'PRE_ARBITRATION') {
        this.stages = [
          {name: 'Pre-Arb Merchant Rejected', value: 'PRE_ARB_MERCHANT_REJECTED'},
          {name: 'Pre-Arb Declined for Refunded', value: 'PRE_ARB_DECLINED_FOR_REFUNDED'},
          {name: 'Pre-Arb Merchant Accepted', value: 'PRE_ARB_MERCHANT_ACCEPTED'},
          {name: 'Pre-Arb Deemed Accepted', value: 'PRE_ARB_DEEMED_ACCEPTED'}
        ];
      } else if (this.popUpData.stage === 'GOOD_FAITH') {
        this.stages = [
          {name: 'GoodFaith Merchant Rejected', value: 'GOOD_FAITH_MERCHANT_REJECTED'},
          {name: 'GoodFaith Merchant Accepted', value: 'GOOD_FAITH_MERCHANT_ACCEPTED'}
        ];
      }
    }
    if (this.popUpData.sendForApproval) { this.sendForApproval = this.popUpData.sendForApproval; }
  }

  ngOnInit() {
    const activityDate = this.httpService.driveDate(new Date().toDateString());
    this.form = new FormGroup({
      'remark': new FormControl(null),
      'status': new FormControl(null),
      'activityDate': new FormControl(activityDate),
      'merchantProofFiles': new FormArray([]),
      'rowList': new FormArray([])
    });

    if (this.sendForApproval) {
      this.form.patchValue({status: 'SEND_FOR_APPROVAL'});
    }
  }

  public onMerchantProofFileSelect(files: any) {
    this.filesName = '';
    if (files && files.length > 0) {
      this.filesName = files.length + ' files are selected : ';
      for (let i = 0; i < files.length; i++) {
        this.filesName = this.filesName + files[i].name;
        const file = files[i];
        if (i !== files.length - 1) {
          this.filesName = this.filesName + ',';
        }
        const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const fa = this.form.get('merchantProofFiles') as FormArray;
            fa.push( new FormGroup({
              'merchantProofFileName': new FormControl(file.name),
              'merchantProofFilePath': new FormControl((reader.result as any).split(',')[1])
            }));
          };
    }} else {
      this.form.get('merchantProofFiles').patchValue( new FormGroup({
        'merchantProofFileName': new FormControl(null),
        'merchantProofFilePath': new FormControl(null)
      }));
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
        this.httpService.displaySuccessOnPopUp('Status Successfully Updated ! ');
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
