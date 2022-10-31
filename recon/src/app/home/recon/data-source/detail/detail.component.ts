import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute} from '@angular/router';
import {isNullOrUndefined} from 'util';
import {StremSetHttpService} from '../../../../shared/services/stream-set-http-service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  private id: number;
  public dataSource: any = {module: {name: ''}, dataElements: []};
  public isScript: boolean;
  public pipeLines = '';

  constructor(private httpService: HttpService, private activeRoute: ActivatedRoute, private ssHttpService: StremSetHttpService, private  changeDef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;

      this.httpService.get('v1/datasources/' + this.id, true).subscribe(
        (data: any) => {
          this.dataSource = data;
          this.getPipelineNames();
          if (!isNullOrUndefined(this.dataSource.reconDbTableQuery) &&
            !isNullOrUndefined(this.dataSource.invalidDbTableQuery) &&
            !isNullOrUndefined(this.dataSource.historyDbTableQuery)) {
            this.isScript = true;
          }
        }
      );
    });
  }

  getPipelineNames(): string {
    if (this.dataSource.pipelineId) {
      this.ssHttpService.get('v1/pipelines?filterText=' + this.dataSource.module.name + '&orderBy=LAST_MODIFIED&order=ASC&label=system:allPipelines&includeStatus=true', true).subscribe(
        (existingPipelines: any) => {
          if (!isNullOrUndefined(existingPipelines[0])) {
            const formArrayPipelines = this.dataSource.pipelineId.split(',');
            if (formArrayPipelines.length > 0) {
              this.pipeLines = '';
              for (let i = 0; i < formArrayPipelines.length; i++) {

                for (const pipeline of existingPipelines[0]) {
                  if (pipeline.pipelineId === formArrayPipelines[i]) {
                    this.pipeLines += pipeline.description;
                    if (i !== formArrayPipelines.length - 1) {
                      this.pipeLines += ',';
                    }
                    break;
                  }
                }

              }
            }
          }
        });
    }
    this.changeDef.detectChanges();
    return this.pipeLines;
  }

}
