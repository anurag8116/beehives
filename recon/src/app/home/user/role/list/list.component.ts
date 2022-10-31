import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DataTableDirective} from 'angular-datatables';
import {MenuService} from '../../../../shared/menu.service';
import {Router} from '@angular/router';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  public roles: any [] = [];
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  constructor(private http: HttpService, private dateTableService: DataTableService, private menuService: MenuService,
              private router: Router, private filter: FilterService) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/roles', this.getColumnsDefinition());
    this.onDetailButtonSelect();
    this.http.get('v1/roles?start=0', true).subscribe(
      (data: any) => {
        this.roles = data.data;
      }
    );
  }

  search(name: string, columnIndex: number) {
    this.filter.search(name, columnIndex, this.dtElement);
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
    return columns;
  }

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a', function () {
      that.menuService.action.next(jQuery(this).data('id'));
      that.router.navigate(['/home/user/full', 'role', {outlets: {'fullBodyOutlet': ['assign-privilege']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }

}
