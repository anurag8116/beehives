import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute, Router} from '@angular/router';
import {MenuService} from '../../../../shared/menu.service';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpErrorResponse} from '@angular/common/http';
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
              private menuService: MenuService, private router: Router, private route: ActivatedRoute, private elRef: ElementRef) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/glconfigrations', this.getColumnsDefinition());
    this.onDetailButtonSelect();
    this.onActionButtonSelect();
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
    this.router.navigate(['/home/recon', 'gl-config', {outlets: {'fullBodyOutlet': ['form']}}], {queryParams: {id: id}});
  }

  requestForGlBalancingExecution(id) {
    const form = {id: id};
    this.httpService.post('v1/glbalancingexecutions', form, true).subscribe(
      (data: any) => {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.ajax.reload();
        });
        this.httpService.displaySuccessOnPopUp('Gl Balancing Request Successfully Created !');
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'ID', data: 'id', bSortable: true, render: (data, type, full) => {
        const html = '<a id ="detailBtn" data-id="' + data + '" href="javascript:void(0);" ' +
          '> ' + data + ' </a>';
        return html;
      }
    });
    columns.push({title: 'GL NAME', data: 'glName', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'GL NUMBER', data: 'glNumber'});
    const action = {
      title: 'ACTION', data: 'id', className: 'text-center', bSortable: false, render: (data, type, full) => {
        let actionHtml = '<div class="btn-group">';
        actionHtml += ' <a id ="editBtn" #editBtn data-id="' + data + '"  href="javascript:void(0);" class="dropdown-item" style="width: inherit"><i class="fa fa-pencil-square-o pull-right cursor" aria-hidden="true"></i></a>';
        actionHtml += ' </div>';
        actionHtml += '<a class="btn activate-btn"   #actionBtn id ="actionBtn" data-id="' + data + '" style="margin-left: 10px;" href="javascript:void(0);" ' +
          '> Execute</a>';
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
      that.router.navigate(['/home/recon', 'gl-config', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }

  private onActionButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a#actionBtn', function () {
      const id = jQuery(this).data('id');
      $.confirm({
        title: 'GL balancing execution request!', columnClass: 'col-md-4 col-md-offset-4', offsetBottom: 400, type: 'blue',
        buttons: {
          formSubmit: {
            text: 'Submit', btnClass: 'submit-btn', action: function () {
              that.requestForGlBalancingExecution(id);
            }
          },
          formCancel: {
            text: 'Cancel', btnClass: 'btn btn-primary cancel-btn', action: function () {
            }
          },
        },
      });
    });
  }
}
