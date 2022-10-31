import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-raise-pre-arb',
  templateUrl: './raise-pre-arb.component.html'
})
export class RaisePreArbComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<RaisePreArbComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) {}

  ngOnInit() {
    const disputeId = (this.popUpData && this.popUpData.id) ? this.popUpData.id : null;
    this.form = new FormGroup({
      'id': new FormControl(disputeId),
      'additionalDetails': new FormControl(null),
      'preArbProofFileName': new FormControl(null),
      'preArbProofFilePath': new FormControl(null)
    });
  }

  public fileChangeEvent(event: any) {
    if(event) this.form.patchValue({preArbProofFilePath: event.filePath, preArbProofFileName: event.fileName});
    else this.form.patchValue({preArbProofFilePath: null, preArbProofFileName: null});
  }

  public processSubmit() {
    this.isLoading = true;
    this.httpService.post('v1/disputes?OperationType=RaisePreArb', this.form.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.httpService.displaySuccessOnPopUp('Pre Arbitration raised successfully ! ');
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
