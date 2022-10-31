import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpService} from '../../../../shared/services/http-service';
import {MenuService} from '../../../../shared/menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-dataprovider-list',
  templateUrl: './dataprovider-list.component.html',
})
export class DataproviderListComponent implements OnInit {

  public reportExecution: any [] = [];
  public reports: any [] = [];
  public groups: any [] = [];
  dtOptions: DataTables.Settings = {};
  @ViewChild('tableContainer') tableContainer: ElementRef;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  private id: any;

  constructor(private http: HttpService, private dateTableService: DataTableService, private router: Router, private datePipe: DatePipe
    , private menuService: MenuService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/datasets', this.getColumnsDefinition());
    this.onDetailButtonSelect();
  }

  searchByName(name: string) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(1).search(name).draw();
    });
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'ID', data: 'dataProviderId', bSortable: false, render: (data, type, full) => {
        return ' <a data-id="' + data + '" href="javascript:void(0);">' + data + '</a>';
      }
    });
    columns.push({title: 'Name', data: 'dataProviderName', bSortable: false, render:  $.fn.dataTable.render.text()});
    return columns;
  }

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a', function () {
      that.menuService.action.next(jQuery(this).data('id'));
      that.router.navigate(['/home/dataprovider', 'dataproviders', {outlets: {'bodyOutlet': ['da-pro-detail', jQuery(this).data('id')]}}]);
    });
  }

}
