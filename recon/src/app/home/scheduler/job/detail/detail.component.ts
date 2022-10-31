import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {StremSetHttpService} from '../../../../shared/services/stream-set-http-service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  private id: number;
  public job: any = {};
  private pipelines: Map<string, any> = new Map<string, any>();

  constructor(private httpService: HttpService, private activeRoute: ActivatedRoute, private router: Router,
              private location: Location, private ssHttpService: StremSetHttpService) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;

      this.httpService.get('v1/jobs/' + this.id, true).subscribe(
        (data: any) => {
          if (data && data.moduleName) {
            this.getPipelines(data.moduleName);
          }
          this.job = data;
        }
      );
    });
  }

  getPipelines(moduleName = '') {
    this.ssHttpService.get('v1/pipelines?filterText=' + moduleName + '&orderBy=LAST_MODIFIED&order=ASC&label=system:allPipelines&includeStatus=true', true).subscribe(
      (reponse: any) => {
        for (const pipeline of reponse[0]) {
          this.pipelines.set(pipeline.pipelineId, pipeline.description);
        }
        const activities = [];
        if (this.pipelines.size > 0 && this.job.activities && this.job.activities.length > 0) {
          for (let jobActivity of this.job.activities) {
            if (jobActivity.type === 'PIPE_LINE') {
              const pipelineName = this.pipelines.has(jobActivity.activity.typeId) ? this.pipelines.get(jobActivity.activity.typeId) : jobActivity.activity.name;
              jobActivity = {...jobActivity, activity: {...jobActivity.activity, name: pipelineName}};
            }
            activities.push({...jobActivity});
          }
          this.job = {...this.job, activities: activities};
        }
      });
  }

  back () {
    this.location.back();
  }
}
