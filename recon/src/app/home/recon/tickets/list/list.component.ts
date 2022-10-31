import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {DataTableDirective} from 'angular-datatables';
import {MenuService} from '../../../../shared/menu.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {FilterService} from '../../../../shared/services/filter.service';
import {FormControl, FormGroup} from '@angular/forms';
import {TicketDocumentUploadComponent} from '../../../pop-up/ticket-document-upload/ticket-document-upload.component';
import {isNullOrUndefined} from 'util';
import {ChangeTicketStatusComponent} from '../../../pop-up/change-ticket-status/change-ticket-status.component';
import {AddTicketCommentComponent} from '../../../pop-up/add-ticket-comment/add-ticket-comment.component';
import {TicketHistoryComponent} from '../../../pop-up/ticket-history/ticket-history.component';
import {AppConstants} from '../../../../shared/services/app.constants';

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
  public userName;
  private id: any;
  public addCommentForm: FormGroup;
  public status = ['CREATED', 'ASSIGNED', 'RESOLVED', 'CLOSED'];
  public stages = [
    {name: 'Resolved', value: 'RESOLVED'}, {name: 'Reject', value: 'REJECTED'}, {name: 'Close', value: 'CLOSED'}
  ];
  public rowList: any[] = [];
  public idList: any[] = [];

  constructor(private http: HttpService, private dateTableService: DataTableService, private menuService: MenuService,
              private router: Router, private elRef: ElementRef, private dialog: MatDialog, private filter: FilterService,
              private httpService: HttpService) {
  }

  ngOnInit() {
    const url = (localStorage.getItem(AppConstants.USER_ROLE) === 'ROLE_ADMIN') ? 'v1/tickets' : 'v1/tickets/mytickets';
    this.dtOptions = Object.assign(this.dateTableService.getBasicTable(url, this.getColumnsDefinition())
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
    this.onActionButtonSelect();
    this.http.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
    this.addCommentForm = new FormGroup({
      ticketId: new FormControl(null),
      comment: new FormControl('')
    });
  }

  search(name: string, columnIndex: number) {
    this.filter.search(name, columnIndex, this.dtElement);
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: '', data: 'id', orderable: false, render: (data, type, full) => {
        const html = '<input type="checkbox" data-dataId="' + data + '" id="row-check" class="dt-checkboxes">';
        return html;
      }
    });
    columns.push({
      title: 'ID', data: 'id', bSortable: false, render: (data, type, full) => {
        const html = '<a id ="ticketDetailBtn" data-id="' + data + '" href="javascript:void(0);" ' +
          '> ' + data + ' </a>';
        return html;
      }
    });
    columns.push({title: 'MODULE', data: 'module', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'DATA SOURCE', data: 'dataSource', bSortable: false, render:  $.fn.dataTable.render.text()});
    columns.push({title: 'RECON', data: 'recon', bSortable: false, render:  $.fn.dataTable.render.text()});
    columns.push({title: 'ASSIGN TO', data: 'assignTo', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'ASSIGNED BY', data: 'assignBy', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'STATUS', data: 'status'});
    columns.push({
      title: 'ACTION', data: 'id', bSortable: false, render: (data, type, full) => {
        let actionHtml = '<div class="btn-group">';
        actionHtml += ' <a #actionChangeStatusBtn id="actionChangeStatusBtn" data-id="' + full.id + '" class="dropdown-item" style="width: inherit"><i class="fa fa-exchange icon-2x pull-right cursor" aria-hidden="true"></i></a>';
        actionHtml += ' <a #actionUploadDocumentBtn id="actionUploadDocumentBtn" data-id="' + full.id + '" class="dropdown-item" style="width: inherit"><i class="fa fa-cloud-upload icon-2x pull-right cursor" aria-hidden="true"></i></a>';
        actionHtml += ' <a #actionBtn id ="actionBtn" data-id="' + full.id + '" href="javascript:void(0);" class="dropdown-item" style="width: inherit"><i class="fa fa-comment-o icon-2x pull-right cursor" aria-hidden="true"></i></a>';
        actionHtml += ' </div>';
        return actionHtml;
      }
    });
    return columns;
  }

  ngAfterViewChecked() {
  }

  private onActionButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a#actionBtn', function () {
      that.id = jQuery(this).data('id');
      that.onAddTicketComment(that.id);
    });

    jQuery('table').on('click', 'a#actionUploadDocumentBtn', function () {
      that.id = jQuery(this).data('id');
      that.onDocumentUpload(that.id);
    });

    jQuery('table').on('click', 'a#actionChangeStatusBtn', function () {
      that.id = jQuery(this).data('id');
      that.onChangeStatus(that.id);
    });

    jQuery('table').on('click', 'a#dataRowDetailBtn', function () {
      const dataRowId = jQuery(this).data('id');
    });

    jQuery('table').on('click', 'a#ticketDetailBtn', function () {
      const ticketId = jQuery(this).data('id');
      that.showTicketDetails(ticketId);
    });
  }

 private showTicketDetails(id:  number) {
    const data = {id: id};
    const dialogRef = this.dialog.open(TicketHistoryComponent, {width: '800px', height: '700px', data});
    dialogRef.afterClosed().subscribe(result => {
      this.refreshTable();
    });
  }

  private onDetailButtonSelect(rowData: any) {
    const id: number = rowData.id;
    const that = this;
    $('table').unbind('click').on('click', 'input', function () {
      const status = $(this).prop('checked');
      if (status) {
        that.idList.push(id);
        jQuery(this).closest('tr').addClass('row-selected');
      } else {
        jQuery(this).closest('tr').removeClass('row-selected');
        const index: number = that.idList.indexOf(id);
        if (index !== -1) {
          that.idList.splice(index, 1);
        }
      }
    });
    this.onActionButtonSelect();
  }

  public onDocumentUpload(id: string) {
      const that = this;
      const data = {rowList: [{ids: id}]};
      const dialogRef = this.dialog.open(TicketDocumentUploadComponent, {width: '600px', height: '300px', data});
      dialogRef.afterClosed().subscribe(result => {
        that.refreshTable();
      });
    }

  public onAddTicketComment(id: string) {
    const that = this;
    const data = {ticketId: id};
    const dialogRef = this.dialog.open(AddTicketCommentComponent, {width: '600px', height: '300px', data});
    dialogRef.afterClosed().subscribe(result => {
      that.refreshTable();
    });
  }

  public onChangeStatus(id: string) {
    const that = this;
      const data = {rowList: [{ids: id}], stages: this.stages};
      const dialogRef = this.dialog.open(ChangeTicketStatusComponent, {width: '600px', height: '450px', data});
      dialogRef.afterClosed().subscribe(result => {
        that.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
        });
      });
    }

  public onProcess() {
    const checkIdCount = this.idList.length;
    if (checkIdCount === 0) {
      this.showMessage();
    } else {
      let id;
      for (const val of this.idList) {
        id = val.ids;
      }
      for (const vals of this.idList) {
        if (!isNullOrUndefined(vals)) {
          this.rowList.push({ids: vals});
        }
      }
      const data = {rowList: this.rowList, stages: this.stages};
      const dialogRef = this.dialog.open(ChangeTicketStatusComponent, {width: '600px', height: '450px', data});
      dialogRef.afterClosed().subscribe(result => {
        this.refreshTable();
      });
    }
  }

  public onDocument() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      let id;
      for (const val of this.idList) {
        id = val;
      }
      for (const vals of this.idList) {
        this.rowList.push({ids: vals});
      }
      const data = {rowList: this.rowList};
      const dialogRef = this.dialog.open(TicketDocumentUploadComponent, {width: '600px', height: '300px', data});
      dialogRef.afterClosed().subscribe(result => {
        this.refreshTable();
      });
    }
  }

  public onComment() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      let id;
      for (const val of this.idList) {
        id = val;
      }
      this.onAddTicketComment(id);
    }
  }


  public onHistory() {
    const checkIdCount = this.idList.length;
    if (checkIdCount > 1) {
      this.showMessage(false);
    } else if (checkIdCount === 0) {
      this.showMessage();
    } else {
      let id;
      for (const val of this.idList) {
        id = val;
      }
      const data = {id: id};
      const dialogRef = this.dialog.open(TicketHistoryComponent, {width: '800px', height: '500px', data});
      dialogRef.afterClosed().subscribe(result => {
        this.refreshTable();
      });
    }
  }

  public refreshTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
    this.rowList = [];
    this.idList = [];
  }

  public showMessage(messageType: boolean = true) {
    if (messageType === true) {
      this.httpService.displayErrorOnPopUp('Select at least one record ');
    } else {
      this.httpService.displayErrorOnPopUp('select only one record ');
    }
  }
}
