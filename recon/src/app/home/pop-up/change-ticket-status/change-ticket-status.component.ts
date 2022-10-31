import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-change-ticket-status',
  templateUrl: './change-ticket-status.component.html'
})
export class ChangeTicketStatusComponent implements OnInit {

  public form: FormGroup;
  public stages = [];
  public isLoading: boolean;
  private isFileAttached = false;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<ChangeTicketStatusComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) {
    this.stages = this.popUpData.stages;
  }

  ngOnInit() {
    this.form = new FormGroup({
      'remark': new FormControl(null),
      'status': new FormControl(null),
      'rowList': new FormArray([]),
      'document': new FormArray([
        new FormGroup({
          'path': new FormControl(null),
          'filename': new FormControl(null),
          'title': new FormControl(null)
        })
      ])
    });
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
    this.httpService.put('v1/tickets?OperationType=Process', this.form.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.httpService.displaySuccessOnPopUp('Process Successfully Submitted ! ');
        this.close();
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;

      }
    );
  }

  public close() {
    this.dialogRef.close();
  }

  public fileChangeEvent(event: any, index: number) {
    this.isFileAttached = true;
    (<FormArray>this.form.get('document')).at(index).patchValue({path: event.filePath, filename: event.fileName});
  }

}
