import {Component, OnInit, ChangeDetectorRef, ViewChild, ViewEncapsulation, AfterViewChecked} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute, Params} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {Subject} from 'rxjs/Subject';
import {FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import { DynamicFormLayout, DynamicFormService, DynamicInputModel} from '@ng-dynamic-forms/core';
import {isNullOrUndefined} from 'util';
import {EditEtlDataComponent} from '../../../pop-up/edit-etl-data/edit-etl-data.component';
import {ReconDataType} from '../../../../shared/services/enum';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  encapsulation: ViewEncapsulation.None
})
export class FormComponent implements OnInit {

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings = {};
  public id: number;
  public invalidData: any;
  public searchFileds: any = [];
  public showTable: any = false;
  public tableCoumnOrders: any = [];
  public masterSource: number;

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private activatedRout: ActivatedRoute,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.activatedRout.params.subscribe((param: Params) => {
      this.id = +param['id'] || null;
      this.showTable = false;
      this.httpService.get('v1/masterdataviews/' + this.id, true).subscribe(
        (data: any) => {
          this.invalidData = data;
          this.masterSource = data.masterData.id;
          this.searchFileds = data.filters;
          this.dtOptions = Object.assign(this.dateTableService.getBasicTable('v1/masterdatas?Find=ByMasterDataView&masterDataView=' + this.id, this.getColumnsDefinition())
            , {
              rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                const self = this;
                $('td:eq(0)', row).unbind('click');
                $('td:eq(0)', row).bind('click', () => {
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
    this.invalidData.tableColumns.forEach((item, index) => {
      restriket ++;
      this.tableCoumnOrders.push({index: index, title: item.label, data: item.fieldName});
      if (restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, bSortable: false, render: (data, type, full) => {
            const html = '  <a id ="detailBtn" data-id="' + full.id + '" href="javascript:void(0);"><i class="fa fa-edit" ,aria-hidden="true" style="font-size:24px"></i></a>';
            return html;
          }
        });
      }
      columns.push({title: item.label, data: item.fieldName});
    });
    return columns;
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

  private onDetailButtonSelect(rowData: any) {
    const rowId = this.selectId(rowData);
    const data = Object.assign({rowId: rowId, masterSource: this.masterSource, rowData: rowData, type: ReconDataType.MASTER_DATA});
    const dialogRef = this.dialog.open(EditEtlDataComponent, {width: '45%', height: '80%', data});
    dialogRef.afterClosed().subscribe(result => {
      this.cancel();
    });
  }

  private cancel() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  public searchByName(name: string, searchField: string) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      console.log(searchField);
      this.tableCoumnOrders.forEach(function (value) {
        if (value.data === searchField) {
          dtInstance.columns(value.index + 1).search(name).draw();
        }
      });
    });
  }

}
