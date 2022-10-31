import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {MenuService} from '../../../../shared/menu.service';
import {Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DatePipe, Location} from '@angular/common';
import {FilterService} from '../../../../shared/services/filter.service';
import {Observable} from 'rxjs/Observable';
import {timer} from 'rxjs/observable/timer';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ListComponent implements OnInit, AfterViewChecked, OnDestroy {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public Jobs = [];
  public jobStatus = [{name: 'Running', id: 'RUNNING'}, {name: 'Runnable', id: 'RUNNABLE'}, {name: 'Failed', id: 'FAILED'},
    {name: 'Completed', id: 'COMPLETED'}];
  public subscription: Subscription;
  everySecond: Observable<number> = timer(30000, 30000);

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private filter: FilterService,
               private router: Router, private datePipe: DatePipe, private elRef: ElementRef) { }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/jobexecutions', this.getColumnsDefinition());
    this.httpService.get('v1/jobs?start=0', true).subscribe(
      (data: any) => {
        this.Jobs = data.data;
      }
    );
    this.subscription = this.everySecond.subscribe((seconds) => {
      this.refresh();
    });
  }

  refresh() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({title: 'ID', data: 'id'});
    columns.push({title: 'JOB', data: 'jobName', render: (data, type, full) => {
      const html = '<a id ="detailBtn" #detailBtn data-id="' + full.jobId + '" href="javascript:void(0);" ' +
        '> ' + data + ' </a>';
      return html;
    }});
    columns.push({title: 'STARTED ON', data: 'startedOn', render: (data, type, full) => {
      return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
    }});
    columns.push({title: 'FINISHED ON', data: 'finishedOn', render: (data, type, full) => {
      return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
    }});
    columns.push({title: 'EXECUTED BY', data: 'executedBy'});
    columns.push({title: 'STATUS', data: 'jobStatus'});
    return columns;
  }

  private onDetailButtonSelect(id) {
      this.router.navigate(['/home/scheduler', 'job', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {id: id}});
  }

  ngAfterViewChecked() {
    const self = this;
    setTimeout(() => {
      this.elRef.nativeElement.querySelectorAll('a#detailBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.onDetailButtonSelect($(item).data('id'));
        });
      });
    }, 100);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
