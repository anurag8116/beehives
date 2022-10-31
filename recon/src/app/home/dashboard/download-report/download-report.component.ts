import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../shared/services/http-service';
import {AppConstants} from '../../../shared/services/app.constants';
import {ServiceConstant} from '../../../shared/services/service-constant';
import * as FileSaver from 'file-saver';
import {AuthService} from '../../../shared/services/auth.service';
import {DataTableService} from '../../../shared/services/data-table-service';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute, Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {FilterService} from '../../../shared/services/filter.service';
import {async} from 'rxjs/scheduler/async';
@Component({
  selector: 'app-download-report',
  templateUrl: './download-report.component.html',
})
export class DownloadReportComponent implements OnInit, AfterViewChecked {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public downloads: any = [];
  hasRoleCardOps = false;
  reportType = 'DASHLET';
  viewAllReport = false;

  constructor(private dateTableService: DataTableService, private httpService: HttpService,
              private authService: AuthService, private datePipe: DatePipe, private elRef: ElementRef,
              private filter: FilterService) {
    this.hasRoleCardOps = this.authService.hasRoleCardOps();
  }

  ngOnInit() {
    this.getDownloadRequestDataTable();
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
      this.elRef.nativeElement.querySelectorAll('a#uploadBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.uploadFile($(item).data('id'));
        });
      });
    }, 100);
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  getDownloadRequestDataTable() {
    this.dtOptions = Object.assign(this.dateTableService.getBasicTable('v1/dashletdownloads', this.getColumnsDefinition()),
      {searchCols: [null, null, null, null, {search: this.reportType}, null]});
  }

  getDownloadRequest() {
    this.httpService.get('v1/dashletdownloads?reportType=' + this.reportType + '&viewAll=' + this.viewAllReport, true).subscribe(
      (data: any) => {
        this.downloads = data.data;
      }
    );
  }

  public downloadFile(id: number): any {
    this.httpService.get('v1/dashletdownloads/file/' + id, true).subscribe(
      (data: any) => {
        this.httpService.downloadFile('v1/dashletdownloads/downloads/' + id).subscribe(
          (res: any) => {
            FileSaver.saveAs(res, data.dashletName ? data.dashletName : new  Date());
      }
    );
  }
    );
  }

  public uploadFile(id: number): any {
    this.httpService.get('v1/dashletdownloads/upload/' + id + '?Operation=UploadToAWS', true).subscribe(
      (data: any) => {
        this.httpService.displaySuccessOnPopUp('File uploading started');
        this.refresh();
      }
    );
  }

  refresh() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({title: 'REPORT', data: 'dashletName', bSortable: false});
    columns.push({title: 'REQUESTED BY', data: 'requestedBy', bSortable: false});
    columns.push({title: 'REQUESTED ON', data: 'requestedOn', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
    }, bSortable: false});
    columns.push({
      title: 'Action', data: 'id', render: (data, type, full) => {
        let actionHtml = '<a id ="downBtn" #downBtn data-id="' + data + '" href="javascript:void(0);" >' +
          '<i class="cursor fa fa-download col-1" aria-hidden="true" style="font-size: 15px;"></i></a>';
        if (full.reportType === 'CASHBACK_REPORT' && !full.uploadedOnAws) {
          actionHtml += '<a id ="uploadBtn" #uploadBtn data-id="' + data + '" href="javascript:void(0);" >' +
            '<i class="cursor fa fa-upload" aria-hidden="true" style="font-size: 15px;"></i></a>';
        }
        return actionHtml;
      }, bSortable: false
    });
    columns.push({title: 'REPORT TYPE', data: 'reportType', render: (data, type, full) => {
        return '';
      }, bSortable: false, visible: false
    });
    columns.push({title: 'VIEW ALL', data: 'viewAll', render: (data, type, full) => {
        return '';
      }, bSortable: false, visible: false
    });
    return columns;
  }
}
