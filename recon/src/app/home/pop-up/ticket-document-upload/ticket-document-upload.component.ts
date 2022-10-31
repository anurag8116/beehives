import {Component, Inject, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-ticket-document-upload',
  templateUrl: './ticket-document-upload.component.html'
})
export class TicketDocumentUploadComponent implements OnInit {

  public upload: FormGroup;
  public isLoading = false;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<TicketDocumentUploadComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) {
  }

  ngOnInit() {
    this.upload = new FormGroup({
      'id': new FormControl(null),
      'remark': new FormControl(null),
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

  public removeDocument(i: number): void {
    (<FormArray>this.upload.get('document')).removeAt(i);
  }

  public fileChangeEvent(event: any, index: number) {
    (<FormArray>this.upload.get('document')).at(index).patchValue({path: event.filePath, filename: event.fileName});
  }

  public addDocument(): void {
    const control = new FormGroup({
      'path': new FormControl(null),
      'filename': new FormControl(null),
      'title': new FormControl(null)
    });
    (<FormArray>this.upload.get('document')).push(control);
  }

  public documentSubmit() {
    this.upload.removeControl('rowList');
    this.upload.addControl('rowList', new FormArray([]));
    for (let i = 0; i < this.popUpData.rowList.length; i++) {
      const control = new FormGroup({
        ids: new FormControl(null),
      });
      (<FormArray>this.upload.get('rowList')).push(control);
    }
    this.upload.get('rowList').patchValue(this.popUpData.rowList);
    this.httpService.post('v1/ticketdocuments', this.upload.value, true).subscribe(
      (data: any) => {
        this.upload.reset();
        this.httpService.displaySuccessOnPopUp('Document Submitted !');
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
        this.dialogRef.close();
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  public close() {
    this.dialogRef.close();
  }

}
