import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute} from '@angular/router';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  private id: number;
  public cashbackCoupon;
  public showTable = false;

  constructor(private dateTableService: DataTableService, private httpService: HttpService,
              private activeRoute: ActivatedRoute, private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;

      this.httpService.get('v1/discountcriteria/' + this.id, true).subscribe(
        (data: any) => {
          this.cashbackCoupon = data;
        }
      );

      this.dtOptions = Object.assign(this.dateTableService.getBasicTable('v1/discountcriteria/files',
        this.getColumnsDefinition()), {searchCols: [null, null, null, null, {search: this.id}]});
    });
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({title: 'File Name', data: 'fileName', bSortable: false});
    columns.push({
      title: 'From Txn Date', data: 'txnFromDate', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy');
      }, bSortable: false
    });
    columns.push({
      title: 'To Txn Date', data: 'txnToDate', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy');
      }, bSortable: false
    });
    columns.push({
      title: 'Uploaded On', data: 'uploadedOn', render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy hh:mm a');
      }, bSortable: false
    });
    columns.push({
      title: 'Discount Criteria Id', data: 'discountCriteriaId', render: (data, type, full) => {
        return '';
      }, bSortable: false, visible: false
    });
    return columns;
  }
}
