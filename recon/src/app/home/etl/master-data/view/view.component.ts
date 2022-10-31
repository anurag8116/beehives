import { Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Params} from '@angular/router';
import {DataTableDirective} from 'angular-datatables';
import {Subject} from 'rxjs/Subject';
import {isNullOrUndefined} from 'util';
import {MatDialog} from '@angular/material/dialog';
import {AssignToUserComponent} from '../../../pop-up/assign-to-user/assign-to-user.component';
import {ValidationConstant} from '../../../../shared/services/validation-constant';
import {ReconDataType} from '../../../../shared/services/enum';


@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ViewComponent implements OnInit {
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings = {};
  public masterView: any;
  public searchFileds: any = [];
  public showTable: any = false;
  public tableCoumnOrders: any = [];
  public rows: number[] = [];
  private id: number;
  private masterDataId: number;

  constructor(private dataTableService: DataTableService, private httpService: HttpService, private  route: ActivatedRoute,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.route.params.subscribe((param: Params) => {
      this.id = +param['id'] || null;
      this.showTable = false;
      this.httpService.get('v1/masterdataviews/' + this.id, true).subscribe(
        (data: any) => {
          this.masterDataId = data.masterData.id;
          this.masterView = data;
          this.searchFileds = data.filters;
          this.rows = [];
          this.dtOptions = Object.assign(this.dataTableService.getBasicTable('v1/masterdatas?masterDataView=' + this.id, this.getColumnsDefinition())
            , {
              rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                const self = this;
                $('td', row).unbind('click');
                $('td', row).bind('click', () => {
                  self.onDetailButtonSelect(rowData);
                });
                return row;
              },
            });
          this.showTable = true;
        });
    });
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    let restriket = 0;
    this.masterView.tableColumns.forEach((item, index) => {
      restriket ++;
      this.tableCoumnOrders.push({index: index, title: item.label, data: item.fieldName});
      if (restriket < 2) {
        columns.push({
          title: 'Assign', data: item.fieldName, render: (data, type, full) => {
            const html = '  <input id="check"  type="checkbox">';
            return html;
          }
        });
      }
      columns.push({title: item.label, data: item.fieldName});
    });
    return columns;
  }

  public searchByName(name: string, searchField: string) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.tableCoumnOrders.forEach(function (value) {
        if (value.data === searchField) {
          dtInstance.columns(value.index + 1).search(name).draw();
        }
      });
    });
  }

  private onDetailButtonSelect(rowData: any) {
    const rowIds = this.getRowId(rowData);
    $('table').unbind('click');
    const that = this;
    jQuery('table').on('click', 'input', function () {
      const tr = $(this).closest('tr');
      that.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        const row = dtInstance.row(tr);
        if (jQuery(this).closest('tr').hasClass('row-selected')) {
          jQuery(this).closest('tr').removeClass('row-selected');
          const index: number = that.rows.indexOf(rowIds);
          if (index !== -1) {
            that.rows.splice(index, 1);
          }
        } else {
          that.rows.push(rowIds);
          jQuery(this).closest('tr').addClass('row-selected');
        }
      });
    });
  }

  private getRowId(rowData: any): number {
    let rowIds;
    if (!isNullOrUndefined(rowIds = rowData['ID'])) {
      rowIds = rowData['ID'];
    } else if (!isNullOrUndefined(rowIds = rowData['id'])) {
      rowIds = rowData['id'];
    } else if (!isNullOrUndefined(rowIds = rowData['Id'])) {
      rowIds = rowData['Id'];
    } else if (!isNullOrUndefined(rowIds = rowData['iD'])) {
      rowIds = rowData['iD'];
    }
    return rowIds;
  }

  public selectAppUser() {
    if (this.rows.length > 0) {
      const data = Object.assign({rows: this.rows}, {masterDataId: this.masterDataId}, {type: ReconDataType.MASTER_DATA});
      const dialogRef = this.dialog.open(AssignToUserComponent, {width: '40%', height: '35%', data});
      dialogRef.afterClosed().subscribe(result => {
        this.rows = [];
        this.cancel();
      });
    } else {
      this.httpService.displayErrorOnPopUp(ValidationConstant.SELECT_ATLEAST_ONE_ROW);
    }
  }

  public cancel() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

}
