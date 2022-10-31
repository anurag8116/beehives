import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {MenuService} from '../../../../shared/menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit, AfterViewChecked {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public modules = [];
  public primaryDataSources = [];


  constructor(private dateTableService: DataTableService, private httpService: HttpService, private filter: FilterService,
              private menuService: MenuService, private router: Router, private route: ActivatedRoute, private elRef: ElementRef) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/recondataelements', this.getColumnsDefinition());
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
    this.httpService.get('v1/datasources?start=0', true).subscribe(
      (data: any) => {
        this.primaryDataSources = data.data;
      }
    );
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'ID', data: 'id', bSortable: false
    });
    columns.push({title: 'NAME', data: 'name', bSortable: false, render:  $.fn.dataTable.render.text()});
    columns.push({
      title: '', data: 'moduleId', visible: false
    });
    columns.push({
      title: 'MODULE', data: 'moduleName', render:  $.fn.dataTable.render.text()
    });
    columns.push({
      title: 'PRIMARY DATA SOURCE', data: 'dataSourcePrimary', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : data.name;
      }
    });
    columns.push({
      title: 'PRIMARY DATA ELEMENT', data: 'dataElementPrimary', bSortable: false, render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : data.name;
      }
    });
    columns.push({
      title: 'SECONDARY DATA SOURCE', data: 'dataSourceSecondary', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : data.name;
      }
    });
    columns.push({
      title: 'SECONDARY DATA ELEMENT', data: 'dataElementSecondary', bSortable: false, render: (data, type, full) => {
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
    this.router.navigate(['/home/recon','data-element', {outlets: {'fullBodyOutlet': ['new']}}], {queryParams: {id: id}});
  }
}
