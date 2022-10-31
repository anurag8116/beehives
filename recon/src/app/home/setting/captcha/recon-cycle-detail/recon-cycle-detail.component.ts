import {AfterViewChecked, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, Input} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import {Router} from '@angular/router';

@Component({
  selector: 'app-recon-cycle-detail',
  templateUrl: './recon-cycle-detail.component.html',
  styleUrls: ['./form.component.css']
})
export class ReconCycleDetailComponent implements OnInit, AfterViewChecked {

  public showTable: boolean;
  public isDetailShow: boolean;
  private id: number;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('tableContainer') tableContainer: ElementRef;
  @Output() public editReconCycle: any = new EventEmitter<{}>();
  @Output() public newForm = new EventEmitter<boolean>();
  @Input() public reconCycleData: any = [];
  public reconCycle;
  public reconCycles = [];

  constructor(private route: Router, private dateTableService: DataTableService, private httpService: HttpService, private elementRef: ElementRef) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/reconcycles', this.getColumnsDefinition());
    this.showTable = true;
    this.httpService.get('v1/reconcycles', true).subscribe(
      (data: any) => {
        this.reconCycles = data.data;
      }
    );
  }

  reconCycleNewForm() {
    this.newForm.emit(true);
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'ID', data: 'id', bSortable: false, render: (data, type, full) => {
        const html = '<a id ="detailBtn" #detailBtn data-id="' + data + '" href="javascript:void(0);" ' +
          '> ' + data + ' </a>';
        return html;
      }
    });
    columns.push({title: 'MODULE', data: 'moduleName'});
    return columns;
  }

  ngAfterViewChecked() {
    const self = this;
    setTimeout(() => {
      this.elementRef.nativeElement.querySelectorAll('a#detailBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.onDetailButtonSelect($(item).data('id'));
        });
      });
    }, 100);
  }

  private onDetailButtonSelect(id: number) {
    this.id = id;
    this.httpService.get('v1/reconcycles/' + id, true).subscribe(
      (data: any) => {
        this.reconCycle = data;
        this.showTable = false;
      }
    );
  }

  cancel() {
    this.showTable = true;
  }

  edit(reconCycle) {
    this.editReconCycle.emit(reconCycle);
  }

}
