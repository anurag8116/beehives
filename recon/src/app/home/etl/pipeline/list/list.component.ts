import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {MenuService} from '../../../../shared/menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import {DatePipe} from '@angular/common';
import {StremSetHttpService} from '../../../../shared/services/stream-set-http-service';
import {HttpErrorResponse} from '@angular/common/http';
import {AuthService} from '../../../../shared/services/auth.service';
import {MatDialog} from '@angular/material';
import {ReconDataType} from '../../../../shared/services/enum';
import {CreatePipelineComponent} from '../../../pop-up/create-pipeline/create-pipeline.component';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {timer} from 'rxjs/observable/timer';
import {environment} from '../../../../../environments/environment.poc';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit, OnDestroy {
  dtOptions: DataTables.Settings = {};
  public showPipelineDetails: Boolean = environment.showPipelineDetails;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public filteredPipelines: any [] = [];
  public statues = ['RUNNING', 'EDITED', 'STOPPED', 'FINISHED'];
  public modulesOption = [];
  public modulesOptionForMultiSelect = [];
  public subscription: Subscription;
  everySecond: Observable<number> = timer(0, 5000);
  public isRunningPipeline: boolean;
  public isPipelineOperationDisable = true;

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private ssHttpService: StremSetHttpService,
              private menuService: MenuService, private router: Router, private route: ActivatedRoute, private datePipe: DatePipe, private  authService: AuthService, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.getAllPipelineList();
    this.dtOptions = this.dateTableService.getSSBasicTable(this.filteredPipelines, this.getColumnsDefinition());
    this.getPipelineOperationSetting();
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data.data) && data.data.length > 0) {
          this.modulesOption = [];
          for (const module of data.data) {
            this.modulesOption.push({label: module.name, value: module.name});
            this.modulesOptionForMultiSelect.push({id: module.name, itemName: module.name});
          }
        }
      }
    );
    this.onDetailButtonSelect();
    this.onActionButtonSelect();
    this.onEditButtonSelect();
    this.subscription = this.everySecond.subscribe((seconds) => {
      this.getAllPipelineList();
    });
  }

  getPipelineOperationSetting() {
    this.isPipelineOperationDisable = true;
    this.httpService.get('v1/globalsettings?Find=BySettingGroup&settingGroup=ETL_SETTING', true).subscribe((setting: any) => {
      if (!isNullOrUndefined(setting)) {
        for (const data of setting) {
          if (data.settingKey === 'PIPELINE') {
            this.isPipelineOperationDisable = data.settingValue !== 'Yes';
            break;
          }
        }
      }
    });
  }

  public async onSetTransaction(id, title, name, moduleName, status) {
    await this.checkRunnablePipeline().then(result => {
      if (result[1].length > 0) {
        this.isRunningPipeline = true;
      } else {
        this.isRunningPipeline = false;
      }
    });
    if (this.isRunningPipeline) {
      this.httpService.displayErrorOnPopUp('Pipeline already running');
    } else {
      const pipeline = {
        pipelineId: id,
        pipelineName: name,
        eventType: title === 'Start' ? 'START' : 'STOP',
        moduleName: moduleName
      };
      status = (status === 'RUNNING' ? 'stop' : 'start');
      this.ssHttpService.post('v1/pipeline/' + id + '/' + status + '?rev=0', {}, true).subscribe(
        (data: any) => {
          this.getAllPipelineList();
          this.pipelineEventTigger(pipeline);
          this.httpService.displaySuccessOnPopUp('Pipeline Successfully Update !');
        },
        (errorResponse: HttpErrorResponse) => {
        }
      );
    }
  }

  searchByStatus(status: any) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(4).search(status).draw();
    });
  }

  searchByModule(module: any) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(2).search(module).draw();
    });
  }

  searchPipeLineName(name: any) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(1).search(name).draw();
    });
  }

  searchCreatedByName(name: any) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(3).search(name).draw();
    });
  }

  public onNewPipelineSelect() {
    const data = {modules: this.modulesOptionForMultiSelect};
    const dialogRef = this.dialog.open(CreatePipelineComponent, {width: '40%', height: '35%', data});
    dialogRef.afterClosed().subscribe(result => {
      console.log('popup is closed');
    });
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

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'ID', data: 'pipelineId', bSortable: false, render: (data, type, full) => {
        const html = '<a id ="detailBtn" data-id="' + data + '" href="javascript:void(0);" ' +
          '> ' + data + ' </a>';
        return html;
      }
    });
    columns.push({title: 'NAME', data: 'description', bSortable: false, render: $.fn.dataTable.render.text()});
    columns.push({title: 'MODULE', data: 'title', render: $.fn.dataTable.render.text()});
    columns.push({
      title: 'LAST EXECUTION', data: 'timeStamp', bSortable: false, render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
      }
    });
    columns.push({title: 'STATUS', data: 'status', bSortable: false});
    columns.push({
      title: 'ACTION', data: 'pipelineId', bSortable: false, render: (data, type, full) => {

        let actionBtn = '';
        if (!this.isPipelineOperationDisable) {
          if (full.status === 'RUNNING') {
            actionBtn = '<a class="btn stop-btn"  style="margin-left: 4px;padding: 1px 15px;" #actionBtn id ="actionBtn" data-name="' + full.description + '" data-status="' + full.status + '" data-id="' + data + '" data-title="' + full.title + '" href="javascript:void(0);" ' +
              '> Stop</a>';
          } else {
            actionBtn = '<a class="btn start-btn"  style="margin-left: 4px;padding: 1px 15px;" #actionBtn id ="actionBtn" data-name="' + full.description + '" data-status="' + full.status + '" data-id="' + data + '" data-title="' + full.title + '" href="javascript:void(0);" ' +
              '> Start</a>';
          }
        }
        if (this.showPipelineDetails) {
          actionBtn = '<a class="btn edit-btn"  style="padding: 1px 15px;" #editBtn id ="editBtn" data-id="' + data + '" href="javascript:void(0);" ' +
            '> Edit</a>' + actionBtn;
        }
        return actionBtn;
      }
    });
    columns.push({
      title: 'Last Modified', data: 'lastModified', order: 'des', visible: false
    });
    return columns;
  }


  private getAllPipelineList() {
    this.ssHttpService.get('v1/pipelines?filterText=' + this.authService.getLoggedInUserModule() + '&orderBy=LAST_MODIFIED&order=ASC&label=system:allPipelines&includeStatus=true', true).subscribe(
      (reponse: any) => {
        if (reponse.length >= 2 && !isNullOrUndefined(reponse[1])) {
          this.filteredPipelines = [];
          const userModule = this.authService.getLoggedInUserModule();
          for (let i = 0; i < reponse[1].length; i++) {
            const modules = reponse[0][i].title.split(',');
            if (modules.indexOf(userModule) !== -1) {
              this.filteredPipelines.push(Object.assign(reponse[0][i], reponse[1][i]));
            }
          }
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.clear().rows.add(this.filteredPipelines).order([6, 'desc']).draw();
          });
        }
      }
    );
  }

  private onActionButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a#actionBtn', function () {
      const id = jQuery(this).data('id');
      const status = jQuery(this).data('status');
      const name = jQuery(this).data('name');
      const moduleName = jQuery(this).data('title');
      const title = (status === 'RUNNING' ? 'Stop' : 'Start');
      $.confirm({
        title: title + ' pipeLine !', columnClass: 'col-md-4 col-md-offset-4', offsetBottom: 400, type: 'blue',
        buttons: {
          formSubmit: {
            text: 'Submit', btnClass: 'submit-btn', action: function () {
              if (status === 'RUNNING') {
                that.onSetTransaction(id, title, name, moduleName, status);
              } else {
                that.ssHttpService.post('v1/pipeline/' + id + '/resetOffset', {}, true).subscribe(
                  (data: any) => {
                    that.onSetTransaction(id, title, name, moduleName, status);
                  }
                );
              }
            }
          },
          cancel: {
            btnClass: 'btn btn-primary cancel-btn', action: function () {
            }
          },
        },
      });
    });
  }

  private async checkRunnablePipeline() {
    this.isRunningPipeline = false;
    return this.ssHttpService.get('v1/pipelines?filterText=' + this.authService.getLoggedInUserModule() + '&orderBy=LAST_MODIFIED&order=ASC&label=system:runningPipelines&includeStatus=true', true)
      .toPromise();
  }

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a#detailBtn', function () {
      that.menuService.action.next(jQuery(this).data('id'));
      that.router.navigate(['/home/etl', 'pipeline', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {pipelineId: jQuery(this).data('id')}});
    });
  }

  private onEditButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a#editBtn', function () {
      that.menuService.action.next(jQuery(this).data('id'));
      that.router.navigate(['/home/etl', 'pipeline', {outlets: {'fullBodyOutlet': ['edit']}}], {queryParams: {pipelineId: jQuery(this).data('id')}});
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
