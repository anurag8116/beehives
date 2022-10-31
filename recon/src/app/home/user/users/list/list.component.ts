import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DataTableDirective} from 'angular-datatables';
import {MenuService} from '../../../../shared/menu.service';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {FileUploadComponent} from '../../../pop-up/file-upload/file-upload.component';
import {MatDialog} from '@angular/material/dialog';
import {FilterService} from '../../../../shared/services/filter.service';
import {ChangeStatusComponent} from '../../../pop-up/change-status/change-status.component';
import {RegisterUserComponent} from '../../../pop-up/register-user/register-user.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit, AfterViewChecked {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('tableContainer') tableContainer: ElementRef;
  public roles: any[];
  public modules: any[];
  public isUnBlockedPopUp = false;
  public isBlockedPopUp = false;
  public isRejectPopUp = false;
  public userName;
  private id: any;

  constructor(private http: HttpService, private dateTableService: DataTableService, private menuService: MenuService,
              private router: Router, private elRef: ElementRef, private dialog: MatDialog, private filter: FilterService) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/appusers', this.getColumnsDefinition());
    this.onDetailButtonSelect();
    this.onActionButtonSelect();
    this.onSsoActionButtonSelect();
    this.http.get('v1/roles?start=0', true).subscribe(
      (data: any) => {
        this.roles = data.data;
      }
    );
    this.http.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
  }

  search(name: string, columnIndex: number) {
    this.filter.search(name, columnIndex, this.dtElement);
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({title: 'ID', data: 'id'});
    columns.push({title: 'NAME', data: 'name', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'EMAIL', data: 'email', bSortable: false});
    columns.push({title: 'MOBILE NUMBER', data: 'mobile', bSortable: false});
    columns.push({title: 'MODULE', data: 'module'});
    columns.push({title: 'ROLE', data: 'role'});
    columns.push({
      title: 'USER TYPE', data: 'external', bSortable: false, render: (data, type, full) => {
        if (full.external) {
          return 'External';
        } else {
          return 'Internal';
        }
      }
    });
    columns.push({title: 'PENDING USERS', data: 'pendingUsers',
      render: (data, type, full) => {
        return '';
      }, bSortable: false, visible: false});
    columns.push({
      title: 'ACTION', data: 'suspended', bSortable: false, render: (data, type, full) => {
        let actionHtml = '';
        if (full.registrationStatus && full.registrationStatus !== 'APPROVED') {
          if (full.registrationStatus && full.registrationStatus === 'REQUESTED') {
            actionHtml = '<div class="row"><a class="btn activate-btn" #ssoActionBtn id ="ssoActionBtn" data-id="' + full.id + '" data-name="' + full.name + '" data-is_approve="true" href="javascript:void(0);" ' +
              '> Approve</a> <a class="btn deactivate-btn" style="margin-left: 2px;" #ssoActionBtn id ="ssoActionBtn" data-id="' + full.id + '" data-name="' + full.name + '" data-is_approve="false" href="javascript:void(0);" ' +
              '> Reject</a></div>';
          } else {
            actionHtml = full.registrationStatus;
          }
        } else {
          actionHtml = '<div class="btn-group">';
          actionHtml += ' <a id ="editBtn" data-id="' + full.id + '"  href="javascript:void(0);" class="dropdown-item" style="width: inherit"><i class="fa fa-pencil-square-o icon-2x pull-right cursor" aria-hidden="true"></i></a>';
          actionHtml += ' </div>';
          if (full.suspended) {
            actionHtml += '<a class="btn activate-btn"  style="margin-left: 10px;padding: 1px 25px;" #actionBtn id ="actionBtn" data-id="' + full.id + '" data-name="' + full.name + '" data-suspended="' + full.suspended + '" href="javascript:void(0);" ' +
              '> Activate</a>';
          } else {
            actionHtml += '<a class="btn deactivate-btn" style="margin-left: 10px;" #actionBtn id ="actionBtn" data-id="' + full.id + '" data-name="' + full.name + '" data-suspended="' + full.suspended + '" href="javascript:void(0);" ' +
              '> Deactivate</a>';
          }
        }
        return actionHtml;
      }
    });
    return columns;
  }

  public statusChanged() {
    let url;
    let body = this.id;;
    if (this.isUnBlockedPopUp) {
      url = 'v1/appusers?Changed=UserStatus&UserStatus=UnBlocked';
    } else if (this.isBlockedPopUp) {
      url = 'v1/appusers?Changed=UserStatus&UserStatus=Blocked';
    } else if (this.isRejectPopUp) {
      url = 'v1/appusers?Update=RegisteredUserStatus';
      body = {id: this.id, registrationStatus: 'REJECTED'};
    }

    this.http.put(url, body, true).subscribe(
      (data: any) => {
        if (this.isBlockedPopUp) {
          this.http.displaySuccessOnPopUp('User Successfully DeActivated !');
        } else if (this.isUnBlockedPopUp) {
          this.http.displaySuccessOnPopUp('User Successfully Activated !');
        } else if (this.isRejectPopUp) {
          this.http.displaySuccessOnPopUp('User Successfully Rejected !');
        }
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
          jQuery('#User-Status').modal('hide');
        });
      },
      (errorResponse: HttpErrorResponse) => {
        jQuery('#User-Status').modal('hide');
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
    }, 100);
  }

  edit(id: number): void {
    this.router.navigate(['/home/user/full', 'users', {outlets: {'fullBodyOutlet': ['form']}}], {queryParams: {id: id}});
  }

  uploadFile() {
    const dialogRef = this.dialog.open(FileUploadComponent, {width: '45%', height: '35%'});
    dialogRef.afterClosed().subscribe(result => {
      this.cancel();
    });
  }


  public cancel() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  public cancelPop() {
    jQuery('#User-Status').modal('hide');
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  private onActionButtonSelect() {
    this.isUnBlockedPopUp = false;
    this.isBlockedPopUp = false;
    this.isRejectPopUp = false;
    const that = this;
    jQuery('table').on('click', 'a#actionBtn', function () {
      that.id = jQuery(this).data('id');
      const suspend = jQuery(this).data('suspended');
      that.userName = jQuery(this).data('name');
      if (suspend) {
        that.isRejectPopUp = false;
        that.isBlockedPopUp = false;
        that.isUnBlockedPopUp = true;
        jQuery('#User-Status').modal('show');
      } else {
        that.isUnBlockedPopUp = false;
        that.isRejectPopUp = false;
        that.isBlockedPopUp = true;
        jQuery('#User-Status').modal('show');
      }
    });
  }

  private onSsoActionButtonSelect() {
    this.isUnBlockedPopUp = false;
    this.isBlockedPopUp = false;
    this.isRejectPopUp = false;
    const that = this;
    jQuery('table').on('click', 'a#ssoActionBtn', function () {
      that.id = jQuery(this).data('id');
      const isApprove = jQuery(this).data('is_approve');
      that.userName = jQuery(this).data('name');
      if (isApprove) {
        const dialogRef = that.dialog.open(RegisterUserComponent, {width: '850px', height: '550px', data: { id: that.id }});
        dialogRef.afterClosed().subscribe(result => {
          that.refreshTable();
        });
      } else {
        that.isRejectPopUp = true;
        jQuery('#User-Status').modal('show');
      }
    });
  }

  public refreshTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a#detailBtn', function () {
      that.menuService.action.next(jQuery(this).data('id'));
      that.router.navigate(['/home/user/full', 'users', {outlets: {'fullBodyOutlet': ['list']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }

}
