import {AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {Router} from '@angular/router';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpService} from '../../../../shared/services/http-service';

@Component({
  selector: 'app-file-avail-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit, AfterViewChecked {

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

  constructor(private route: Router, private dateTableService: DataTableService, private httpService: HttpService, private elementRef: ElementRef) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/fileavailabilitys', this.getColumnsDefinition());
    this.showTable = true;
  }

  newFormNavigate() {
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
    this.httpService.get('v1/fileavailabilitys/' + id, true).subscribe(
      (data: any) => {
        this.reconCycle = data;
        this.showTable = false;
      }
    );
  }

  cancel() {
    this.showTable = true;
  }

  edit() {
    this.editReconCycle.emit(this.reconCycle);
  }

}
