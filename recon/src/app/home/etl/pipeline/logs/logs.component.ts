import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {StremSetHttpService} from '../../../../shared/services/stream-set-http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DataTableDirective} from 'angular-datatables';
import {AuthService} from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html'
})
export class LogsComponent implements OnInit {
  public pipelineId;
  public redirectTo;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public logsData = [];
  public filteredPipelines: any [] = [];

  constructor(private dateTableService: DataTableService, private ssHttpService: StremSetHttpService, private router: Router,
              private  route: ActivatedRoute, private  authService: AuthService) {

  }

  ngOnInit() {
    this.getAllPipelineList();
    this.route.params.subscribe((param: Params) => {
      this.pipelineId = param['pipelineId'] || null;
      this.redirectTo = param['type'] || null;
      this.getLogs(this.pipelineId);
    });
    this.dtOptions = this.dateTableService.getSSBasicTable(this.logsData, this.getColumnsDefinition());
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({title: 'TIMESTAMP', data: 'timestamp'});
    columns.push({title: 'PIPELINE', data: 's-entity'});
    columns.push({title: 'SERVERITY', data: 'severity'});
    columns.push({title: 'MESSAGE', data: 'message'});
    columns.push({title: 'CATEGORY', data: 'category'});
    columns.push({title: 'USER', data: 's-user'});
    columns.push({title: 'RUNNER', data: 's-runner'});
    columns.push({title: 'THREAD', data: 'thread'});
    return columns;
  }

  private getLogs(pipelineName) {
    this.ssHttpService.get('v1/system/logs?endingOffset=-1&pipeline=' + pipelineName, true).subscribe(
      (reponse: any[]) => {
        reponse.shift();
        this.logsData = reponse;
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.clear().rows.add(this.logsData).draw();
        });

      }
    );
  }

  private getAllPipelineList() {
    this.ssHttpService.get('v1/pipelines?filterText=' + this.authService.getLoggedInUserModule() + '&orderBy=LAST_MODIFIED&order=ASC', true).subscribe(
      (reponse: any[]) => {
        if (reponse.length > 0) {
          this.filteredPipelines = reponse;
        }
      }
    );
  }

  searchBySeverity(type) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(2).search(type).draw();
    });
  }

  searchPipeLineName(name: any) {
    this.pipelineId = name;
    this.getLogs(name);
  }

  navigateToForm() {
    this.router.navigate(['/home/etl', 'pipeline', {outlets: {'fullBodyOutlet': [this.redirectTo]}}], {
      queryParams: {
        pipelineId: this.pipelineId
      }
    });
  }
}
