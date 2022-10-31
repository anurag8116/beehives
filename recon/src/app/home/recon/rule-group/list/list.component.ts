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
  @ViewChild('tableContainer') tableContainer: ElementRef;
  public modules = [];
  public recons = [];

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private filter: FilterService,
              private menuService: MenuService, private router: Router, private route: ActivatedRoute, private elRef: ElementRef) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/rulegroups', this.getColumnsDefinition());
    this.onDetailButtonSelect();
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
      this.elRef.nativeElement.querySelectorAll('a#deleteBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.delete($(item).data('id'));
        });
      });
    }, 100);
  }

  delete(id: number): void {
    this.httpService.delete('v1/rulegroups/' + id, true).subscribe(
      (data: any) => {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
        });
        this.httpService.displaySuccessOnPopUp('Rule Group Successfully Deleted !');
      }
    );
  }

  edit(id: number): void {
    this.router.navigate(['/home/recon', 'rule-group', {outlets: {'fullBodyOutlet': ['new']}}], {queryParams: {id: id}});
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
    columns.push({
      title: 'MODULE', data: 'module', render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : data.name;
      }
    });
    columns.push({title: 'Recon', data: 'reconName', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'RELAX_MATCH', data: 'relaxMatch' , render: (data, type, full) => {
      return !isNullOrUndefined(data) && data === true ? 'YES' : 'NO';
    }
    });
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

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a#detailBtn', function () {
      that.menuService.action.next(jQuery(this).data('id'));
      that.router.navigate(['/home/recon', 'rule-group', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }
}
