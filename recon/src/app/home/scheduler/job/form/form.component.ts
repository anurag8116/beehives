import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {StremSetHttpService} from '../../../../shared/services/stream-set-http-service';
import {isNullOrUndefined} from 'util';
import {ServiceConstant} from '../../../../shared/services/service-constant';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean;
  public isShow: boolean;
  public isOther: boolean;
  public id: number;
  public isEditMode: boolean;
  public modules = [];
  public glBalanceConfigs = [];
  public scheduleSqlQuerys = [];
  public dataSources = [];
  public conflictWithJobs = [];
  public reconEvents = ['DATA_UPLOADED', 'INVALID_DATA_PROCESSED', 'RECON_FINISHED'];
  public activityMap: Map<string, any[]> = new Map<string, any[]>();
  public pipeLineList: any[] = [];
  public scheduleTypes = ['CRON', 'EVENT', 'MANUAL'];
  public activityType = ['PIPE_LINE', 'RECON', 'GL_EXECUTION', 'REPORT_GROUP', 'DISPUTE', 'REPORT', 'SERVICE_CHARGE_AND_GST_CAL', 'DATA_PRE_PROCESSING'];
  public dropDownSettings = ServiceConstant.getDropDownDefaultSetting();
  public recons: any;
  public cronExpression = '5 0/6 * 1/1 * ? *';
  public cronOptions: any = {
    formInputClass: 'form-control cron-editor-input',
    formSelectClass: 'form-control cron-editor-select',
    formRadioClass: 'cron-editor-radio',
    formCheckboxClass: 'cron-editor-checkbox',
    defaultTime: '00:00:00',
    hideMinutesTab: false,
    hideHourlyTab: false,
    hideDailyTab: false,
    hideWeeklyTab: false,
    hideMonthlyTab: false,
    hideYearlyTab: false,
    hideAdvancedTab: false,
    hideSpecificWeekDayTab: false,
    hideSpecificMonthWeekTab: false,
    use24HourTime: true,
    hideSeconds: false,
    cronFlavor: 'standard' // standard or quartz
  };

  constructor(private httpService: HttpService, private router: Router, private ssHttpService: StremSetHttpService,
              private activeRoute: ActivatedRoute, private changeDetectorRef: ChangeDetectorRef) {
    this.isShow = false;
    this.isOther = false;
  }

  ngOnInit() {
    this.isLoading = false;
    this.form = new FormGroup({
      id: new FormControl(null),
      name: new FormControl(null),
      scheduleType: new FormControl('CRON'),
      moduleId: new FormControl(null),
      cronExpression: new FormControl(null),
      eventName: new FormControl(null),
      noOfRetrial: new FormControl(null),
      retrialInterval: new FormControl(null),
      description: new FormControl(null),
      activities: new FormArray([]),
      dataSources: new FormControl(null),
      conflictJobs: new FormControl(null),
      reconId: new FormControl(null)
    });
    this.httpService.get('v1/glconfigrations', true).subscribe(
      (data: any) => {
        this.glBalanceConfigs = data.data;
        this.activityMap.set('GL_EXECUTION', this.glBalanceConfigs);
      }
    );
    this.httpService.get('v1/scheduleSqlQuerys', true).subscribe(
      (data: any) => {
        this.scheduleSqlQuerys = data.data;
        this.activityMap.set('DATA_PRE_PROCESSING', this.scheduleSqlQuerys);
      }
    );
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
        this.activeRoute.queryParams.subscribe(params => {
          this.id = +params['id'] || null;
          if (this.id) {
            this.isEditMode = true;
            this.onEditJob(this.id);
          }
        });
      }
    );

    this.httpService.get('v1/jobs?start=0', true).subscribe(
      (data: any) => {

        if (data.data.length > 0) {
          for (let i = 0; i < data.data.length; i++) {
            const jobc = data.data[i];
            if (jobc.id !== this.id) {
              this.conflictWithJobs.push({id: jobc.id, itemName: jobc.name});
            }

          }
        }

      }
    );

    this.addDataElement();
    this.onActivity();
  }

  onSchedulingTypeChange() {
    this.form.patchValue({cronExpression: null});
  }

  public addDataElement(): void {
    const control = new FormGroup({
      activity: new FormGroup({
        typeId: new FormControl(null)
      }),
      sequence: new FormControl(null),
      disputeActivity: new FormControl(null),
      id: new FormControl(null),
      type: new FormControl(null),
    });
    (<FormArray>this.form.get('activities')).push(control);
  }

  public removeDataElement(i: number): void {
    (<FormArray>this.form.get('activities')).removeAt(i);

  }

  onActivity() {
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.activityMap.set('REPORT_GROUP', data.data);
      }
    );
    this.httpService.get('v1/reports?start=0', true).subscribe(
      (data: any) => {
        this.activityMap.set('REPORT', data.data);
      }
    );
    this.activityMap.set('DISPUTE', [{
      id: 'DUPLICATE_DISPUTE_MARKER',
      name: 'DUPLICATE DISPUTE MARKER'
    }, {
      id: 'TRANSACTION_MATCHER',
      name: 'TRANSACTION MATCHER'
    }, {
      id: 'DISPUTE_TO_RESPONSE_MATCHER',
      name: 'DISPUTE TO RESPONSE MATCHER'
    }, {
      id: 'DISPUTE_RESPONSE_HANDLER',
      name: 'DISPUTE RESPONSE HANDLER'
    }]);
  }

  onSubmit() {
    this.isLoading = true;
    const formArrayActivities = <FormArray>this.form.controls['activities'];
    if (formArrayActivities.length > 0) {
      for (let i = 0; i < formArrayActivities.length; i++) {
        formArrayActivities.at(i).get('sequence').setValue(i + 1);
      }
    }
    if (this.id) {
      this.httpService.put('v1/jobs?opertionType=UPDATE', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Job Successfully Updated !');
          this.router.navigate(['/home/scheduler', 'job', {
            outlets: {
              'fullBodyOutlet': ['list'],
            }
          }]);
        },
        (errorResponse: HttpErrorResponse) => {
          this.isLoading = false;
        }
      );
    } else {
      this.httpService.post('v1/jobs', this.form.getRawValue(), true).subscribe(
        (data: any) => {
          this.isLoading = false;
          this.form.reset();
          this.httpService.displaySuccessOnPopUp('Job Successfully Created !');
          this.router.navigate(['/home/scheduler', 'job', {
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

  onModuleSelect(id: number) {
    this.httpService.get('v1/datasources?Find=ByModuleForMultiSelect&moduleId=' + id, true).subscribe(
      (data: any) => {
        this.dataSources = data;
        if (this.dataSources && this.dataSources.length > 0) {
          const sources = [];
          for (const source of this.dataSources) {
            sources.push({id: source.id, name: source.itemName});
          }
          this.activityMap.set('SERVICE_CHARGE_AND_GST_CAL', sources);
        }

      }
    );
    this.recons = [];
    this.httpService.get('v1/recons?Find=ByModuleAndHasRuleGroup&moduleId=' + id, true).subscribe(
      (data: any) => {
        this.recons = data;
        this.activityMap.set('RECON', this.recons);
      }
    );
    const moduleName = this.getModuleNameById(id);
    this.ssHttpService.get('v1/pipelines?filterText=' + moduleName + '&orderBy=LAST_MODIFIED&order=ASC&label=system:allPipelines&includeStatus=true', true).subscribe(
      (reponse: any) => {
        this.activityMap.set('PIPE_LINE', reponse[0]);
      });
  }

  getModuleNameById(moduleId: number): string {
    for (const module of this.modules) {
      if (module.id === Number(moduleId)) {
        return module.name;
      }
    }
  }

  openModalDialog() {
    $('#backdrop').css({'display': 'block'});
    $('#modal').css({'display': 'block'});
  }

  closeModalDialog(submitIs = false) {
    if (submitIs) {
      this.form.patchValue({cronExpression: this.cronExpression});
    }
    $('#backdrop').css({'display': 'none'});
    $('#modal').css({'display': 'none'});
  }

  private onEditJob(id: number) {
    this.httpService.get('v1/jobs/' + this.id, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          this.onModuleSelect(data.moduleId);
          this.form.removeControl('activities');
          this.cronExpression = data.cronExpression;
          this.form.addControl('activities', new FormArray([]));
          for (const activity of data.activities) {
            if (isNullOrUndefined(activity.activity)) {
              activity.activity = {};
            }
            this.addDataElement();
          }
          this.form.patchValue(data);
          this.changeDetectorRef.detectChanges();
        }
      });
  }
}
