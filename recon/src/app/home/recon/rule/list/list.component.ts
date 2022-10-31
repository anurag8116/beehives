import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import {MenuService} from '../../../../shared/menu.service';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit, AfterViewChecked {
  dtOptions: DataTables.Settings = {};

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public primaryDataSources = [];
  public modules: any[];
  public recons: any[];

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private filter: FilterService,
              private menuService: MenuService, private router: Router, private route: ActivatedRoute, private elRef: ElementRef) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/rules', this.getColumnsDefinition());
    this.onDetailButtonSelect();
    this.httpService.get('v1/datasources?start=0', true).subscribe(
      (data: any) => {
        this.primaryDataSources = data.data;
      }
    );
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
    this.httpService.get('v1/recons?start=0', true).subscribe(
      (data: any) => {
        this.recons = data.data;
      }
    );
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
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

  edit(id: number): void {
    this.router.navigate(['/home/recon', 'rule', {outlets: {'fullBodyOutlet': ['new']}}], {queryParams: {id: id}});
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
    columns.push({title: 'RECON', data: 'reconName', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'RULE TYPE', data: 'ruleType'});
    columns.push({
      title: 'MODULE', data: 'module', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : data.name;
      }
    });
    columns.push({
      title: 'PRIMARY DATA SOURCE', data: 'primaryDataSource', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : data.name;
      }
    });
    columns.push({
      title: 'SECONDARY DATA SOURCE', data: 'secondaryDataSource', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : data.name;
      }
    });
    const action = {
      title: 'ACTION', data: 'id', className: 'text-center', bSortable: false, render: (data, type, full) => {
        let actionHtml = '<div class="btn-group">';
        actionHtml += ' <a id ="editBtn" data-id="' + data + '"  href="javascript:void(0);" class="dropdown-item" style="width: inherit"><i class="fa fa-pencil-square-o pull-right cursor" aria-hidden="true"></i></a>';
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
      that.router.navigate(['/home/recon', 'rule', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }
}
