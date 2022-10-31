import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {StremSetHttpService} from '../../../../shared/services/stream-set-http-service';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  private id = '';
  public pipelineStatus: any = {};
  public pipelineHistory: any = {};
  public pipeline: any = {};

  constructor(private dateTableService: DataTableService, private httpService: StremSetHttpService, private activeRoute: ActivatedRoute, private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(queryParams => {
      this.id = queryParams['id'] || null;
      this.httpService.get('v1/pipeline/' + this.id + '/status?rev=0', true).subscribe(
        (data: any) => {
          this.pipelineStatus = data;
        }
      );

      this.httpService.get('v1/pipeline/' + this.id + '/history?rev=0', true).subscribe(
        (data: any) => {
          this.pipelineHistory = data;
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.clear().rows.add(this.pipelineHistory).draw();
          });
        }
      );
      this.httpService.get('v1/pipeline/' + this.id, true).subscribe(
        (data: any) => {
          this.pipeline = data;
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.clear().rows.add(this.pipeline).draw();
          });
        }
      );
    });
    this.dtOptions = this.dateTableService.getSSBasicTable(this.pipelineHistory, this.getColumnsDefinition());
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'EXECUTION ON', data: 'timeStamp', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
      }
    });
    columns.push({title: 'EXECUTED BY', data: 'user', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'STATUS', data: 'status'});
    columns.push({title: 'MESSAGE', data: 'message', bSortable: false, render:  $.fn.dataTable.render.text()});
    return columns;
  }

  restPipelineOrigin() {
    this.httpService.post('v1/pipeline/' + this.id + '/resetOffset', {}, true).subscribe(
      (data: any) => {
      }
    );
  }
}
