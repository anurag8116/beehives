import {Component, Inject, OnInit} from '@angular/core';
import {ServiceConstant} from '../../../shared/services/service-constant';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {StremSetHttpService} from '../../../shared/services/stream-set-http-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-preview-pipeline-error',
  templateUrl: './preview-pipeline-error.component.html'
})
export class PreviewPipelineErrorComponent implements OnInit {

  public errorData = null;
  public dropDownSettings = ServiceConstant.getDropDownDefaultSetting();

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<PreviewPipelineErrorComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any, private ssHttpService: StremSetHttpService, private router: Router) {
  }

  ngOnInit() {
    this.errorData = this.popUpData;
  }

  public close() {
    this.dialogRef.close();
  }
}
