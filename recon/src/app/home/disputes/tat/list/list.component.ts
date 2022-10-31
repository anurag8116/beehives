import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DataTableDirective} from 'angular-datatables';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit, AfterViewChecked {
  public modules: any[];
  public isLoading: boolean;
  public responseList: any[] = [];
  public id: number;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public approvalTypes = [{
    value: 'EDIT_INVALID_DATA',
    name: 'Edit invalid data'
  }, {
    value: 'FORCE_MATCH',
    name: 'Force match'
  }, {
    value: 'FORCE_UNMATCH',
    name: 'Force unmatch'
  }, {
    value: 'REPORTS',
    name: 'Reports'
  }, {
    value: 'KNOCK_OFF',
    name: 'Knock Off'
  }, {
    value: 'MASTER_DATA',
    name: 'Master Data'
  }, {
    value: 'RELAX_MATCH',
    name: 'Relax Match'
  }, {
    value: 'CHARGE_BACK',
    name: 'Charge Back'
  }, {
    value: 'DISCARD_INVALID_DATA',
    name: 'Discard Invalid Data'
  }, {
    value: 'PRE_ARBITRATION',
    name: 'Pre arbitration'
  }];

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private filter: FilterService,
              private activatedRout: ActivatedRoute, private router: Router, private elRef: ElementRef) {
  }

  ngOnInit() {
    this.dtOptions = Object.assign(this.dateTableService.getBasicTable('v1/manualactiontats', this.getColumnsDefinition()));
    this.isLoading = false;
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  public onEdit() {
    const checkIdCount = this.responseList.length;
    if (checkIdCount === 0 || checkIdCount === null) {
      this.httpService.displayErrorOnPopUp('Select at least one record ');
    } else {
      this.router.navigate(['/home/disputes/part', 'tat', {
        outlets: {
          'bodyOutlet': ['form', checkIdCount],
        }
      }]);
    }
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
    this.router.navigate(['/home/disputes/part', 'tat', {outlets: {'bodyOutlet': ['form', id]}}]);
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({title: 'MODULE', data: 'moduleName'});
    columns.push({title: 'TYPE', data: 'type'});
    columns.push({title: 'DAYS ', data: 'days', bSortable: false});
    columns.push({title: 'CUTT OFF TIME', data: 'cutOffTime', bSortable: false});
    const action = {
      title: 'ACTION', data: 'id', className: 'text-center', bSortable: false, render: (data, type, full) => {
        let actionHtml = '<div class="btn-group">';
        actionHtml += ' <a id ="editBtn" data-id="' + data + '" href="javascript:void(0);" class="dropdown-item" style="width: inherit"><i class="fa fa-pencil-square-o pull-right cursor" aria-hidden="true"></i></a>';
        actionHtml += ' </div>';
        return actionHtml;
      }
    };
    columns.push(action);
    return columns;
  }
}
