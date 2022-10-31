import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {ServiceConstant} from '../../../../shared/services/service-constant';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {isNullOrUndefined} from 'util';
import 'rxjs/add/observable/interval';
import {Subscription} from 'rxjs/Subscription';
import {NgxSpinnerService} from 'ngx-spinner';
import {timer} from 'rxjs/observable/timer';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit, OnDestroy {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  public modules: any = [];
  public loading: boolean;
  public tableCoumnOrders: any = [];
  public searchFileds: any = [];
  public dataSources = [];
  public recons: any = [];
  public ruleGroups: any = [];
  public dropDownSettings: any = {};
  public form: FormGroup;
  public relaxmatchForm: FormGroup;
  public showTable: any = false;
  private dataSourceViewId: number;
  public dataSourceId: number;
  public relaxMatchId: any;
  public isLoad = false;
  private selectedMappingIds: any;
  public timerSubscription: Subscription;
  public jobStatus: string;

  constructor(private http: HttpService, private router: Router, private dateTableService: DataTableService,
              private spinner: NgxSpinnerService, private  changeDef: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.loading = false;
    this.form = new FormGroup({
      moduleId: new FormControl(),
      reconId: new FormControl(),
      manualRuleGroup: new FormControl(null),
      proposeMatch: new FormControl(false),
      matchingRules: new FormArray([])
    });
    this.relaxmatchForm = new FormGroup({
      description: new FormControl(),
    });
    this.http.get('v1/modules?start=0', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      }
    );
    this.dropDownSettings = ServiceConstant.getDropDownDefaultSetting();
    this.selectedMappingIds = [];
  }


  public onModuleChange(moduleId: number) {
    this.recons = [];
    this.ruleGroups = [];
    this.http.get('v1/recons?Find=ByModule&module=' + moduleId, true).subscribe(
      (data: any) => {
        this.recons = data.data;
      }
    );
  }

  public onReconChange(reconId: number) {
    this.ruleGroups = [];
    this.form.patchValue({manualRuleGroup: null});
    this.http.get('v1/rulegroups?Find=ByRecon&recon=' + reconId, true).subscribe(
      (data: any) => {
        this.ruleGroups = data.data;
        if (!isNullOrUndefined(data.data) && data.data.length > 0) {
          this.http.get('v1/unmatchedtransactions?Find=ByRecon&recon=' + reconId, true).subscribe(
            (dataa: any) => {
              this.dataSources = dataa;
              if (this.dataSources && this.dataSources.length > 0) {
                this.dataSourceViewId = this.dataSources[0].id;
              }
            }
          );
        }
      }
    );
  }

  public onMatchingRuleSelect() {
    this.http.post('v1/rules?Find=ByRuleGroup', this.form.get('manualRuleGroup').value, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data) && data.length > 0) {
          this.form.removeControl('matchingRules');
          this.form.addControl('matchingRules', new FormArray([]));
          for (let i = 0; i < data.length; i++) {
            this.addMatchingRules(data[i], i);
          }
          this.changeDef.detectChanges();
        }
      }
    );
  }

  public onClickNext() {
    if (this.form.get('manualRuleGroup').value !== null && this.form.get('manualRuleGroup').value.length > 0) {
      if ($('#resultTab').hasClass('active')) {
        $('#resultTab').removeClass('active');
      }
      if ($('#reconTab').hasClass('active')) {
        $('#reconTab').removeClass('active');
      }
      if (!$('#matchingRulesTab').hasClass('active')) {
        $('#matchingRulesTab').addClass('active');
        $('#step1').hide();
        $('#step2').show();
        this.onMatchingRuleSelect();
      }
    } else {
      this.http.displayErrorOnPopUp('Select at least one rule group! ');
    }
  }

  public onClickPrevious() {
    if ($('#resultTab').hasClass('active')) {
      $('#resultTab').removeClass('active');
    }
    if ($('#matchingRulesTab').hasClass('active')) {
      $('#matchingRulesTab').removeClass('active');
    }
    if (!$('#reconTab').hasClass('active')) {
      $('#reconTab').addClass('active');
      $('#step2').hide();
      $('#step1').show();
    }
  }

  public addMatchingRules(data: any, index = 0): void {
    const control = new FormGroup({
      ruleId: new FormControl(data.id),
      ruleEnable: new FormControl(true),
      ruleName: new FormControl(data.name),
      preDataSourceId: new FormControl(data.primaryDataSource.id),
      preDataSourceName: new FormControl(data.primaryDataSource.name),
      secDataSourceId: new FormControl(data.secondaryDataSource.id),
      secDataSourceName: new FormControl(data.secondaryDataSource.name),
      conditions: new FormArray([])
    });
    (<FormArray>this.form.get('matchingRules')).push(control);
    if (!isNullOrUndefined(data.conditions) && data.conditions.length > 0) {
      for (let i = 0; i < data.conditions.length; i++) {
        const obj = data.conditions[i];
        obj.conditionEnable = true;
        if (isNullOrUndefined(obj.dataElement)) {
          obj.dataElement = {id: null};
        }
        if (isNullOrUndefined(obj.sourceDataElement)) {
          obj.sourceDataElement = {id: null};
        }
        this.addCondition(data.conditions[i], index);
      }
    }
  }

  public addCondition(data: any, index = 0): void {
    const control = new FormGroup({
      matchingOperator: new FormControl(null),
      id: new FormControl(null),
      conditionEnable: new FormControl(true),
      sequence: new FormControl(null),
      conditionJointType: new FormControl(null),
      elementOne: new FormGroup({
        id: new FormControl(null),
        name: new FormControl(null),
        valueType: new FormControl(null),
        value: new FormControl(null),
        varianceType: new FormControl(null),
        dataElement: new FormControl(null),
        uiElement: new FormControl(null),
        dataSourceId: new FormControl(null),
        formula: new FormControl(null)
      }),
      elementSecond: new FormGroup({
        id: new FormControl(null),
        name: new FormControl(null),
        valueType: new FormControl(null),
        value: new FormControl(null),
        varianceType: new FormControl(null),
        dataElement: new FormControl(null),
        uiElement: new FormControl(null),
        dataSourceId: new FormControl(null),
        formula: new FormControl(null)
      }),
    });
    control.patchValue(data);
    (<FormArray>((<FormArray>this.form.get('matchingRules')).at(index).get('conditions'))).push(control);
  }

  public onDataSourceChange(dataSourceViewId: number, relaxMatchId: number): void {
    this.timerSubscription.unsubscribe();
    this.showTable = false;
    this.selectedMappingIds = [];
    this.dataSourceViewId = dataSourceViewId;
    if (!isNullOrUndefined(this.dataSourceViewId) && !isNullOrUndefined(this.relaxMatchId)) {
      this.http.get('v1/unmatchedtransactions/' + dataSourceViewId, true).subscribe(
        (data: any) => {
          this.dataSourceId = data.datasourceVo.id;
          this.searchFileds = data.filters;
          const url = 'v1/relaxmatchs/' + relaxMatchId + '?dataSourceId=' + this.dataSourceId;
          this.dtOptions = Object.assign(this.dateTableService.getBasicTable(url, this.getColumnsDefinition(data)), {
            rowCallback: (row: Node, rowData: any, index: number) => {
              const self = this;
              if (rowData.reconStatus && rowData.reconStatus === 'ACTION_IN_PROGRESS') {
                $(row).addClass('ignoreme');
              } else {
                $('td', row).unbind('click');
                $('td', row).bind('click', () => {
                  self.onCheckBoxButtonSelect(rowData, this.dataSourceId);
                });
              }
              return row;
            },
          });
          this.isLoad = false;
          this.spinner.hide();
          this.showTable = true;
        });
    }
  }

  public searchByName(name: string, searchField: string) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.tableCoumnOrders.forEach(function (value) {
        if (value.data === searchField) {
          dtInstance.columns(value.index).search(name).draw();
        }
      });
    });
  }

  public afterSubmit() {
    if ($('#matchingRulesTab').hasClass('active')) {
      $('#matchingRulesTab').removeClass('active');
    }
    if ($('#reconTab').hasClass('active')) {
      $('#reconTab').removeClass('active');
    }
    if (!$('#resultTab').hasClass('active')) {
      $('#resultTab').addClass('active');
      $('#step2').hide();
      $('#step1').hide();
      $('#step3').show();
    }
  }

  onDiscardSubmit() {
    const form = {relaxMatchRequestId: this.relaxMatchId, dataSourceId: this.dataSourceId, dataSourceDataIds: this.selectedMappingIds};
    this.http.post('v1/relaxmatchs/discardrequestresult', form, true).subscribe(
      (data: any) => {
        this.selectedMappingIds = [];
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.ajax.reload();
        });
        this.http.displaySuccessOnPopUp('Transactions are Discarded. ');
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  public onSubmit() {
    this.spinner.show();
    this.http.post('v1/relaxmatchs', this.form.value, true).subscribe(
      (data: any) => {
        this.relaxMatchId = data.id;
        this.subscribeToData();
        this.http.displaySuccessOnPopUp('Your Request has been processed....');
        this.afterSubmit();
        this.spinner.hide();
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  public getJobStatus() {
    if (!isNullOrUndefined(this.relaxMatchId)) {
      this.spinner.show();
      this.http.get('v1/relaxmatchs/jobStatus?id=' + this.relaxMatchId, true).subscribe(
        (data: any) => {
          if (data) {
            this.timerSubscription.unsubscribe();
            this.onDataSourceChange(this.dataSourceViewId, this.relaxMatchId);
            this.jobStatus = '';
          } else {
            this.jobStatus = 'Request In Processing...';
          }
          this.spinner.hide();
        },
        (errorResponse: HttpErrorResponse) => {
        }
      );
    }
  }

  private subscribeToData(): void {
    this.showTable = false;
    this.timerSubscription = timer(100, 3000).subscribe(() => this.getJobStatus());
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  format(rowId, sourceId) {
    const div = $('<div/>')
      .addClass('loading').addClass('table-detail-panal')
      .text('Loading...');
    this.http.get('v1/reconmapping?Find=ByRowAndSource&rowId=' + rowId + '&sourceId=' + sourceId, true).subscribe(
      (data: any) => {
        if (!isNullOrUndefined(data)) {
          const html = this.getHtmlDataSourceDetail(data);
          div.html(html)
            .removeClass('loading');
        }
      }
    );
    return div;
  }

  submitPerposeTransToApprovalShow() {
    if (this.relaxMatchId) {
      jQuery('#relax-description-modal').modal('show');
    }
  }

  relaxMatchDescriptionCancel() {
    jQuery('#relax-description-modal').modal('hide');
  }

  public submitPerposeTransToApproval() {
    const form = {
      description: this.relaxmatchForm.controls['description'].value,
      relaxMatchRequestId: this.relaxMatchId,
      dataSourceId: this.dataSourceId,
      dataSourceDataIds: this.selectedMappingIds
    };
    this.http.post('v1/relaxmatchs/approvalrequest', form, true).subscribe(
      (data: any) => {
        this.selectedMappingIds = [];
        this.relaxMatchDescriptionCancel();
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.ajax.reload();
        });
        this.http.displaySuccessOnPopUp('Transactions are processed for approval. ');
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  private onCancelButton() {
    const that = this;
    $.confirm({
      title: 'Confirm !',
      columnClass: 'col-md-4 col-md-offset-4',
      offsetBottom: 400,
      content: ' In case of cancelation all Unchecked Transactions will be discard do you want to continue !',
      type: 'blue',
      buttons: {
        formSubmit: {
          text: 'Submit', btnClass: 'submit-btn', action: function () {
            that.resetForm();
          }
        },
        formCancel: {
          text: 'Cancel', btnClass: 'btn btn-primary cancel-btn', action: function () {
          }
        },
      },
    });
  }

  public resetForm() {
    this.showTable = false;
    if (this.relaxMatchId) {
      this.http.delete('v1/relaxmatchs/' + this.relaxMatchId, true).subscribe(
        (data: any) => {
          this.http.displaySuccessOnPopUp('Discard All Relax Match Transactions .');
          this.ngOnInit();
          /*this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.ajax.reload();
          });*/
          this.recons = [];
          this.ruleGroups = [];
          this.relaxMatchId = null;
          this.dataSourceId = null;

          if ($('#matchingRulesTab').hasClass('active')) {
            $('#matchingRulesTab').removeClass('active');
          }
          if (!$('#reconTab').hasClass('active')) {
            $('#reconTab').addClass('active');
          }
          if ($('#resultTab').hasClass('active')) {
            $('#resultTab').removeClass('active');
          }
          $('#step3').hide();
          $('#step2').hide();
          $('#step1').show();
        },
        (errorResponse: HttpErrorResponse) => {
        }
      );
    }
  }

  private getHtmlDataSourceDetail(data: any): string {

    let page = '    <div class="col-md-12 left-pad2 right-pad2 source-detail">\n' +
      '\n' +
      '      <div class="panel">\n' +
      '        <div class="panel-heading newbg">\n' +
      '          <h3 class="panel-title">Source Detail</h3>\n' +
      '        </div>\n';
    if (!isNullOrUndefined(data) && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const source = data[i].mappedRowSourceData;
        page += '<div class="row">\n' +
          '          <div class="col-md-12" style="margin-left: 22px"><h5>Source: ' + data[i].sourceName + ' </h5></div>\n' +
          '      </div>\n' +
          '      <div class="panel-body">\n' +
          '        <div class="panel panel-profile border-none cover2 source-align">\n';
        const toKey = Object.keys(source[0].data);
        /*   let k = 0;
           let rawIsOdd = true;*/
        page += '        <table class="table">' +
          '                 <thead> ' +
          '                     <tr>';
        for (let j = 0; j < toKey.length; j++) {
          page += '                 <th scope="col"> ' + toKey[j] + '</th>';
        }
        page += '               </tr>' +
          '                 </thead>' +
          '                 <tbody>';
        for (let l = 0; l < source.length; l++) {
          page += '                     <tr>';
          for (let j = 0; j < toKey.length; j++) {
            page += '                 <td scope="col"> ' + source[l]['data'][toKey[j]] + '</td>';
          }
          page += '               </tr>';
        }
        page += '                 </tbody>' +
          '              </table> ' +
          '          </div>\n' +
          '      </div>\n';
      }
    }
    page += '</div>' +
      '      </div>\n';
    return page;
  }

  private onCheckBoxButtonSelect(rowData: any, dataSourceId) {
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

    $('table').unbind('click');
    const that = this;
    jQuery('table').on('click', 'a#detailBtn', function () {
      const tr = $(this).closest('tr');
      that.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        const row = dtInstance.row(tr);
        if (row.child.isShown()) {
          row.child.hide();
          tr.removeClass('shown');
        } else {
          row.child(that.format(rowIds, dataSourceId)).show();
          tr.addClass('shown');
        }
      });
    });

    jQuery('table').on('click', 'input#check', function () {

      if (jQuery(this).closest('tr').hasClass('row-selected')) {
        jQuery(this).closest('tr').removeClass('row-selected');
      } else {
        jQuery(this).closest('tr').addClass('row-selected');
      }
      that.setDataInList(rowIds);
    });
  }


  private setDataInList(rowId: number) {
    if (!isNullOrUndefined(this.selectedMappingIds)) {
      if (this.selectedMappingIds.indexOf(rowId) !== -1) {
        this.selectedMappingIds.splice(this.selectedMappingIds.indexOf(rowId), 1);
      } else {
        this.selectedMappingIds.push(rowId);
      }
    }
  }

  private getColumnsDefinition(tableView): any[] {
    const columns: any [] = [];
    let restriket = 0;
    tableView.tableColumns.forEach((item, index) => {
      restriket = restriket + 1;
      this.tableCoumnOrders.push({index: index, title: item.label, data: item.fieldName});
      if (restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2, render: (data, type, full) => {
            let html = '  ';
            if (!(full.reconStatus && full.reconStatus === 'ACTION_IN_PROGRESS')) {
              html += '  <input id="check"   type="checkbox">';
              html += '<a id ="detailBtn" class="details-control" href="javascript:void(0);" >  </a>';
            } else {
              html += '<a id ="detailBtn" style="margin-left: 13px" class="details-control" href="javascript:void(0);" >  </a>';
            }
            return html;
          }
        });
      }
      columns.push({title: item.label, data: item.fieldName});
    });
    return columns;
  }

  getNameElement(matchingRule: any, elementOne: any): string {
    let name = 'CONSTANT';
    if (elementOne.name) {
      if (elementOne.dataSourceId === matchingRule.preDataSourceId) {
        name = matchingRule.preDataSourceName + '-' + elementOne.name;
      } else {
        name = matchingRule.secDataSourceName + '-' + elementOne.name;
      }
    } else {
      name = 'CONSTANT';
    }
    return name;
  }
}
