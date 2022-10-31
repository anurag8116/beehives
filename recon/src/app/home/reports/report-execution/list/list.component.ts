import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {MenuService} from '../../../../shared/menu.service';
import {DatePipe, Location} from '@angular/common';
import {FilterService} from '../../../../shared/services/filter.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ServiceConstant} from '../../../../shared/services/service-constant';
import {AppConstants} from '../../../../shared/services/app.constants';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  public reportExecution: any [] = [];
  public reports: any [] = [];
  public groups: any [] = [];
  dtOptions: DataTables.Settings = {};
  @ViewChild('tableContainer') tableContainer: ElementRef;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  private id: any;

  constructor(private http: HttpService, private dateTableService: DataTableService, public location: Location, private router: Router, private datePipe: DatePipe
    , private menuService: MenuService, private activeRoute: ActivatedRoute, private filter: FilterService, private sanitizer: DomSanitizer, private elRef: ElementRef,) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/reportexecutions', this.getColumnsDefinition());
    this.onDetailButtonSelect();
    this.http.get('v1/reportexecutions?start=0', true).subscribe(
      (data: any) => {
        this.reportExecution = data.data;
      }
    );
    this.getReportList();
    this.getGroupList();
   // this.downloadFile(1);
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  ngAfterViewChecked() {
    const self = this;
    setTimeout(() => {
      this.elRef.nativeElement.querySelectorAll('a#downBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.downloadFile($(item).data('id'));
        });
      });
    }, 100);
  }

  public downloadFile(id): any {
      this.http.get('v1/reportexecutions/downloads/' + id + "?exportType=CSV", true).subscribe(
        (data: any) => {
          FileSaver.saveAs(AppConstants.base64ToExcel(data.filePath), new  Date().toString());
        }
      );
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({title: 'ID', data: 'id'});
    columns.push({title: 'Report', data: 'reportName'});
    columns.push({title: 'Group', data: 'groupName'});
    columns.push({title: 'Execution Type', data: 'executionType'});
    columns.push({
      title: 'Execution Time', data: 'executionTime', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }
    });
    columns.push({title: 'Status', data: 'status'});
    columns.push({
      title: 'Action', data: 'id', render: (data, type, full) => {
      //  const url = ServiceConstant.URL + 'v1/reportexecutions/downloads/' + data + '?exportType=csv&X-ASCENT-AUTHTOKEN=' + localStorage.getItem(AppConstants.AUTH_TOKEN);
       // const url = this.genrateLocalUrl('v1/reportexecutions/downloads/' + data + '?exportType=EXCEL&X-ASCENT-AUTHTOKEN=' + localStorage.getItem(AppConstants.AUTH_TOKEN));
        let actionHtml = '<div class="btn-group">';
        actionHtml += ' <a id ="editBtn" data-id="' + data + '"  href="javascript:void(0);" class="dropdown-item" style="width: inherit"><i class="fa fa-pencil-square-o icon-2x pull-right cursor" aria-hidden="true"></i></a>';
        actionHtml += ' </div>';
        actionHtml += '<a id ="downBtn" #downBtn data-id="' + data + '" class="btn activate-btn" style="margin-left: 10px;" href="javascript:void(0);" >Download</a>';
        return actionHtml;
      }
    });
    return columns;
  }

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a', function () {
      that.router.navigate(['/home/reports', 'report-execution', {outlets: {'fullBodyOutlet': ['list']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }

  private getReportList() {
    this.http.get('v1/reports?start=0', true).subscribe(
      (data: any) => {
        this.reports = data.data;
      }
    );
  }

  private getGroupList() {
    this.http.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.groups = data.data;
      }
    );
  }

  genrateLocalUrl(url: string): any {
    this.http.downloadFile(url).subscribe(response => {
      const blob = new Blob([response.body], {type: 'application/octet-stream'});
      return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    });
  }
}
