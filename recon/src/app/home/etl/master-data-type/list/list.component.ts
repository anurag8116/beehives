import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';
import {MenuService} from '../../../../shared/menu.service';
import {DataTableDirective} from 'angular-datatables';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public masterData: any = [];

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private filter: FilterService,
              private menuService: MenuService, private router: Router) { }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/masterdatatypes?start=0&length=100', this.getColumnsDefinition());
    this.onDetailButtonSelect();
    this.httpService.get('v1/masterdatatypes?start=0&length=100', true).subscribe(
      (data: any) => {
        this.masterData = data.data;
      }
    );
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'ID', data: 'id', bSortable: false, render: (data, type, full) => {
        const html = '<a id ="detailBtn" data-id="' + data + '" href="javascript:void(0);" ' +
          '> ' + data + ' </a>';
        return html;
      }
    });
    columns.push({title: 'NAME', data: 'name', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'MODULE', data: 'moduleName', render:  $.fn.dataTable.render.text()});
    return columns;
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a', function () {
      that.menuService.action.next(jQuery(this).data('id'));
      that.router.navigate(['/home/etl', 'master-data-type', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }

}
