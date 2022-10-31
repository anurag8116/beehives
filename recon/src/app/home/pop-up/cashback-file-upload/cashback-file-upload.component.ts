import {Component, Inject, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/services/http-service';
import {isNullOrUndefined} from "util";
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../shared/services/app.constants';

@Component({
  selector: 'app-cashback-file-upload',
  templateUrl: './cashback-file-upload.component.html'
})
export class CashbackFileUploadComponent implements OnInit {

  public fileName: string;
  selectedFiles = [];
  public filesName = '';
  txnFromDate = null;
  txnToDate = null;
  isLoading = false;
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public bsConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  id = null;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<CashbackFileUploadComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.id = this.data.id;
    this.fileName = '';
  }

  onFileSelect(files: any) {
    this.filesName = '';
    this.selectedFiles = files;
    if (files && files.length > 0) {
      this.filesName = files.length + ' files are selected : ';
      for (let i = 0; i < files.length; i++) {
        this.filesName = this.filesName + files[i].name;
        if (i !== files.length - 1) {
          this.filesName = this.filesName + ',';
        }
      }
    }
  }

  public getToDatePickerConfig(fromDate: string): void {
    const date = AppConstants.getDateFromString(fromDate);
    this.bsConfigRestrictPastDate = AppConstants.getDatePickerConfig(false, date);
  }

  uploadFile() {
    let errorMsg = '';
    let isError = false;

    if (isNullOrUndefined(this.id)) {
      isError = true;
      errorMsg += 'cashback coupon id is required.' + '<br>';
    }
    if (isNullOrUndefined(this.txnFromDate) || this.txnFromDate === '') {
      isError = true;
      errorMsg += 'txn from date is required.' + '<br>';
    }
    if (isNullOrUndefined(this.txnToDate) || this.txnToDate === '') {
      isError = true;
      errorMsg += 'txn to date is required.' + '<br>';
    }

    if (this.selectedFiles.length < 1) {
      isError = true;
      errorMsg += 'file is required.' + '<br>';
    }
    if (errorMsg) {
      this.httpService.displayErrorOnPopUp(errorMsg);
    }

    if (!isError) {
      this.isLoading = true;
      const formdata: FormData = new FormData();
      for (const file of this.selectedFiles) {
        formdata.append('files', file);
      }
      this.httpService.post('v1/discountcriteria/upload?discountCriteriaId=' + this.id
        + '&txnFromDate=' + this.txnFromDate + '&txnToDate=' + this.txnToDate,
        formdata, true).subscribe((res: any) => {
        this.isLoading = false;
        this.httpService.displaySuccessOnPopUp('File successfully uploaded', 100000000);
        this.close();
      }, err => {
        this.isLoading = false;
      });
    }
  }

  public close() {
    this.dialogRef.close();
  }
}
