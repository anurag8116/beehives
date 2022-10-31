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
  @ViewChild('tableContainer') tableContainer: ElementRef;

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private filter: FilterService,
              private menuService: MenuService, private router: Router, private elRef: ElementRef) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/masterdataviews?start=0&length=100', this.getColumnsDefinition());
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
      this.elRef.nativeElement.querySelectorAll('a#deleteBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.delete($(item).data('id'));
        });
      });
    }, 100);
  }

  delete(id: number): void {
    this.httpService.delete('v1/masterdataviews/' + id, true).subscribe(
      (data: any) => {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
        });
        this.httpService.displaySuccessOnPopUp('View Successfully Deleted !');
      }
    );
  }

  edit(id: number): void {
    this.router.navigate(['/home/etl', 'master-data-view', {outlets: {'fullBodyOutlet': ['form']}}], {queryParams: {id: id}});
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({title: 'Id', data: 'id'});
    columns.push({title: 'Master Data Type', data: 'masterDataType'});
    const action = {
      title: 'ACTION', data: 'id', className: 'text-center', bSortable: false, render: (data, type, full) => {
        let actionHtml = '<div class="btn-group">';
        actionHtml += ' <a id ="editBtn" data-id="' + data + '"  href="javascript:void(0);" class="dropdown-item" style="width: inherit"><i class="fa fa-pencil-square-o pull-left cursor" aria-hidden="true"></i></a>';
        actionHtml += ' <a id ="deleteBtn" data-id="' + data + '"  href="javascript:void(0);" class="dropdown-item " style="width: inherit"><i class="fa fa-trash-o pull-right cursor" aria-hidden="true"></i></a>';
        actionHtml += ' </div>';
        return actionHtml;
      }
    };
    columns.push(action);
    return columns;
  }

}
