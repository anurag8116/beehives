import {Component, Inject, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-view-response',
  templateUrl: './view-response.component.html'
})
export class ViewResponseComponent implements OnInit {

  public viewResponseList: any;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<ViewResponseComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) { }

  ngOnInit() {
    this.httpService.get('v1/viewResponses', true).subscribe(
      (data: any) => {
        this.viewResponseList = data;
      });
  }

  public close() {
    this.dialogRef.close();
  }

}
