import { Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute, Params} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {MatDialog} from '@angular/material/dialog';
import {isNullOrUndefined} from 'util';
import {EditEtlDataComponent} from '../../../pop-up/edit-etl-data/edit-etl-data.component';
import {ReconDataType} from '../../../../shared/services/enum';
import {SubmitMultipleRowsComponent} from '../../../pop-up/submit-multiple-rows/submit-multiple-rows.component';
import {ValidationConstant} from '../../../../shared/services/validation-constant';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  encapsulation: ViewEncapsulation.None
})
export class FormComponent implements OnInit {

  private type = 'INVALID_DATA_DISCARD';

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public id: number;
  public invalidData: any;
  public searchFileds: any = [];
  public showTable: any = false;
  public tableCoumnOrders: any = [];
  public selectedRowDataId: number[] = [];
  private dataSource: number;

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private dialog: MatDialog,
              private activatedRout: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRout.params.subscribe((param: Params) => {
      this.id = +param['id'] || null;
      this.showTable = false;
      this.httpService.get('v1/invaliddataviews/' + this.id, true).subscribe(
        (data: any) => {
          this.invalidData = data;
          this.dataSource = data.invalidData.id;
          this.searchFileds = data.filters;
          this.dtOptions = Object.assign(this.dateTableService.getBasicTable('v1/invaliddatas?Find=ByDataSource&dataSource=' + this.dataSource, this.getColumnsDefinition())
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

  public searchByName(name: string, searchField: string) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      console.log(searchField);
      this.tableCoumnOrders.forEach(function (value) {
        if (value.data === searchField) {
          dtInstance.columns(value.index).search(name).draw();
        }
      });
    });
  }

  onDiscardShow () {
    if (this.selectedRowDataId.length > 0) {
      const data = Object.assign({rows: this.selectedRowDataId, dataSource: this.dataSource, type: this.type});
      const dialogRef = this.dialog.open(SubmitMultipleRowsComponent, {width: '50%', height: '40%', data});
      dialogRef.afterClosed().subscribe(result => {
        this.selectedRowDataId = [];
        this.cancel();
      });
    } else {
      this.httpService.displayErrorOnPopUp(ValidationConstant.SELECT_ATLEAST_ONE_ROW);
    }
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    let restriket = 0;
    this.invalidData.tableColumns.forEach((item, index) => {
      restriket ++;
      this.tableCoumnOrders.push({index: index, title: item.label, data: item.fieldName, bSortable: item.sorter});
      if (restriket < 2) {
        columns.push({
          title: 'Action', data: item.fieldName, orderable: false, render: (data, type, full) => {
            let html = '<input type="checkbox" data-dataId="' + data + '" id="row-check" class="dt-checkboxes">';
            html = html + '<label style="margin-left: 15px"></label><a id ="detailBtn" data-id="' + full.id + '" href="javascript:void(0);"><i class="fa fa-edit" ,aria-hidden="true"></i></a>';

            return html;
          }
        });
      }
      columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
    });
    return columns;
  }

  private onDetailButtonSelect(rowData: any) {
    $('table').unbind('click');
    const that = this;
    jQuery('table').on('click', 'input', function () {
      const tr = $(this).closest('tr');
      that.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        const row = dtInstance.row(tr);
        const id: number = that.selectId(rowData);
        if (jQuery(this).closest('tr').hasClass('row-selected')) {
          jQuery(this).closest('tr').removeClass('row-selected');
          const index: number = that.selectedRowDataId.indexOf(id);
          if (index !== -1) {
            that.selectedRowDataId.splice(index, 1);
          }
        } else {
          that.selectedRowDataId.push(id);
          jQuery(this).closest('tr').addClass('row-selected');
        }
      });
    });
    jQuery('table').on('click', '#detailBtn', function () {
      const tr = $(this).closest('tr');
      that.onEditRow(rowData);
    });
  }

  private selectId(rowData: any): number {
    let rowValue;
    if (!isNullOrUndefined(rowValue = rowData['ID'])) {
      rowValue = rowData['ID'];
    } else if (!isNullOrUndefined(rowValue = rowData['id'])) {
      rowValue = rowData['id'];
    } else if (!isNullOrUndefined(rowValue = rowData['Id'])) {
      rowValue = rowData['Id'];
    } else if (!isNullOrUndefined(rowValue = rowData['iD'])) {
      rowValue = rowData['iD'];
    }
    return rowValue;
  }

  private onEditRow(rowData: any) {
    const rowId = this.selectId(rowData);
    const data = Object.assign({rowId: rowId, dataSource: this.dataSource, rowData: rowData, type: ReconDataType.EDIT_INVALID_DATA});
    const dialogRef = this.dialog.open(EditEtlDataComponent, {width: '45%', height: '80%', data});
    dialogRef.afterClosed().subscribe(result => {
      this.cancel();
    });
  }

  public cancel() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

}
