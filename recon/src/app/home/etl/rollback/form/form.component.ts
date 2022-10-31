import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {AppConstants} from '../../../../shared/services/app.constants';
import {StremSetHttpService} from '../../../../shared/services/stream-set-http-service';
import {AuthService} from '../../../../shared/services/auth.service';
import {ServiceConstant} from '../../../../shared/services/service-constant';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public pipeLineExecutions = [];
  public pipeLines = [];
  public sourceType = ['DATABASE', 'FILE', 'REST', 'SOUP_URL'];
  public bsConfigToDate = AppConstants.getDatePickerConfig();
  public dropDownSettings: any = {};
  public modules = [];

  constructor(private httpService: HttpService, private router: Router, private ssHttpService: StremSetHttpService, private  authService: AuthService) {
  }

  ngOnInit() {
    this.dropDownSettings = ServiceConstant.getDropDownDefaultSetting();
    this.isLoading = false;
    this.form = new FormGroup({
      pipeLine: new FormControl(null),
      pipeLineName: new FormControl(null),
      pipeLineExecution: new FormControl(null),
      module: new FormControl(null),
    });
    this.ssHttpService.get('v1/pipelines?filterText=' + this.authService.getLoggedInUserModule() + '&orderBy=LAST_MODIFIED&order=ASC&label=system:allPipelines&includeStatus=true', true).subscribe(
      (data: any) => {
        this.pipeLines = data[0];
      }
    );
  }

  onPipeLineSelect (pipeLineId: any) {
    this.modules = [];
    this.form.get('module').reset();
    this.ssHttpService.get('v1/pipeline/' + pipeLineId, true).subscribe(
      async (data: any) => {
        const name = data.title.split(',');
        for (const val of name) {
           this.modules.push({id: val, itemName: val});
        }
      }
    );
    for (let i = 0; i < this.pipeLines.length; i++) {
      if (this.pipeLines[i].pipelineId === pipeLineId) {
         this.form.patchValue({pipeLineName: this.pipeLines[i].description});
      }
    }
    this.httpService.get('v1/pipelineexecutions?pipeLine=' + pipeLineId + '&start=0', true).subscribe(
      (data: any) => {
        this.pipeLineExecutions = data;
      }
    );
  }

  onSubmit() {
    this.isLoading = true;

    this.httpService.post('v1/rollbacks', this.form.getRawValue(), true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.form.reset();
        this.httpService.displaySuccessOnPopUp('Rollback Successfully Created !');
        this.router.navigate(['/home/etl', 'rollback', {
          outlets: {
            'fullBodyOutlet': ['list'],
          }
        }]);
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
      }
    );
  }

}
