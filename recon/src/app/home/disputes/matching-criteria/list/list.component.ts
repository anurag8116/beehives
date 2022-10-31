import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpService} from '../../../../shared/services/http-service';
import {MenuService} from '../../../../shared/menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit, AfterViewChecked {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public modules = [];

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private datePipe: DatePipe,
              private menuService: MenuService, private router: Router, private route: ActivatedRoute,
              private elRef: ElementRef, private filter: FilterService) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/disputematchingcriterias', this.getColumnsDefinition());
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
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
      this.elRef.nativeElement.querySelectorAll('a#detailBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.onDetailButtonSelect($(item).data('id'));
        });
      });
    }, 100);
  }

  edit(id: number): void {
    this.router.navigate(['/home/disputes/part', 'matching-criteria', {outlets: {'bodyOutlet': ['new']}}], {queryParams: {id: id}});
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'ID', data: 'id', render: (data, type, full) => {
        const html = '<a id ="detailBtn" data-id="' + data + '" href="javascript:void(0);" ' +
          '> ' + data + ' </a>';
        return html;
      }
    });
    columns.push({
      title: 'MODULE', data: 'moduleName', render:  $.fn.dataTable.render.text()
    });
    columns.push({title: 'NAME', data: 'name', bSortable: false, render:  $.fn.dataTable.render.text()});

    columns.push({
      title: 'CREATED ON', data: 'createdOn', bSortable: false, render: (data, type, full) => {
        return this.datePipe.transform(data, 'dd-MM-yyyy, hh:mm a');
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

  private onDetailButtonSelect(id: number) {
    this.router.navigate(['/home/disputes/part', 'matching-criteria', {outlets: {'bodyOutlet': ['detail']}}], {queryParams: {id: id}});
  }
}
