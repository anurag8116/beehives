import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {HttpService} from '../../../shared/services/http-service';

@Component({
  selector: 'app-timeline-char',
  templateUrl: './timeline-char.component.html'
})
export class TimelineCharComponent implements OnInit {

  public showHistorydata: any;

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<TimelineCharComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) { }

  ngOnInit() {
    this.showHistorydata = this.popUpData.data;
  }

  public close() {
    this.dialogRef.close();
  }
}
