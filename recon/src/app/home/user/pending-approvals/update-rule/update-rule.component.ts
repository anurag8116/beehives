import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DatePipe} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, Params} from '@angular/router';
import {ServiceConstant} from '../../../../shared/services/service-constant';

@Component({
  selector: 'app-form',
  templateUrl: './update-rule.component.html',
})
export class UpdateRuleComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public isLoading: boolean;
  public selectedCategory = null;
  public selectedRowDataId: number[] = [];
  public showTable: any = false;

  constructor(private httpService: HttpService, private dateTableService: DataTableService, private datePipe: DatePipe, private activeRoute: ActivatedRoute) {

  }

  ngOnInit() {
    this.isLoading = false;
    this.activeRoute.params.subscribe((param: Params) => {
      this.activeRoute.queryParams.subscribe(params => {
        this.selectedCategory = {id: +params['id'] || null, name: params['category']};
      });
      this.onSubCategotyChange(this.selectedCategory, {id: this.selectedCategory.id});
    });
  }

  public onSubCategotyChange(category: any, subCategory) {
    this.selectedRowDataId = [];
    this.selectedCategory = category;
    const url = 'v1/datatrackers?Find=UpdateRule&approvalSubCategoryId=' + subCategory.id + '&operationType=UPDATE_RULE';
    this.showTable = false;
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.url(ServiceConstant.URL + url).load();
      });
    } else {
      const columnsDefinition = this.getColumnsDefinitionForReport();
      this.dtOptions = Object.assign(this.dateTableService.getBasicTable(url, columnsDefinition), {
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          const self = this;
          $('td', row).unbind('click');
          $('td', row).bind('click', () => {
            self.onRowActionSelect(data);
          });
          return row;
        }, retrieve: true
      });
    }
    this.showTable = true;
  }

  updateInvalidDataStatus(status) {
    const form = {status: status, ids: this.selectedRowDataId, category: this.selectedCategory.name,
      approvalSubCategory: this.selectedCategory.id};
    this.httpService.put('v1/datatrackers', form, true).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.ajax.reload();
          this.selectedRowDataId = [];
        });
        this.httpService.displaySuccessOnPopUp('Data Successfully Updated !');
      },
      (errorResponse: HttpErrorResponse) => {
        this.isLoading = false;
      }
    );

  }

  private onRowActionSelect(data: any) {
    $('table').unbind('click');
    const that = this;
    jQuery('table').on('click', 'input', function () {
      const tr = $(this).closest('tr');
      that.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        const row = dtInstance.row(tr);
        if (jQuery(this).closest('tr').hasClass('row-selected')) {
          jQuery(this).closest('tr').removeClass('row-selected');
          const index: number = that.selectedRowDataId.indexOf(row.data()['id']);
          if (index !== -1) {
            that.selectedRowDataId.splice(index, 1);
          }
        } else {
          that.selectedRowDataId.push(row.data()['id']);
          jQuery(this).closest('tr').addClass('row-selected');
        }
        console.log(that.selectedRowDataId);
      });
    });
  }

  private getColumnsDefinitionForReport(): any {
    const columns: any [] = [];
    columns.push({
      title: '', data: 'id', orderable: false, render: (data, type, full) => {
        const html = '<input type="checkbox" data-dataId="' + data + '" id="row-check" class="dt-checkboxes">';
        return html;
      }
    });
    columns.push({title: 'ID', data: 'id'});
    columns.push({title: 'Rule Name', data: 'rule_name'})
    columns.push({title: 'Assigned By', data: 'assigned_by'});
    columns.push({title: 'Assigned On', data: 'assigned_on', render: (data) => new Date(data).toLocaleString()});
    return columns;
  }

}
