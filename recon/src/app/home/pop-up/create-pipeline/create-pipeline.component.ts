import {Component, Inject, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';
import {ServiceConstant} from '../../../shared/services/service-constant';
import {FormControl, FormGroup} from '@angular/forms';
import {StremSetHttpService} from '../../../shared/services/stream-set-http-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-pipeline',
  templateUrl: './create-pipeline.component.html'
})
export class CreatePipelineComponent implements OnInit {


  public form: FormGroup;
  public modules = [];
  public dropDownSettings = ServiceConstant.getDropDownDefaultSetting();

  constructor(private httpService: HttpService, private dialogRef: MatDialogRef<CreatePipelineComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any, private ssHttpService: StremSetHttpService, private router: Router) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null),
      description: new FormControl(null),
    });
    this.modules = this.popUpData.modules;
  }

  public onSubmit() {
    const title = this.form.get('title').value;
    const description = this.form.get('description').value;
    if (!title || !description || title.length <= 0) {
      this.httpService.displayErrorOnPopUp((!title ? 'Module' : 'Pipeline Name') + ' is required!');
    } else {
      this.dialogRef.close();
      let moduleNames = '';
      for (let i = 0; i < title.length; i++) {
        moduleNames += title[i].id;
        if (i !== title.length - 1) {
          moduleNames += ',';
        }
      }
      this.ssHttpService.put('v1/pipeline/' + moduleNames + '?autoGeneratePipelineId=true&description=' + description + '&pipelineType=DATA_COLLECTOR', {}, true).subscribe(
        (data: any) => {
          this.setStaticDataForErrorHandling(data);
          this.ssHttpService.post('v1/pipeline/' + data.info.pipelineId, data, true).subscribe(
            async (pipelineInfo: any) => {
              const pipeline = {
                pipelineId: data.info.pipelineId,
                pipelineName: data.info.description,
                eventType: 'CREATE',
                moduleName: data.info.title
              };
              this.pipelineEventTigger(pipeline);
              this.router.navigate(['/home/etl', 'pipeline', {outlets: {'fullBodyOutlet': ['edit']}}], {queryParams: {pipelineId: data.info.pipelineId}});
            },
            (errorResponse: HttpErrorResponse) => {
              console.log('error while set static data pipeline');
            });
        },
        (errorResponse: HttpErrorResponse) => {
          console.log('error while  pipeline creation');
        }
      );
    }
  }

  public close() {
    this.dialogRef.close();
  }

  private pipelineEventTigger(pipeline): void {
    this.httpService.post('v1/pipelineevent', pipeline, true).subscribe(
      (data: any) => {
        console.log(data);
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  private setStaticDataForErrorHandling(pipelineInfo: any): any {
    if (!isNullOrUndefined(pipelineInfo) && !isNullOrUndefined(pipelineInfo.configuration) && pipelineInfo.configuration.length > 0) {
      for (const model of pipelineInfo.configuration) {
        if (model['name'] === 'badRecordsHandling') {
          model.value = 'streamsets-datacollector-basic-lib::com_streamsets_pipeline_stage_destination_devnull_ToErrorNullDTarget::1';
          break;
        }
      }
    }
    pipelineInfo = Object.assign(pipelineInfo, {
      'uiInfo': {
        'previewConfig': {
          'previewSource': 'CONFIGURED_SOURCE',
          'batchSize': 10,
          'timeout': 30000,
          'writeToDestinations': false,
          'executeLifecycleEvents': false,
          'showHeader': false,
          'showFieldType': true,
          'rememberMe': false
        }
      }, 'errorStage': {
        'instanceName': 'Discard_ErrorStage',
        'library': 'streamsets-datacollector-basic-lib',
        'stageName': 'com_streamsets_pipeline_stage_destination_devnull_ToErrorNullDTarget',
        'stageVersion': '1',
        'configuration': [],
        'uiInfo': {
          'description': '',
          'label': 'Error Records - Discard',
          'xPos': 60,
          'yPos': 50,
          'stageType': 'TARGET'
        },
        'inputLanes': [],
        'outputLanes': [],
        'eventLanes': [],
        'services': []
      }, 'startEventStages': [
        {
          'instanceName': 'Discard_StartEventStage',
          'library': 'streamsets-datacollector-basic-lib',
          'stageName': 'com_streamsets_pipeline_stage_destination_devnull_ToErrorNullDTarget',
          'stageVersion': '1',
          'configuration': [],
          'uiInfo': {
            'description': '',
            'label': 'Start Event - Discard',
            'xPos': 60,
            'yPos': 50,
            'stageType': 'TARGET'
          },
          'inputLanes': [],
          'outputLanes': [],
          'eventLanes': [],
          'services': []
        }
      ], 'stopEventStages': [
        {
          'instanceName': 'Discard_StopEventStage',
          'library': 'streamsets-datacollector-basic-lib',
          'stageName': 'com_streamsets_pipeline_stage_destination_devnull_ToErrorNullDTarget',
          'stageVersion': '1',
          'configuration': [],
          'uiInfo': {
            'description': '',
            'label': 'Stop Event - Discard',
            'xPos': 60,
            'yPos': 50,
            'stageType': 'TARGET'
          },
          'inputLanes': [],
          'outputLanes': [],
          'eventLanes': [],
          'services': []
        }
      ],
    });
    return pipelineInfo;
  }
}
