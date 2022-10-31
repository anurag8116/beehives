import {Component, Inject, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html'
})
export class ProcessComponent implements OnInit {

  public isLoading: boolean;
  public upload: FormGroup;
  public stages = [{name: 'Accept', value: 'ACCEPT'}, {name: 'Reject', value: 'REJECT'}];

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<ProcessComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.upload = new FormGroup({
      'id': new FormControl(null),
      'remark': new FormControl(null),
      'status': new FormControl(null),
      disputeType: new FormControl(null),
      'document': new FormArray([
        new FormGroup({
          'path': new FormControl(null),
          'filename': new FormControl(null),
          'title': new FormControl(null)
        })
      ]),
      'rowList': new FormArray([])
    });
  }

  public fileChangeEvent(event: any, index: number) {
    (<FormArray>this.upload.get('document')).at(index).patchValue({path: event.filePath, filename: event.fileName});
  }

  public removeDocument(i: number): void {
    (<FormArray>this.upload.get('document')).removeAt(i);
  }

  public addDocument(): void {
    const control = new FormGroup({
      'path': new FormControl(null),
      'filename': new FormControl(null),
      'title': new FormControl(null)
    });
    (<FormArray>this.upload.get('document')).push(control);
  }

  public onDocumentSubmit() {
    this.isLoading = true;
    for (const val of this.popUpData.rowList) {
      const control = new FormGroup({
        ids: new FormControl(null),
      });
      (<FormArray>this.upload.get('rowList')).push(control);
    }
    this.upload.patchValue({'rowList': this.popUpData.rowList});
    if (this.popUpData.disputeType) {
      this.upload.patchValue({disputeType: this.popUpData.disputeType});
    }
    this.httpService.post('v1/disputedocuments', this.upload.value, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.upload.reset();
        this.httpService.displaySuccessOnPopUp('Document Submitted Successfully !');
        jQuery('#process-modal').modal('hide');
        let i = 0;
        for (const object of this.upload.get('document')['controls']) {
          (<FormArray>this.upload.get('document')).removeAt(i);
          i++;
        }
        this.addDocument();
        let k = 0;
        for (const object of this.upload.get('rowList')['controls']) {
          (<FormArray>this.upload.get('rowList')).removeAt(k);
          k++;
        }
        this.close();
      },
      (errorResponse: HttpErrorResponse) => {
        jQuery('#process-modal').modal('hide');
        let k = 0;
        for (const object of this.upload.get('rowList')['controls']) {
          (<FormArray>this.upload.get('rowList')).removeAt(k);
          k++;
        }
        this.isLoading = false;
        // this.close();
      }
    );
  }

  public close() {
    this.dialogRef.close();
  }

}
