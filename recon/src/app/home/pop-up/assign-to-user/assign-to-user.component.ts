import {Component, OnInit, Inject} from '@angular/core';
import {HttpService} from './../../../shared/services/http-service';
import {HttpErrorResponse} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ValidationConstant} from '../../../shared/services/validation-constant';
import {ReconDataType} from '../../../shared/services/enum';

@Component({
  selector: 'app-assign-to-user',
  templateUrl: './assign-to-user.component.html'
})
export class AssignToUserComponent implements OnInit {

  private displayMasterSuccessOnPopUp = 'Master Data Successfully Assigned !';
  private displayInvalidSuccessOnPopUp = 'Invalid Data Successfully Assigned !';

  public appusers = [];
  private appUserId = 0;
  private popUpData: any;
  private displaySuccessOnPopUp: string;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<AssignToUserComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.popUpData = this.data;
    this.httpService.get('v1/appusers', true).subscribe(
      (data: any) => {
        this.appusers = data.data;
      });
  }

  public selectAppUser(appUserId: number) {
    this.appUserId = appUserId;
  }

  public onAssignSubmit() {
    if (this.appUserId !== 0) {
      const url = this.setUrl(this.popUpData);
      this.httpService.post(url, this.popUpData.rows, true).subscribe(
        (data: any) => {
          this.httpService.displaySuccessOnPopUp(this.displaySuccessOnPopUp);
          this.close();
        },
        (errorResponse: HttpErrorResponse) => {
        }
      );
    } else {
       this.httpService.displayErrorOnPopUp(ValidationConstant.SELECT_USER);
    }
  }

  private setUrl (data: any) {
    let url = '';
    switch (data.type) {
      case ReconDataType.EDIT_INVALID_DATA:
        url = 'v1/invaliddatatracker?dataSource=' + this.popUpData.dataSourceId + '&appuser=' + this.appUserId;
        this.displaySuccessOnPopUp = this.displayInvalidSuccessOnPopUp;
        break;
      case ReconDataType.MASTER_DATA:
        url = 'v1/masterdatatrackers?masterSource=' + this.popUpData.masterDataId + '&appuser=' + this.appUserId;
        this.displaySuccessOnPopUp = this.displayMasterSuccessOnPopUp;
        break;
      default:
        break;
    }
    return url;
    }

  public close() {
    this.dialogRef.close();
  }

}
