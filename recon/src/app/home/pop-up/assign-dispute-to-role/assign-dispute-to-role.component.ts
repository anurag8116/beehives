import {Component, OnInit, Inject} from '@angular/core';
import {HttpService} from './../../../shared/services/http-service';
import {HttpErrorResponse} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ValidationConstant} from '../../../shared/services/validation-constant';
import {ReconDataType} from '../../../shared/services/enum';

@Component({
  selector: 'app-assign-to-role',
  templateUrl: './assign-dispute-to-role.component.html'
})
export class AssignDisputeToRoleComponent implements OnInit {
  public roles = [];
  private roleId = 0;
  private displaySuccessOnPopUp: string;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<AssignDisputeToRoleComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.httpService.get('v1/roles?start=0&length=1000', true).subscribe(
      (data: any) => {
        this.roles = data.data;
      });
  }

  public onRoleChange(roleId: number) {
    this.roleId = roleId;
  }

  public onAssignSubmit() {
    const assignForm = {rowList: this.data.rowList, roleId: this.roleId};
    this.httpService.post('v1/disputedatatrackers', assignForm, true).subscribe(
      (data: any) => {
        this.httpService.displaySuccessOnPopUp(this.displaySuccessOnPopUp);
        this.close();
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  public close() {
    this.dialogRef.close();
  }

}
