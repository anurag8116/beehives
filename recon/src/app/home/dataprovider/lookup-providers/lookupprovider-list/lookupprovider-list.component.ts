import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {ActivatedRoute, Router} from '@angular/router';
import {MenuService} from '../../../../shared/menu.service';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-lookupprovider-list',
  templateUrl: './lookupprovider-list.component.html',
})
export class LookupproviderListComponent implements OnInit {

  public reports: any [] = [];
  public groups: any [] = [];
  private id: any;
  dtOptions: DataTables.Settings = {};
  @ViewChild('tableContainer') tableContainer: ElementRef;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  constructor(private http: HttpService, private dateTableService: DataTableService, private router: Router, private datePipe: DatePipe
    , private menuService: MenuService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/lookupproviders', this.getColumnsDefinition());
    this.onDetailButtonSelect();
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'ID', data: 'lookUpProviderId', bSortable: false, render: (data, type, full) => {
        return ' <a data-id="' + data + '" href="javascript:void(0);">' + data + '</a>';
      }
    });
    columns.push({title: 'Name', data: 'lookUpProviderName', bSortable: false, render:  $.fn.dataTable.render.text()});
    return columns;
  }

  searchByName(name: string) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(1).search(name).draw();
    });
  }

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a', function () {
      that.menuService.action.next(jQuery(this).data('id'));
      that.router.navigate(['/home/dataprovider/lookup', 'lookupproviders', {outlets: {'bodyOutlet': ['look-pro-detail', jQuery(this).data('id')]}}]);
    });
  }

}
