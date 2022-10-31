import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {MenuService} from '../../../../shared/menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import {FormControl, FormGroup} from '@angular/forms';
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
  public parentModules = [];
  public scheduleType = ['CRON', 'EVENT', 'MANUAL'];
  public form: FormGroup;
  public jobFormEnable = true;
  public job: any;

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private menuService: MenuService,
              private router: Router, private route: ActivatedRoute, private elRef: ElementRef, private filter: FilterService) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      id: new FormControl(null),
      enable: new FormControl(null),
      disableDuration: new FormControl(null),
      durationUnit: new FormControl(null),
    });
    this.dtOptions = this.dateTableService.getBasicTable('v1/jobs', this.getColumnsDefinition());
    this.onDetailButtonSelect();
    this.httpService.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.parentModules = data.data;
      }
    );
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  public onSetTransaction() {
    this.httpService.put('v1/jobs?opertionType=JOB_ACTIVATION', this.form.getRawValue(), true).subscribe(
      (data: any) => {
        this.form.reset();
        this.closeModalDialog();
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.ajax.reload();
        });
        this.httpService.displaySuccessOnPopUp('Job Action Successfully Update !');
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
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
      this.elRef.nativeElement.querySelectorAll('a#actionBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.onActionButtonSelect($(item).data('id'), $(item).data('enable'));
        });
      });
      this.elRef.nativeElement.querySelectorAll('a#manualJobExeBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.onExecutionButtonSelect($(item).data('id'));
        });
      });
    }, 100);
  }

  edit(id: number): void {
    this.router.navigate(['/home/scheduler', 'job', {outlets: {'fullBodyOutlet': ['new']}}], {queryParams: {id: id}});
  }

  openModalDialog() {
    $('#backdrop').css({'display': 'block'});
    $('#modal').css({'display': 'block'});
  }

  closeModalDialog() {
    $('#backdrop').css({'display': 'none'});
    $('#modal').css({'display': 'none'});
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
    columns.push({title: 'NAME', data: 'name', render:  $.fn.dataTable.render.text()});
    columns.push({
      title: 'MODULE', data: 'moduleId', render: (data, type, full) => {
        return isNullOrUndefined(full.moduleName) ? null : full.moduleName;
      }
    });
    columns.push({title: 'SCHEDULING TYPE', data: 'scheduleType', bSortable: false});
    columns.push({title: 'CRON EXP.', data: 'cronExpression', bSortable: false});
    columns.push({
      title: 'EVENT', data: 'eventName', bSortable: false
    });

    columns.push({
      title: 'STATUS', data: 'enable', bSortable: false, render: (data, type, full) => {
        if (data) {
          return 'ACTIVE';
        } else {
          return 'INACTIVE';
        }
      }
    });
    columns.push({title: 'DESCRIPTION', data: 'description', bSortable: false, render:  $.fn.dataTable.render.text()});
    columns.push({
      title: 'ACTION', data: 'id', bSortable: false, render: (data, type, full) => {
        let actionHtml = '<div class="btn-group">';
        actionHtml += ' <a id ="editBtn" data-id="' + data + '"  href="javascript:void(0);" class="dropdown-item" style="width: inherit"><i class="fa fa-pencil-square-o icon-2x pull-right cursor" aria-hidden="true"></i></a>';
        actionHtml += ' </div>';
        if (!full.enable) {
          actionHtml += '<a class="btn activate-btn"   #actionBtn id ="actionBtn" data-enable="' + full.enable + '" data-id="' + data + '" style="margin-left: 10px;" href="javascript:void(0);" ' +
            '> Activate</a>';
        } else {
          actionHtml += '<a class="btn deactivate-btn" #actionBtn id ="actionBtn" data-enable="' + full.enable + '" data-id="' + data + '"  style="margin-left: 10px;" href="javascript:void(0);" ' +
            '> Deactivate</a>';
        }
        actionHtml += '<a class="btn execute-btn" #actionBtn id ="manualJobExeBtn" data-enable="' + full.enable + '" data-id="' + data + '"  style="margin-left: 10px;" href="javascript:void(0);" ' +
          '> Execute</a>';
        return actionHtml;
      }
    });
    return columns;
  }

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a#detailBtn', function () {
      that.menuService.action.next(jQuery(this).data('id'));
      that.router.navigate(['/home/scheduler', 'job', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }

  private onActionButtonSelect(id, enable) {
    this.jobFormEnable = enable;
    this.openModalDialog();
    this.form.reset();
    this.form.patchValue({id: id, enable: !enable});
    this.httpService.get('v1/jobs/' + id, true).subscribe(
      (data: any) => {
        this.job = data;
      }
    );
  }

  private onExecutionButtonSelect(id) {
    if (id) {
      this.httpService.post('v1/jobs?opertionType=MANUAL_JOB_EXEC', {id: id}, true).subscribe(
        (data: any) => {
          this.httpService.displaySuccessOnPopUp('Job Execution request Successfully send !');
        },
        (errorResponse: HttpErrorResponse) => {
        }
      );
    }
  }
}
