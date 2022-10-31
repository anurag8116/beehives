import {Component, Inject, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/services/http-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {isNullOrUndefined} from 'util';
import {DataTableService} from '../../../shared/services/data-table-service';
import {DataTableDirective} from 'angular-datatables';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-propose-match',
  templateUrl: './propose-match.component.html'
})
export class ProposeMatchComponent implements OnInit {

  dtOptionsProposeMatch: DataTables.Settings = {};
  public rules = [];
  public selectedRules: any = [];
  public proposeMatchRequestId = null;
  public showPopTable: any = false;
  public proposeMatchSelectedSOurceIds: any = [];

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private dialogRef: MatDialogRef<ProposeMatchComponent>,
              @Inject(MAT_DIALOG_DATA) public popUpData: any) { }

  ngOnInit() {
    this.httpService.get('v1/rules?Find=ByRuleGroupExecutionType&reconId=' + this.popUpData.reconId, true).subscribe(
      (dataa: any) => {
        this.rules = dataa;
        this.httpService.get('v1/favoriteproposalRules?Find=ByUserAndDataSource&dataSource=' + this.popUpData.dataSourceId, true).subscribe(
          (data: any) => {
            for (const rule of this.rules) {
              for (const savedRule of data) {
                if (rule.id === savedRule.rule.id) {
                  rule['checked'] = true;
                  this.selectedRules.push(rule.id);
                }
              }
            }
            if (this.selectedRules.length > 0) {
              this.onRuleSubmit();
            }
          });
      });
  }

  onRuleSubmit() {
    if (this.selectedRules.length === 0 || this.selectedRules.length < 0) {
      this.httpService.displayErrorOnPopUp('Select At least One Rule');
    } else {
      const ids = [];
      for (let i = 0; i < this.popUpData.dataSourceOneArray.length; i++) {
        ids.push(this.popUpData.dataSourceOneArray[i].ids);
      }
      const form = {
        recon: this.popUpData.reconId,
        dataSource: this.popUpData.sourceIdForProposedMatch,
        dataIds: ids,
        proposeMatchRules: this.selectedRules
      };
      this.httpService.post('v1/proposematchrequests', form, true).subscribe(
        (data: any) => {
          if (!isNullOrUndefined(data)) {
            this.proposeMatchRequestId = data.id;
            this.proposeMatchRequestResult();
          }
        }
      );
    }
  }

  private proposeMatchRequestResult() {
    if (!isNullOrUndefined(this.proposeMatchRequestId) && !isNullOrUndefined(this.popUpData.sourceIdForProposedMatch)) {
      const url = 'v1/proposematchrequests/' + this.proposeMatchRequestId + '?dataSourceId=' + this.popUpData.sourceIdForProposedMatch;
      this.showPopTable = false;
      this.httpService.get('v1/unmatchedtransactions?Find=ByDataSource&dataSource=' + this.popUpData.sourceIdForProposedMatch, true).subscribe(
        (tableViewData: any) => {
          this.dtOptionsProposeMatch = Object.assign(this.dateTableService.getBasicTable(url, this.getProposeMatchColumnsDefinition(tableViewData))
            , {
              rowCallback: (row: Node, rowData: any, index: number) => {
                const self = this;
                if (rowData.reconStatus && rowData.reconStatus === 'ACTION_IN_PROGRESS') {
                  $(row).addClass('ignoreme');
                } else {
                  $('td', row).unbind('click');
                  $('td', row).bind('click', () => {
                    self.onCheckBoxButtonSelect(rowData, this.popUpData.sourceIdForProposedMatch);
                  });
                }
                return row;
              },
            });
          this.showPopTable = true;
        });
    }
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
      that.popUpData.dtElements.forEach((dtElement: DataTableDirective) => {
        dtElement.dtInstance.then((dtInstance: any) => {
          if ('propose_match_table' === dtInstance.table().node().id) {
            const row = dtInstance.row(tr);
            if (row.child.isShown()) {
              row.child.hide();
              tr.removeClass('shown');
            } else {
              row.child(that.format(rowIds, dataSourceId)).show();
              tr.addClass('shown');
            }
          }
        });
      });
    });

    jQuery('table').on('click', 'input#check', function () {

      if (jQuery(this).closest('tr').hasClass('row-selected')) {
        jQuery(this).closest('tr').removeClass('row-selected');
      } else {
        jQuery(this).closest('tr').addClass('row-selected');
      }
    });
  }

  private getProposeMatchColumnsDefinition(tableView): any[] {
    const columns: any [] = [];
    let restriket = 0;
    tableView.tableColumns.forEach((item, index) => {
      restriket = restriket + 1;
      this.popUpData.tableCoumnOrders.push({index: index, title: item.label, data: item.fieldName});
      if (restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2, render: (data, type, full) => {
            let html = '  ';
            if (!(full.reconStatus && full.reconStatus === 'ACTION_IN_PROGRESS')) {
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

  format(rowId, sourceId) {
    const div = $('<div/>')
      .addClass('loading').addClass('table-detail-panal')
      .text('Loading...');
    this.httpService.get('v1/reconmapping?Find=ByRowAndSource&operationType=PROPOSE_MATCH&rowId=' + rowId + '&sourceId=' + sourceId, true).subscribe(
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

  private getHtmlDataSourceDetail(data: any): string {

    let page = '    <div class="col-md-12 left-pad2 right-pad2 source-detail-popup">\n' +
      '\n' +
      '      <div class="panel">\n' +
      '        <div class="panel-heading newbg">\n' +
      '          <h3 class="panel-title">Source Detail</h3>\n' +
      '        </div>\n';
    if (!isNullOrUndefined(data) && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const sourceRows = data[i].mappedRowSourceData;
        page += '<div class="row">\n' +
          '          <div class="col-md-12" style="margin-left: 22px"><h5>Source: ' + data[i].sourceName + ' </h5></div>\n' +
          '      </div>\n' +
          '      <div class="panel-body">\n' +
          '        <div class="panel panel-profile table-responsive border-none cover2 source-align">\n';
        /*   let k = 0;
           let rawIsOdd = true;*/
        page += '        <table class="table history">' +
          '                 <thead> ' +
          '                     <tr>';
        const toKey = Object.keys(sourceRows[0].data);
        page += '                 <th scope="col"> </th>';
        for (let j = 0; j < toKey.length; j++) {
          page += '                 <th scope="col"> ' + toKey[j] + '</th>';
        }
        page += '               </tr>' +
          '                 </thead>' +
          '                 <tbody>';
        for (let l = 0; l < sourceRows.length; l++) {
          page += '                     <tr>';
          page += '                 <td scope="col"> <input type="radio"  class="history-check" onclick="' + this.onProposeMatchResultCheckClick() + '" name="' + data[i].sourceId + '" id="' + sourceRows[l].id + '"';
          if (this.proposeMatchSelectedSOurceIds.indexOf(+sourceRows[l].id) !== -1) {
            page += ' checked';
          }
          page += '></td>';
          for (let j = 0; j < toKey.length; j++) {
            page += '                 <td scope="col"> ' + sourceRows[l]['data'][toKey[j]] + '</td>';
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

  private onProposeMatchResultCheckClick() {
    $('table').unbind('click');
    const that = this;
    jQuery('table').on('click', 'input', function () {
      $('.history-check').each(function (i, obj: any) {
        const split = obj.getAttribute('id').split('_');
        if (obj.checked && that.proposeMatchSelectedSOurceIds.indexOf(+obj.getAttribute('id')) === -1) {
          that.proposeMatchSelectedSOurceIds.push(+obj.getAttribute('id'));
        }
        if (!obj.checked && that.proposeMatchSelectedSOurceIds.indexOf(+obj.getAttribute('id')) !== -1) {
          that.proposeMatchSelectedSOurceIds.splice(that.proposeMatchSelectedSOurceIds.indexOf(+obj.getAttribute('id')), 1);
        }
      });
    });
  }

  submitPerposeTransToApprovalShow () {
    if (this.proposeMatchSelectedSOurceIds.length > 0) {
      jQuery('#proposeMatch-description-modal').modal('show');
    } else {
      this.httpService.displayErrorOnPopUp('Select Atleast One Row');
    }
  }

  cancelProposedMatchPopUp() {
    this.proposeMatchSelectedSOurceIds = [];
    this.proposeMatchRequestId = null;
    this.showPopTable = false;
    this.selectedRules = [];
    this.rules = [];
  }

  public submitPerposeTransToApproval() {
    if (this.proposeMatchRequestId) {
      const form = {
    //    description: this.proposeMatch.controls['description'].value,
        proposeMatchRequestId: this.proposeMatchRequestId,
        dataSourceId: this.popUpData.sourceIdForProposedMatch,
        mappedRows: this.proposeMatchSelectedSOurceIds
      };
 /*     this.httpService.post('v1/proposematchrequests/approvalrequest', form, true).subscribe(
        (data: any) => {
          this.proposeMatchSelectedSOurceIds = [];
          this.proposeMatchDescriptionCancel ();
          this.dtElements.forEach((dtElement: DataTableDirective) => {
            dtElement.dtInstance.then((dtInstance: any) => {
              if ('propose_match_table' === dtInstance.table().node().id) {
                dtInstance.ajax.reload();
              }
            });
          });
          this.httpService.displaySuccessOnPopUp('Transactions are processed for approval. ');
        },
        (errorResponse: HttpErrorResponse) => {
        }
      );*/
    }
  }

}
