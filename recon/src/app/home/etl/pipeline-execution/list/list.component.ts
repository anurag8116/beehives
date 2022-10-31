import {Component, OnInit, ViewChild} from '@angular/core';
import {MenuService} from '../../../../shared/menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DatePipe} from '@angular/common';
import {StremSetHttpService} from '../../../../shared/services/stream-set-http-service';
import {DataTableDirective} from 'angular-datatables';
import {isNullOrUndefined} from 'util';
import {AuthService} from '../../../../shared/services/auth.service';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  public pipelines: any [] = [];
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public selectedIndex: number;

  constructor(private httpService: HttpService, private ssHttpService: StremSetHttpService, private router: Router,
              private route: ActivatedRoute, private authService: AuthService) {
  }

  ngOnInit() {
    this.getAllPipelineList();
    this.select(0);
  }

  select(index: number) {
    this.selectedIndex = index;
  }

  selectRecord() {
    for (let j = 0; j < 1; j++) {
      const pipelineId = this.pipelines[j].pipelineId;
      this.selectPipeLine(pipelineId);
      break;
    }
  }

  public selectPipeLine(pipeLineId: string): void {
    this.router.navigate(['/home/etl/part', 'execution', {outlets: {'bodyOutlet': ['detail']}}], {queryParams: {id: pipeLineId}});

  }

  searchPipeLineName(name: any) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(0).search(name).draw();
    });
  }

  private getAllPipelineList() {
    const userModule = this.authService.getLoggedInUserModule();
    this.ssHttpService.get('v1/pipelines?filterText=' + userModule + '&orderBy=LAST_MODIFIED&order=ASC&label=system:allPipelines&includeStatus=true', true).subscribe(
      (reponse: any) => {

        if (reponse.length >= 2 && !isNullOrUndefined(reponse[1])) {
          this.pipelines = [];
          for (let i = 0; i < reponse[1].length; i++) {
            const modules = reponse[0][i].title.split(',');
            if (modules.indexOf(userModule) !== -1) {
              this.pipelines.push(Object.assign(reponse[0][i], reponse[1][i]));
            }
          }
          this.selectRecord();
        }
      }
    );
  }

}
