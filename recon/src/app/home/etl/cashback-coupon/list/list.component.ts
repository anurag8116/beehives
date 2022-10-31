import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {MenuService} from '../../../../shared/menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import {FilterService} from '../../../../shared/services/filter.service';
import {DatePipe} from '@angular/common';
import {HistoryComponent} from '../../../pop-up/history/history.component';
import {CashbackFileUploadComponent} from '../../../pop-up/cashback-file-upload/cashback-file-upload.component';
import {FormBuilder} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {AppConstants} from '../../../../shared/services/app.constants';
import {BsDatepickerConfig} from 'ngx-bootstrap';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit, AfterViewChecked {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('tableContainer') tableContainer: ElementRef;
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  brands = [];

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private filter: FilterService,
              private menuService: MenuService, private router: Router, private route: ActivatedRoute, private elRef: ElementRef,
              private datePipe: DatePipe, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.dtOptions = this.dateTableService.getBasicTable('v1/discountcriteria', this.getColumnsDefinition());
    this.httpService.get('v1/discountcriteria/brands', true).subscribe(
      (data: any) => {
        this.brands = data;
      }
    );
    this.onDetailButtonSelect();
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  public searchByDate(value: string, index: number): void {
    const date = value ? this.httpService.driveDate(value) : null;
    this.search(date, index);
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
      this.elRef.nativeElement.querySelectorAll('a#uploadBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.onUpload($(item).data('id'));
        });
      });
      this.elRef.nativeElement.querySelectorAll('a#deleteBtn ').forEach(function (item) {
        $(item).unbind('click');
        $(item).bind('click', (event) => {
          self.delete($(item).data('id'));
        });
      });
    }, 100);
  }

  delete(id: number): void {
    this.httpService.delete('v1/discountcriteria/' + id, true).subscribe(
      (data: any) => {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
        });
        this.httpService.displaySuccessOnPopUp('Cashback Coupon Successfully Deleted !');
      }
    );
  }

  edit(id: number): void {
    this.router.navigate(['/home/etl', 'cashback-coupon', {outlets: {'fullBodyOutlet': ['edit']}}], {queryParams: {id: id}});
  }

  onUpload(id: number): void {
    this.dialog.open(CashbackFileUploadComponent, {width: '550px', height: '320px', data: {id: id}});
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({
      title: 'ID', data: 'id', bSortable: false, render: (data, type, full) => {
        const html = '<a id ="detailBtn" data-id="' + data + '" href="javascript:void(0);" ' +
          '> ' + data + ' </a>';
        return html;
      }
    });
    columns.push({
      title: 'BRAND_NAME', data: 'brand', bSortable: false, render: (data, type, full) => {
        return isNullOrUndefined(data) ? null : data.name;
      }
    });
    columns.push({title: 'COUPON_CODE', data: 'couponCode', bSortable: false});
    columns.push({title: 'DISCOUNT (in %)', data: 'discount', bSortable: false});
    columns.push({title: 'SLICE_SHARE (in %)', data: 'sliceShare', bSortable: false});
    columns.push({title: 'PARTNER_SHARE (in %)', data: 'partnerShare', bSortable: false});
    columns.push({title: 'OFFER_START_DATE', data: 'offerStartDate', bSortable: false});
    columns.push({title: 'OFFER_END_DATE', data: 'offerEndDate', bSortable: false});
    columns.push({title: 'OFFER_KEY', data: 'offerKey', bSortable: false});
    columns.push({title: 'SUB_CATEGORY', data: 'subCategory', bSortable: false});
    columns.push({title: 'CREATED_BY', data: 'createdBy', bSortable: false});
    const action = {
      title: 'ACTION', data: 'id', className: 'text-center', bSortable: false, render: (data, type, full) => {
        let actionHtml = '<div class="btn-group">';
        if (full.updatable) {
          actionHtml += ' <a id ="editBtn" data-id="' + data + '"  href="javascript:void(0);" class="dropdown-item" style="width: inherit;"><i class="fa fa-pencil-square-o pull-left cursor fa-1x" aria-hidden="true"></i></a>';
          actionHtml += ' <a id ="deleteBtn" data-id="' + data + '"  href="javascript:void(0);" class="dropdown-item" style="width: inherit;"><i class="fa fa-trash-o cursor left-space fa-1x" aria-hidden="true"></i></a>';
        }
        if (full.fileUplodable) {
          actionHtml += ' <a id ="uploadBtn" data-id="' + data + '"  href="javascript:void(0);" class="dropdown-item" style="width: inherit;"><i class="fa fa-upload cursor left-space fa-1x" aria-hidden="true"></i></a>';
        }
        // actionHtml += ' <a id ="uploadBtn" data-id="' + data + '"  href="javascript:void(0);" class="dropdown-item btn btn-success btnicon" style="width: inherit">upload</a>';
        actionHtml += ' </div>';
        return actionHtml;
      }
      // <a id="deleteBtn" data-id="2" href="javascript:void(0);" class="btn btn-success btnicon dropdown-item" style="width: inherit">upload</a>
    };
    columns.push(action);
    return columns;
  }

  private onDetailButtonSelect() {
    const that = this;
    jQuery('table').on('click', 'a#detailBtn', function () {
      that.menuService.action.next(jQuery(this).data('id'));
      that.router.navigate(['/home/etl', 'cashback-coupon', {outlets: {'fullBodyOutlet': ['detail']}}], {queryParams: {id: jQuery(this).data('id')}});
    });
  }
}
