import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';
import {MenuService} from '../../../../shared/menu.service';
import {FilterService} from '../../../../shared/services/filter.service';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit, AfterViewChecked {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public dataSources = [];

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private filter: FilterService,
              private router: Router, private elRef: ElementRef, private menuService: MenuService) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/unmatchedtransactions', this.getColumnsDefinition());
    this.onDetailButtonSelect();
    this.httpService.get('v1/datasources?start=0', true).subscribe(
      (data: any) => {
        this.dataSources = data.data;
      }
    );
  }

  ngAfterViewChecked() {
    const self = this;
    setTimeout(() => {
      this.elRef.nativeElement.querySelectorAll('a#editBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.edit($(item).data('id'));
        });
      });
    }, 100);
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  edit(id: number): void {
    this.router.navigate(['/home/recon', 'unmatched-transaction-view', {outlets: {'fullBodyOutlet': ['form']}}], {queryParams: {dataSourceViewId: id}});
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
    columns.push({title: 'Data Source', data: 'dataSourceName', render:  $.fn.dataTable.render.text()});
    const action = {
      title: 'ACTION', data: 'id', className: 'text-center', bSortable: false, render: (data, type, full) => {
        let actionHtml = '<div class="btn-group">';
        actionHtml += ' <a id ="editBtn" data-id="' + data + '"  href="javascript:void(0);" class="dropdown-item" style="width: inherit"><i class="fa fa-pencil-square-o pull-left cursor" aria-hidden="true"></i></a>';
        actionHtml += ' </div>';
        return actionHtml;
      }
    };
    columns.push(action);
    return columns;
  }

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a', function () {
      that.menuService.action.next(jQuery(this).data('id'));
      that.router.navigate(['/home/recon', 'unmatched-transaction-view', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }
}
