import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {Location, DatePipe} from '@angular/common';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute} from '@angular/router';
import {isNullOrUndefined} from 'util';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-gl-config-detail',
  templateUrl: './gl-config-detail.component.html'
})
export class GlConfigDetailComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('tableContainer') tableContainer: ElementRef;

  private id: number;
  private type: string;
  private configId: number;
  private date: string;
  private tab: string;
  private fromDate: string;
  private toDate: string;

  constructor(private router: Router, private activeRoute: ActivatedRoute, private dateTableService: DataTableService,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.type = params['type'];
      this.configId = +params['configId'];
      this.date = params['date'];
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.tab = params['tab'];
      let url = 'v1/glbalancingexecutions/configdetail?glConfigDetailId=' + +params['id'] + '&date=' + this.date;
      if (this.tab === 'rc-report') {
        url += '&toDate=' + this.toDate + '&rcReport=true';
      }
      this.dtOptions = this.dateTableService.getBasicTable(url, this.getColumnsDefinition());
    });
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({title: 'DATA ROW ID', data: 'dataRowId', bSortable: false});
    columns.push({
      title: 'CREATED ON', data: 'date', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
      }
    });
    columns.push({
      title: 'TRANSACTION DATE', data: 'trxnDate', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
      }
    });
    columns.push({title: 'AMOUNT', data: 'amount', bSortable: false});
    return columns;
  }

  back() {
    if (this.tab === 'rc-report') {
      this.router.navigate(['/home/recon', 'gl-config', {
        outlets: {
          'fullBodyOutlet':
            ['rc-gl-report']
        }
      }], {queryParams: {type: this.type, configId: this.configId, toDate: this.toDate, fromDate: this.fromDate}});
    } else {
      this.router.navigate(['/home/recon', 'gl-config', {
        outlets: {
          'fullBodyOutlet':
            ['gl-report']
        }
      }], {queryParams: {type: this.type, configId: this.configId, date: this.date, tab: this.tab}});
    }

  }

}
