import {AfterViewChecked, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import {FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {AssignToUserComponent} from '../../../pop-up/assign-to-user/assign-to-user.component';
import {ValidationConstant} from '../../../../shared/services/validation-constant';
import {ReconDataType} from '../../../../shared/services/enum';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ViewComponent implements OnInit {

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public form: FormGroup;
  public id: number;
  public invalidData: any;
  public searchFileds: any = [];
  public showTable: any = false;
  public tableCoumnOrders: any = [];
  public rows: number[] = [];
  public dataSourceId: number;

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private dialog: MatDialog,
              private activatedRout: ActivatedRoute, private filter: FilterService) {
  }

  ngOnInit() {
    this.form = new FormGroup({});
    this.activatedRout.params.subscribe((param: Params) => {
      this.id = +param['id'] || null;
      this.showTable = false;
      this.httpService.get('v1/invaliddataviews/' + this.id, true).subscribe(
        (data: any) => {
          this.dataSourceId = data.invalidData.id;
          this.invalidData = data;
          this.searchFileds = data.filters;
          this.dtOptions = Object.assign(this.dateTableService.getBasicTable('v1/invaliddatas?Find=ByNonAssingedData&dataSource=' + data.invalidData.id + '&data?start=0', this.getColumnsDefinition())
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

  public searchForDynamic(name: string, searchField: string) {
    this.filter.searchForDynamic(name, searchField, this.tableCoumnOrders, this.dtElement, 1);
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    let restriket = 0;
    this.invalidData.tableColumns.forEach((item, index) => {
       restriket ++;
      this.tableCoumnOrders.push({index: index, title: item.label, data: item.fieldName, bSortable: item.sorter});
      if (restriket < 2) {
        columns.push({
          title: 'Assign', data: item.fieldName, render: (data, type, full) => {
            const html = '  <input id="check"  type="checkbox">';
            return html;
          }
        });
      }
      columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
    });
    return columns;
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

  public cancel() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  public selectAppUser() {
    if (this.rows.length > 0) {
      const data = Object.assign({rows: this.rows}, {dataSourceId: this.dataSourceId}, {type: ReconDataType.EDIT_INVALID_DATA});
      const dialogRef = this.dialog.open(AssignToUserComponent, {width: '40%', height: '35%', data});
      dialogRef.afterClosed().subscribe(result => {
        this.rows = [];
        this.cancel();
      });
    } else {
      this.httpService.displayErrorOnPopUp(ValidationConstant.SELECT_ATLEAST_ONE_ROW);
    }
  }

}
