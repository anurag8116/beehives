import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {ServiceConstant} from '../../../../shared/services/service-constant';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {AppConstants} from '../../../../shared/services/app.constants';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpService} from '../../../../shared/services/http-service';
import {DatePipe} from '@angular/common';
import {FilterService} from '../../../../shared/services/filter.service';
import {ACTIVITIES} from './activity.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  dtOptions: any = {};
  @ViewChild('tableContainer') tableContainer: ElementRef;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public url = ServiceConstant.URL + 'v1/auditactivities';
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public getDatePickerConfigRestrictPastDate: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig(true);
  public activityNames: any;
  activities = ACTIVITIES;
  selectedActivity = null;

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private datePipe: DatePipe,
              private filterService: FilterService) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/auditlogs', this.getColumnsDefinition());
    this.httpService.get('v1/auditlogs?Find=ByActivityName', true).subscribe(
      (data: any) => {
        this.activityNames = data;
      }
    );
  }

  public search(val: string, columnIndex: number): void {
    this.filterService.search(val, columnIndex, this.dtElement);
  }

  public searchByDate(val: string, columnIndex: number): void {
    this.filterService.searchByDate(val, columnIndex, this.dtElement);
  }

  public getToDatePickerConfig(fromDate: string): void {
    const date = AppConstants.getDateFromString(fromDate);
    this.getDatePickerConfigRestrictPastDate = AppConstants.getDatePickerConfig(false, date);
  }


  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'DATE', data: 'fromDate', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }
    });
    columns.push({title: 'USER', data: 'user', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'ACTIVITY', data: 'displayName'});
    columns.push({title: 'IP ADDRESS', data: 'ipAddress'});
    columns.push({
      title: 'DESCRIPTION', data: 'pramName', bSortable: false, render: (data, type, full) => {
        const item = full.pramName;
        return item;
      }
    });
    columns.push({title: 'TO DATE', data: 'toDate', visible: false});
    columns.push({title: 'ACTIVITY', data: 'activity', visible: false});
    return columns;
  }

  searchByKeyDown($event) {
    if (this.selectedActivity === '') {
      this.search('', 6);
    }
  }
}
