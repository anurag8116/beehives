import { Component, OnInit, Inject} from '@angular/core';
import {HttpService} from './../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html'
})
export class FileUploadComponent implements OnInit {

  private displaySuccessOnPopUp = 'User Successfully Created!';

  public upload: FormGroup;
  public fileName: string;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<FileUploadComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.fileName = '';
    this.upload = new FormGroup({
      'encodedString': new FormControl(null),
      'fileName': new FormControl(null)
    });
  }

  public fileChangeEvent(event: any) {
    this.upload.patchValue({encodedString: event.filePath, fileName: event.fileName});
  }

  submitFile() {
    this.httpService.post('v1/appusers?Bulkupload', this.upload.getRawValue(), true).subscribe(
      (data: any) => {
        this.close();
        this.httpService.displaySuccessOnPopUp(this.displaySuccessOnPopUp);
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  public close() {
    this.dialogRef.close();
  }

}
