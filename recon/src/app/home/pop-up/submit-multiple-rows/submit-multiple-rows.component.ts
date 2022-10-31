import {Component, OnInit, Inject} from '@angular/core';
import {HttpService} from './../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {ReconDataType} from '../../../shared/services/enum';

@Component({
  selector: 'app-submit-multiple-rows',
  templateUrl: './submit-multiple-rows.component.html'
})
export class SubmitMultipleRowsComponent implements OnInit {

  private displayInvalidDiscardSuccessOnPopUp = 'Invalid Data Successfully Updated !';
  private displayPandingDataSuccessOnPopUp = 'Transaction Successfully Updated !';
  private displayManuallyMarkedSuccessOnPopUp = 'Transaction manually marked successfully !';
  private displayUnReconciledSuccessOnPopUp = 'UnReconciled Successfully Submit !';
  private displayReconciledSuccessOnPopUp = 'Reconciled Successfully Submit !';
  private displayKnockOffSuccessOnPopUp = 'KnockOff Successfully Submit !';

  public PANDING_APPROVAL = 'PANDING_APPROVAL';
  public TRANSACTION_MANUAL_MARKING = 'TRANSACTION_MANUAL_MARKING';
  public INVALID_DATA_DISCARD = 'INVALID_DATA_DISCARD';
  public ACCEPT = 'ACCEPT';
  public REJECT = 'REJECT';
  public BLANK = ' ';

  public descriptionForm: FormGroup;
  private form: any;
  private displayMessage: string;
  public isLoadingAccept: boolean;
  public isLoadingReject: boolean;
  public isLoading: boolean;
  public reconDataType = ReconDataType;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<SubmitMultipleRowsComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) {
  }

  ngOnInit() {
    this.descriptionForm = new FormGroup({
      'description': new FormControl(null),
    });
  }

  public submit(status: string) {
    const url = this.setUrl(this.popUpData, status);
    this.startLoading(status);
    if (this.popUpData.type === this.INVALID_DATA_DISCARD || this.popUpData.type === this.PANDING_APPROVAL
      || this.popUpData.type === this.TRANSACTION_MANUAL_MARKING) {
      this.httpService.put(url, this.form, true).subscribe(
        (data: any) => {
          this.stopLoading();
          this.close('refresh');
          this.httpService.displaySuccessOnPopUp(this.displayMessage);
        },
        (errorResponse: HttpErrorResponse) => {
          this.stopLoading();
        }
      );
    } else if (this.popUpData.type === ReconDataType.UNRECONCILED || this.popUpData.type === ReconDataType.RECONCILED
      || this.popUpData.type === this.reconDataType.KNOCK_OFF || this.popUpData.type === this.reconDataType.DUPLICATE_MATCH_KNOCK_OFF) {
      this.httpService.post(url, this.form, true).subscribe(
        (data: any) => {
          this.stopLoading();
          this.close('refresh');
          this.httpService.displaySuccessOnPopUp(this.displayMessage);
        },
        (errorResponse: HttpErrorResponse) => {
          this.stopLoading();
        }
      );
    }
  }

  private setUrl(data: any, status: string) {
    let url = '';
    switch (data.type) {
      case this.INVALID_DATA_DISCARD:
        url = 'v1/invaliddatas?Set=Discard';
        this.form = {
          description: this.descriptionForm.controls['description'].value,
          dataSource: this.popUpData.dataSource, rowIds: this.popUpData.rows
        };
        this.displayMessage = this.displayInvalidDiscardSuccessOnPopUp;
        break;
      case this.PANDING_APPROVAL:
        url = 'v1/datatrackers';
        this.form = {
          description: this.descriptionForm.controls['description'].value, ids: this.popUpData.rowIds,
          category: this.popUpData.category, approvalSubCategory: this.popUpData.approvalSubCategory, status: status
        };
        this.displayMessage = this.displayPandingDataSuccessOnPopUp;
        break;
      case this.TRANSACTION_MANUAL_MARKING:
        url = 'v1/datatrackers?Operation=ManualMarking';
        this.form = {
          description: this.descriptionForm.controls['description'].value, rowIds: this.popUpData.rowIds,
          dataSourceId: this.popUpData.dataSourceId
        };
        this.displayMessage = this.displayManuallyMarkedSuccessOnPopUp;
        break;
      case ReconDataType.UNRECONCILED:
        url = 'v1/reconmapping?For=DataTrackerCreate';
        this.form = {
          description: this.descriptionForm.controls['description'].value, reconId: this.popUpData.reconId,
          dataSource: this.popUpData.dataSource, mappingList: this.popUpData.mappingList
        };
        this.displayMessage = this.displayUnReconciledSuccessOnPopUp;
        break;
      case ReconDataType.RECONCILED:
        url = 'v1/datatrackers?Saved=ForForcedMatch';
        this.popUpData.description = this.descriptionForm.controls['description'].value;
        this.form = this.popUpData;
        this.displayMessage = this.displayReconciledSuccessOnPopUp;
        break;
      case ReconDataType.KNOCK_OFF:
        url = 'v1/datatrackers?Saved=ForKnockOff';
        this.popUpData.description = this.descriptionForm.controls['description'].value;
        this.form = this.popUpData;
        this.displayMessage = this.displayKnockOffSuccessOnPopUp;
        break;
      default:
        break;
    }
    return url;
  }

  private startLoading(status: string) {
    if (status === this.ACCEPT) {
      this.isLoadingAccept = true;
    } else if (status === this.REJECT) {
      this.isLoadingReject = true;
    } else {
      this.isLoading = true;
    }
  }

  private stopLoading() {
    this.isLoadingAccept = false;
    this.isLoadingReject = false;
    this.isLoading = false;
  }

  public close(status: string = 'close') {
    this.dialogRef.close(status);
  }

  public getEtlAndReconValidation(): boolean {
    if (this.popUpData.type === this.INVALID_DATA_DISCARD || this.popUpData.type === this.TRANSACTION_MANUAL_MARKING
      || this.popUpData.type === this.reconDataType.UNRECONCILED ||
      this.popUpData.type === this.reconDataType.RECONCILED || this.popUpData.type === this.reconDataType.KNOCK_OFF) {
      return true;
    }
    return false;
  }

  public getPandingValidation(): boolean {
    if (this.popUpData.type === this.PANDING_APPROVAL) {
      return true;
    }
    return false;
  }

}
