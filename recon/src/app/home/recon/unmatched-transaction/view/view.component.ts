import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {AppConstants} from '../../../../shared/services/app.constants';
import {ActivatedRoute, Params} from '@angular/router';
import {DataTableDirective} from 'angular-datatables';
import {Subject} from 'rxjs/Subject';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {ServiceConstant} from '../../../../shared/services/service-constant';
import {isNullOrUndefined} from 'util';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {ReconDataType} from '../../../../shared/services/enum';
import {SubmitMultipleRowsComponent} from '../../../pop-up/submit-multiple-rows/submit-multiple-rows.component';
import {MatDialog} from '@angular/material/dialog';
import {TimelineCharComponent} from '../../../pop-up/timeline-char/timeline-char.component';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {AssignToUserComponent} from '../../../pop-up/assign-to-user/assign-to-user.component';
import {EditEtlDataComponent} from '../../../pop-up/edit-etl-data/edit-etl-data.component';
import {ProposeMatchComponent} from '../../../pop-up/propose-match/propose-match.component';
import {DatePipe} from '@angular/common';
import {timer} from 'rxjs/observable/timer';
import {RaiseTicketComponent} from '../../../pop-up/raise-ticket/raise-ticket.component';
import {TicketHistoryComponent} from '../../../pop-up/ticket-history/ticket-history.component';

enum Source {
  DATA_SOURCE_ONE = 'DATA_SOURCE_ONE',
  DATA_SOURCE_TWO = 'DATA_SOURCE_TWO',
  DATA_SOURCE_THREE = 'DATA_SOURCE_THREE',
  DATA_SOURCE_FOUR = 'DATA_SOURCE_FOUR',
  DATA_SOURCE_FIVE = 'DATA_SOURCE_FIVE',
  DATA_SOURCE_SIX = 'DATA_SOURCE_SIX',
  DATA_SOURCE_SEVEN = 'DATA_SOURCE_SEVEN',
  DATA_SOURCE_EIGHT = 'DATA_SOURCE_EIGHT',
  DATA_SOURCE_NINE = 'DATA_SOURCE_NINE',
  DATA_SOURCE_TEN = 'DATA_SOURCE_TEN'
}

enum DataType {
  DATE = 'DATE'
}

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewComponent implements OnInit, AfterViewChecked, OnDestroy {

  public authToken = localStorage.getItem(AppConstants.AUTH_TOKEN);
  public authUserId = localStorage.getItem(AppConstants.USER_ID);
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  @ViewChildren(DataTableDirective)
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings[] = [];
  dtOptionsProposeMatch: DataTables.Settings = {};
  public source: any;
  public forceMatchForm: any;
  public showPopTable: any = false;
  public masterView: any;
  public searchFileds: any = [];
  public selectedRules: any = [];
  public dataSourceOneArray: any = [];
  public dataSourceTwoArray: any = [];
  public dataSourceThreeArray: any = [];
  public dataSourceFourArray: any = [];
  public dataSourceFiveArray: any = [];
  public dataSourceSixArray: any = [];
  public dataSourceSevenArray: any = [];
  public dataSourceEightArray: any = [];
  public dataSourceNineArray: any = [];
  public dataSourceTenArray: any = [];
  public masterViewTwo: any;
  public masterViewThree: any;
  public masterViewFour: any;
  public masterViewFive: any;
  public masterViewSix: any;
  public masterViewSeven: any;
  public masterViewEight: any;
  public masterViewNine: any;
  public masterViewTen: any;
  public searchFiledsTwo: any = [];
  public searchFiledsThree: any = [];
  public searchFiledsFour: any = [];
  public searchFiledsFive: any = [];
  public searchFiledsSix: any = [];
  public searchFiledsSeven: any = [];
  public searchFiledsEight: any = [];
  public searchFiledsNine: any = [];
  public searchFiledsTen: any = [];
  public indexWiseDataSourceOne: number;
  public indexWiseDataSourceTwo: number;
  public indexWiseDataSourceThree: number;
  public indexWiseDataSourceFour: number;
  public indexWiseDataSourceFive: number;
  public indexWiseDataSourceSix: number;
  public indexWiseDataSourceSeven: number;
  public indexWiseDataSourceEight: number;
  public indexWiseDataSourceNine: number;
  public indexWiseDataSourceTen: number;
  public showTable: any = false;
  public twoWayRecon: any = false;
  public threeWayRecon: any = false;
  public fourWayRecon: any = false;
  public fiveWayRecon: any = false;
  public sixWayRecon: any = false;
  public sevenWayRecon: any = false;
  public eightWayRecon: any = false;
  public nineWayRecon: any = false;
  public tenWayRecon: any = false;
  public tableCoumnOrders: any = [];
  public tableCoumnOrdersTwo: any = [];
  public tableCoumnOrdersThree: any = [];
  public tableCoumnOrdersFour: any = [];
  public tableCoumnOrdersFive: any = [];
  public tableCoumnOrdersSix: any = [];
  public tableCoumnOrdersSeven: any = [];
  public tableCoumnOrdersEight: any = [];
  public tableCoumnOrdersNine: any = [];
  public tableCoumnOrdersTen: any = [];
  public DataSources: any[] = [];
  public list: any[] = [];
  public restriket = 0;
  public invalidData: any;
  public proposeMatch: FormGroup;
  public dataSource: any = {
    dataSourceOne: {id: {}, name: {}},
    dataSourceTwo: {id: {}, name: {}},
    dataSourceThree: {id: {}, name: {}},
    dataSourceFour: {id: {}, name: {}},
    dataSourceFive: {id: {}, name: {}},
    dataSourceSix: {id: {}, name: {}},
    dataSourceSeven: {id: {}, name: {}},
    dataSourceEight: {id: {}, name: {}},
    dataSourceNine: {id: {}, name: {}},
    dataSourceTen: {id: {}, name: {}}
  };
  public roles = [];
  public dataSearchPram: Map<string, any> = new Map<string, any>();
  private id: number;
  private sourceId: number;
  public rules = [];
  public selectedIndex: number;
  public sourceIdForProposedMatch: any;
  public proposeMatchRequestId = null;
  public subscription: Subscription;
  public proposeMatchSelectedSOurceIds: any = [];
  public formFavoriteRules: FormGroup;
  public historyDataId: number;
  public historyDataSourceId: number;
  public transactionHistory: any;
  public data: any;
  public dataSourceForProposeMatch: any;
  public timerSubscription: Subscription;
  public jobStatus: string;
  public raiseTicketData: any;

  constructor(private dateTableService: DataTableService, private httpService: HttpService, private  route: ActivatedRoute,
              private dialog: MatDialog, private datePipe: DatePipe, private  changeDef: ChangeDetectorRef) {
    this.source = Source;
  }

  ngOnInit() {
    this.dataSourceOneArray = [];
    this.dataSourceTwoArray = [];
    this.dataSourceThreeArray = [];
    this.dataSourceFourArray = [];
    this.dataSourceFiveArray = [];
    this.dataSourceSixArray = [];
    this.dataSourceSevenArray = [];
    this.dataSourceEightArray = [];
    this.dataSourceNineArray = [];
    this.dataSourceTenArray = [];
    this.proposeMatch = new FormGroup({
      'description': new FormControl(null),
    });
    this.formFavoriteRules = new FormGroup({
      dataSource: new FormGroup({
        id: new FormControl(null)
      }),
      favoriteRule: new FormArray([]),
    });
    this.route.params.subscribe((param: Params) => {
      this.id = +param['id'] || null;
      this.showTable = false;
      this.httpService.get('v1/unmatchedtransactions?Find=ByRecon&recon=' + this.id, true).subscribe(
        (data: any) => {
          this.DataSources = data;
          this.twoWayRecon = false;
          this.fourWayRecon = false;
          this.threeWayRecon = false;
          this.fiveWayRecon = false;
          this.sixWayRecon = false;
          this.sevenWayRecon = false;
          this.eightWayRecon = false;
          this.nineWayRecon = false;
          this.tenWayRecon = false;
          this.indexWiseDataSourceOne = null;
          this.dataSource.dataSourceOne.name = null;
          this.dataSource.dataSourceOne.id = null;
          this.indexWiseDataSourceTwo = null;
          this.dataSource.dataSourceTwo.name = null;
          this.dataSource.dataSourceTwo.id = null;
          this.indexWiseDataSourceFour = null;
          this.dataSource.dataSourceFour.name = null;
          this.dataSource.dataSourceFour.id = null;
          this.indexWiseDataSourceThree = null;
          this.dataSource.dataSourceThree.name = null;
          this.dataSource.dataSourceThree.id = null;
          this.indexWiseDataSourceFive = null;
          this.dataSource.dataSourceFive.name = null;
          this.dataSource.dataSourceFive.id = null;
          this.indexWiseDataSourceSix = null;
          this.dataSource.dataSourceSix.name = null;
          this.dataSource.dataSourceSix.id = null;
          this.indexWiseDataSourceSeven = null;
          this.dataSource.dataSourceSeven.name = null;
          this.dataSource.dataSourceSeven.id = null;
          this.indexWiseDataSourceEight = null;
          this.dataSource.dataSourceEight.name = null;
          this.dataSource.dataSourceEight.id = null;
          this.indexWiseDataSourceNine = null;
          this.dataSource.dataSourceNine.name = null;
          this.dataSource.dataSourceNine.id = null;
          this.indexWiseDataSourceTen = null;
          this.dataSource.dataSourceTen.name = null;
          this.dataSource.dataSourceTen.id = null;
          this.changeDef.detectChanges();
          for (let i = 0; i < this.DataSources.length; i++) {
            if (i === 0) {
              this.indexWiseDataSourceOne = this.DataSources[i].id;
              this.dataSource.dataSourceOne.name = this.DataSources[i].datasourceVo.name;
              this.dataSource.dataSourceOne.id = this.DataSources[i].datasourceVo.id;
              this.dataSource.dataSourceOne.manualMark = this.DataSources[i].datasourceVo.manualMark;
            } else if (i === 1) {
              this.indexWiseDataSourceTwo = this.DataSources[i].id;
              this.dataSource.dataSourceTwo.name = this.DataSources[i].datasourceVo.name;
              this.dataSource.dataSourceTwo.id = this.DataSources[i].datasourceVo.id;
              this.dataSource.dataSourceTwo.manualMark = this.DataSources[i].datasourceVo.manualMark;
            } else if (i === 2) {
              this.indexWiseDataSourceThree = this.DataSources[i].id;
              this.dataSource.dataSourceThree.name = this.DataSources[i].datasourceVo.name;
              this.dataSource.dataSourceThree.id = this.DataSources[i].datasourceVo.id;
              this.dataSource.dataSourceThree.manualMark = this.DataSources[i].datasourceVo.manualMark;
            } else if (i === 3) {
              this.indexWiseDataSourceFour = this.DataSources[i].id;
              this.dataSource.dataSourceFour.name = this.DataSources[i].datasourceVo.name;
              this.dataSource.dataSourceFour.id = this.DataSources[i].datasourceVo.id;
              this.dataSource.dataSourceFour.manualMark = this.DataSources[i].datasourceVo.manualMark;
            } else if (i === 4) {
              this.indexWiseDataSourceFive = this.DataSources[i].id;
              this.dataSource.dataSourceFive.name = this.DataSources[i].datasourceVo.name;
              this.dataSource.dataSourceFive.id = this.DataSources[i].datasourceVo.id;
              this.dataSource.dataSourceFive.manualMark = this.DataSources[i].datasourceVo.manualMark;
            } else if (i === 5) {
              this.indexWiseDataSourceSix = this.DataSources[i].id;
              this.dataSource.dataSourceSix.name = this.DataSources[i].datasourceVo.name;
              this.dataSource.dataSourceSix.id = this.DataSources[i].datasourceVo.id;
              this.dataSource.dataSourceSix.manualMark = this.DataSources[i].datasourceVo.manualMark;
            } else if (i === 6) {
              this.indexWiseDataSourceSeven = this.DataSources[i].id;
              this.dataSource.dataSourceSeven.name = this.DataSources[i].datasourceVo.name;
              this.dataSource.dataSourceSeven.id = this.DataSources[i].datasourceVo.id;
              this.dataSource.dataSourceSeven.manualMark = this.DataSources[i].datasourceVo.manualMark;
            } else if (i === 7) {
              this.indexWiseDataSourceEight = this.DataSources[i].id;
              this.dataSource.dataSourceEight.name = this.DataSources[i].datasourceVo.name;
              this.dataSource.dataSourceEight.id = this.DataSources[i].datasourceVo.id;
              this.dataSource.dataSourceEight.manualMark = this.DataSources[i].datasourceVo.manualMark;
            } else if (i === 8) {
              this.indexWiseDataSourceNine = this.DataSources[i].id;
              this.dataSource.dataSourceNine.name = this.DataSources[i].datasourceVo.name;
              this.dataSource.dataSourceNine.id = this.DataSources[i].datasourceVo.id;
              this.dataSource.dataSourceNine.manualMark = this.DataSources[i].datasourceVo.manualMark;
            } else if (i === 9) {
              this.indexWiseDataSourceTen = this.DataSources[i].id;
              this.dataSource.dataSourceTen.name = this.DataSources[i].datasourceVo.name;
              this.dataSource.dataSourceTen.id = this.DataSources[i].datasourceVo.id;
              this.dataSource.dataSourceTen.manualMark = this.DataSources[i].datasourceVo.manualMark;
            }
          }
          if (!isNullOrUndefined(this.indexWiseDataSourceOne)) {
            this.httpService.get('v1/unmatchedtransactions/' + this.indexWiseDataSourceOne, true).subscribe(
              (dataa: any) => {
                this.masterView = dataa;
                this.searchFileds = dataa.filters;
                const dataSourceDataUrlOne = 'v1/datasources/' + dataa.datasourceVo.id + '/data?reconStatus=UNRECONCILED';
                this.dtOptions[0] = Object.assign(this.dateTableService.getBasicTable(dataSourceDataUrlOne, this.getColumnsDefinition())
                  , {
                    rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                      const self = this;
                      $('td', row).unbind('click');
                      $('td', row).bind('click', () => {
                        self.onDetailButtonSelect(rowData);
                      });
                      $('table th div').unbind('click');
                      $('table th div').bind('click', () => {
                        self.onDetailButtonSelect(rowData);
                      });

                      $('td', row).on('click', 'a#ticketDetailBtn', function () {
                        const ticketId = jQuery(this).data('id');
                        self.showTicketDetails(ticketId);
                      });
                      return row;
                    },
                  });
                if (!isNullOrUndefined(this.indexWiseDataSourceTwo)) {
                  this.httpService.get('v1/unmatchedtransactions/' + this.indexWiseDataSourceTwo, true).subscribe(
                    (dataaa: any) => {
                      this.masterViewTwo = dataaa;
                      this.searchFiledsTwo = dataaa.filters;
                      const dataSourceDataUrlTwo = 'v1/datasources/' + dataaa.datasourceVo.id + '/data?reconStatus=UNRECONCILED';
                      this.dtOptions[1] = Object.assign(this.dateTableService.getBasicTable(dataSourceDataUrlTwo, this.getColumnsDefinitionTwo())
                        , {
                          rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                            const self = this;
                            $('td', row).unbind('click');
                            $('td', row).bind('click', () => {
                              self.onDetailButtonSelect(rowData);
                            });
                            $('table th div').unbind('click');
                            $('table th div').bind('click', () => {
                              self.onDetailButtonSelect(rowData);
                            });
                            $('td', row).on('click', 'a#ticketDetailBtn', function () {
                              const ticketId = jQuery(this).data('id');
                              self.showTicketDetails(ticketId);
                            });
                            return row;
                          },
                        });
                      this.twoWayRecon = true;
                      if (!isNullOrUndefined(this.indexWiseDataSourceThree)) {
                        this.httpService.get('v1/unmatchedtransactions/' + this.indexWiseDataSourceThree, true).subscribe(
                          (dataaaa: any) => {
                            this.masterViewThree = dataaaa;
                            this.searchFiledsThree = dataaaa.filters;
                            const dataSourceDataUrlThree = 'v1/datasources/' + dataaaa.datasourceVo.id + '/data?reconStatus=UNRECONCILED';
                            this.dtOptions[2] = Object.assign(this.dateTableService.getBasicTable(dataSourceDataUrlThree, this.getColumnsDefinitionThree())
                              , {
                                rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                                  const self = this;
                                  $('td', row).unbind('click');
                                  $('td', row).bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('table th div').unbind('click');
                                  $('table th div').bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('td', row).on('click', 'a#ticketDetailBtn', function () {
                                    const ticketId = jQuery(this).data('id');
                                    self.showTicketDetails(ticketId);
                                  });
                                  return row;
                                },
                              });
                            this.threeWayRecon = true;
                          });
                      }
                      if (!isNullOrUndefined(this.indexWiseDataSourceFour)) {
                        this.fourWayRecon = false;
                        this.httpService.get('v1/unmatchedtransactions/' + this.indexWiseDataSourceFour, true).subscribe(
                          (dataFour: any) => {
                            this.masterViewFour = dataFour;
                            this.searchFiledsFour = dataFour.filters;
                            const dataSourceDataUrlFour = 'v1/datasources/' + dataFour.datasourceVo.id + '/data?reconStatus=UNRECONCILED&reconId=' + this.id;
                            this.dtOptions[3] = Object.assign(this.dateTableService.getBasicTable(dataSourceDataUrlFour, this.getColumnsDefinitionFour())
                              , {
                                rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                                  const self = this;
                                  $('td', row).unbind('click');
                                  $('td', row).bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('table th div').unbind('click');
                                  $('table th div').bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('td', row).on('click', 'a#ticketDetailBtn', function () {
                                    const ticketId = jQuery(this).data('id');
                                    self.showTicketDetails(ticketId);
                                  });
                                  return row;
                                },
                              });
                            this.fourWayRecon = true;
                          });
                      }
                      if (!isNullOrUndefined(this.indexWiseDataSourceFive)) {
                        this.httpService.get('v1/unmatchedtransactions/' + this.indexWiseDataSourceFive, true).subscribe(
                          (dataaaaa: any) => {
                            this.masterViewFive = dataaaaa;
                            this.searchFiledsFive = dataaaaa.filters;
                            const dataSourceDataUrlFive = 'v1/datasources/' + dataaaaa.datasourceVo.id + '/data?reconStatus=UNRECONCILED';
                            this.dtOptions[4] = Object.assign(this.dateTableService.getBasicTable(dataSourceDataUrlFive, this.getColumnsDefinitionFive())
                              , {
                                rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                                  const self = this;
                                  $('td', row).unbind('click');
                                  $('td', row).bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('table th div').unbind('click');
                                  $('table th div').bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('td', row).on('click', 'a#ticketDetailBtn', function () {
                                    const ticketId = jQuery(this).data('id');
                                    self.showTicketDetails(ticketId);
                                  });
                                  return row;
                                },
                              });
                            this.fiveWayRecon = true;
                          });
                      }
                      if (!isNullOrUndefined(this.indexWiseDataSourceSix)) {
                        this.httpService.get('v1/unmatchedtransactions/' + this.indexWiseDataSourceSix, true).subscribe(
                          (dataaaaaa: any) => {
                            this.masterViewSix = dataaaaaa;
                            this.searchFiledsSix = dataaaaaa.filters;
                            const dataSourceDataUrlSix = 'v1/datasources/' + dataaaaaa.datasourceVo.id + '/data?reconStatus=UNRECONCILED';
                            this.dtOptions[5] = Object.assign(this.dateTableService.getBasicTable(dataSourceDataUrlSix, this.getColumnsDefinitionSix()
                              )
                              , {
                                rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                                  const self = this;
                                  $('td', row).unbind('click');
                                  $('td', row).bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('table th div').unbind('click');
                                  $('table th div').bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('td', row).on('click', 'a#ticketDetailBtn', function () {
                                    const ticketId = jQuery(this).data('id');
                                    self.showTicketDetails(ticketId);
                                  });
                                  return row;
                                },
                              });
                            this.sixWayRecon = true;
                          });
                      }
                      if (!isNullOrUndefined(this.indexWiseDataSourceSeven)) {
                        this.httpService.get('v1/unmatchedtransactions/' + this.indexWiseDataSourceSeven, true).subscribe(
                          (dataaaaaaa: any) => {
                            this.masterViewSeven = dataaaaaaa;
                            this.searchFiledsSeven = dataaaaaaa.filters;
                            const dataSourceDataUrlSeven = 'v1/datasources/' + dataaaaaaa.datasourceVo.id + '/data?reconStatus=UNRECONCILED';
                            this.dtOptions[6] = Object.assign(this.dateTableService.getBasicTable(dataSourceDataUrlSeven, this.getColumnsDefinitionSeven()
                              )
                              , {
                                rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                                  const self = this;
                                  $('td', row).unbind('click');
                                  $('td', row).bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('table th div').unbind('click');
                                  $('table th div').bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('td', row).on('click', 'a#ticketDetailBtn', function () {
                                    const ticketId = jQuery(this).data('id');
                                    self.showTicketDetails(ticketId);
                                  });
                                  return row;
                                },
                              });
                            this.sevenWayRecon = true;
                          });
                      }
                      if (!isNullOrUndefined(this.indexWiseDataSourceEight)) {
                        this.httpService.get('v1/unmatchedtransactions/' + this.indexWiseDataSourceEight, true).subscribe(
                          (dataaaaaaaa: any) => {
                            this.masterViewEight = dataaaaaaaa;
                            this.searchFiledsEight = dataaaaaaaa.filters;
                            const dataSourceDataUrlEight = 'v1/datasources/' + dataaaaaaaa.datasourceVo.id + '/data?reconStatus=UNRECONCILED';
                            this.dtOptions[7] = Object.assign(this.dateTableService.getBasicTable(dataSourceDataUrlEight, this.getColumnsDefinitionEight()
                              )
                              , {
                                rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                                  const self = this;
                                  $('td', row).unbind('click');
                                  $('td', row).bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('table th div').unbind('click');
                                  $('table th div').bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('td', row).on('click', 'a#ticketDetailBtn', function () {
                                    const ticketId = jQuery(this).data('id');
                                    self.showTicketDetails(ticketId);
                                  });
                                  return row;
                                },
                              });
                            this.eightWayRecon = true;
                          });
                      }
                      if (!isNullOrUndefined(this.indexWiseDataSourceNine)) {
                        this.httpService.get('v1/unmatchedtransactions/' + this.indexWiseDataSourceNine, true).subscribe(
                          (dataaaaaaaaa: any) => {
                            this.masterViewNine = dataaaaaaaaa;
                            this.searchFiledsNine = dataaaaaaaaa.filters;
                            const dataSourceDataUrlNine = 'v1/datasources/' + dataaaaaaaaa.datasourceVo.id + '/data?reconStatus=UNRECONCILED';
                            this.dtOptions[8] = Object.assign(this.dateTableService.getBasicTable(dataSourceDataUrlNine, this.getColumnsDefinitionNine()
                              )
                              , {
                                rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                                  const self = this;
                                  $('td', row).unbind('click');
                                  $('td', row).bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('table th div').unbind('click');
                                  $('table th div').bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('td', row).on('click', 'a#ticketDetailBtn', function () {
                                    const ticketId = jQuery(this).data('id');
                                    self.showTicketDetails(ticketId);
                                  });
                                  return row;
                                },
                              });
                            this.nineWayRecon = true;
                          });
                      }
                      if (!isNullOrUndefined(this.indexWiseDataSourceTen)) {
                        this.httpService.get('v1/unmatchedtransactions/' + this.indexWiseDataSourceTen, true).subscribe(
                          (dataaaaaaaaaa: any) => {
                            this.masterViewTen = dataaaaaaaaaa;
                            this.searchFiledsTen = dataaaaaaaaaa.filters;
                            const dataSourceDataUrlTen = 'v1/datasources/' + dataaaaaaaaaa.datasourceVo.id + '/data?reconStatus=UNRECONCILED';
                            this.dtOptions[9] = Object.assign(this.dateTableService.getBasicTable(dataSourceDataUrlTen, this.getColumnsDefinitionTen()
                              )
                              , {
                                rowCallback: (row: Node, rowData: any[] | Object, index: number) => {
                                  const self = this;
                                  $('td', row).unbind('click');
                                  $('td', row).bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('table th div').unbind('click');
                                  $('table th div').bind('click', () => {
                                    self.onDetailButtonSelect(rowData);
                                  });
                                  $('td', row).on('click', 'a#ticketDetailBtn', function () {
                                    const ticketId = jQuery(this).data('id');
                                    self.showTicketDetails(ticketId);
                                  });
                                  return row;
                                },
                              });
                            this.tenWayRecon = true;
                          });
                      }
                      this.showTable = true;
                    });
                }
              });
          }
        });
    });
  }

  proposedMatch(dataSourceId: number, source: string) {
    this.dataSourceForProposeMatch = source;
    this.sourceIdForProposedMatch = dataSourceId;
    if (source === this.source.DATA_SOURCE_ONE) {
      if (this.dataSourceOneArray.length === 0 || this.dataSourceOneArray.length < 0) {
        this.httpService.displayErrorOnPopUp('Select At least One Row In Source: ' + this.dataSource.dataSourceOne.name);
      } else {
        this.openProposedPopUp(dataSourceId);
      }
    } else if (source === this.source.DATA_SOURCE_TWO) {
      if (this.dataSourceTwoArray.length === 0 || this.dataSourceTwoArray.length < 0) {
        this.httpService.displayErrorOnPopUp('Select At least One Row In Source: ' + this.dataSource.dataSourceTwo.name);
      } else {
        this.openProposedPopUp(dataSourceId);
      }
    } else if (source === this.source.DATA_SOURCE_THREE) {
      if (this.dataSourceThreeArray.length === 0 || this.dataSourceThreeArray.length < 0) {
        this.httpService.displayErrorOnPopUp('Select At least One Row In Source: ' + this.dataSource.dataSourceThree.name);
      } else {
        this.openProposedPopUp(dataSourceId);
      }
    }
  }

  cancelProposedMatchPopUp() {
    this.cancleProposeMatchrequest();
    this.dataSourceOneArray = [];
    this.dataSourceTwoArray = [];
    this.dataSourceThreeArray = [];
    this.proposeMatchSelectedSOurceIds = [];
    this.sourceIdForProposedMatch = null;
    this.proposeMatchRequestId = null;
    $('#backdrop').css({'display': 'none'});
    $('#modal').css({'display': 'none'});
    // jQuery('#proposed-match-modal').modal('hide');
    this.showPopTable = false;
    this.selectedRules = [];
    this.rules = [];
  }

  openProposedPopUp(dataSourceId: number) {
    /*    const data = Object.assign({reconId: this.id, dataSourceId: dataSourceId, dataSourceOneArray: this.dataSourceOneArray,
          sourceIdForProposedMatch: this.sourceIdForProposedMatch, tableCoumnOrders: this.tableCoumnOrders, dtElements: this.dtElements});
        const dialogRef = this.dialog.open(ProposeMatchComponent, {width: '70%', height: '55%', data});
        dialogRef.afterClosed().subscribe(result => {
          this.cancel();
        });*/

    $('#backdrop').css({'display': 'block'});
    $('#modal').css({'display': 'block'});
    // jQuery('#proposed-match-modal').modal('show');
    //  let currentRules = [];
    this.httpService.get('v1/rules?Find=ByRuleGroupExecutionType&reconId=' + this.id, true).subscribe(
      (dataa: any) => {
        this.rules = dataa;
        this.httpService.get('v1/favoriteproposalRules?Find=ByUserAndDataSource&dataSource=' + dataSourceId, true).subscribe(
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

  submitFavoriteRules() {
    this.setFavoriteRulesInForm();
    this.httpService.post('v1/favoriteproposalRules', this.formFavoriteRules.value, true).subscribe(
      (data: any) => {
        this.httpService.displaySuccessOnPopUp('Rules Successfully Set !');

      }
    );
  }

  setFavoriteRulesInForm() {
    this.formFavoriteRules.removeControl('favoriteRule');
    this.formFavoriteRules.addControl('favoriteRule', new FormArray([]));
    this.formFavoriteRules.get('dataSource').patchValue({id: this.sourceIdForProposedMatch});
    if (this.selectedRules.length > 0) {
      for (const rule of this.selectedRules) {
        this.setFavoriteRuleArray(rule);
      }
    } else {
      this.setFavoriteRuleArray(null);
    }
  }

  setFavoriteRuleArray(data: any) {
    const control = new FormGroup({
      rule: new FormGroup({
        id: new FormControl(data),
      }),
    });
    (<FormArray>this.formFavoriteRules.get('favoriteRule')).push(control);
  }

  public onRuleSelect(event: any): void {
    if (event.target.checked === true) {
      this.selectedRules.push(+event.target.value);
    } else {
      for (let i = 0; i < this.selectedRules.length; i++) {
        if (+this.selectedRules[i] === +event.target.value) {
          this.selectedRules.splice(i, 1);
        }
      }
    }
  }

  onRuleSubmit() {
    this.showPopTable = false;
    if (this.selectedRules.length === 0 || this.selectedRules.length < 0) {
      this.httpService.displayErrorOnPopUp('Select At least One Rule');
    } else {
      const ids = this.getidsForProposeMatch();
      const form = {
        recon: this.id,
        dataSource: this.sourceIdForProposedMatch,
        dataIds: ids,
        proposeMatchRules: this.selectedRules
      };
      this.httpService.post('v1/proposematchrequests', form, true).subscribe(
        (data: any) => {
          if (!isNullOrUndefined(data)) {
            this.proposeMatchRequestId = data.id;
            this.subscribeToData();
          }
        }
      );
    }
  }

  private getidsForProposeMatch(): any[] {
    const ids = [];
    if (this.dataSourceForProposeMatch === Source.DATA_SOURCE_ONE) {
      for (let i = 0; i < this.dataSourceOneArray.length; i++) {
        ids.push(this.dataSourceOneArray[i].ids);
      }
    } else if (this.dataSourceForProposeMatch === Source.DATA_SOURCE_TWO) {
      for (let i = 0; i < this.dataSourceTwoArray.length; i++) {
        ids.push(this.dataSourceTwoArray[i].ids);
      }
    } else if (this.dataSourceForProposeMatch === Source.DATA_SOURCE_THREE) {
      for (let i = 0; i < this.dataSourceThreeArray.length; i++) {
        ids.push(this.dataSourceThreeArray[i].ids);
      }
    }
    return ids;
  }

  private proposeMatchRequestResult() {
    if (!isNullOrUndefined(this.proposeMatchRequestId) && !isNullOrUndefined(this.sourceIdForProposedMatch)) {
      const url = 'v1/proposematchrequests/' + this.proposeMatchRequestId + '?dataSourceId=' + this.sourceIdForProposedMatch;
      this.showPopTable = false;
      this.httpService.get('v1/unmatchedtransactions?Find=ByDataSource&dataSource=' + this.sourceIdForProposedMatch, true).subscribe(
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
                    self.onCheckBoxButtonSelect(rowData, this.sourceIdForProposedMatch);
                  });
                }
                return row;
              },
            });
          this.showPopTable = true;
        });
    }
  }

  public getJobStatus() {
    if (!isNullOrUndefined(this.proposeMatchRequestId)) {
      this.httpService.get('v1/proposematchrequests/jobStatus?id=' + this.proposeMatchRequestId, true).subscribe(
        (data: any) => {
          if (data) {
            if (this.timerSubscription) {
              this.timerSubscription.unsubscribe();
            }
            this.proposeMatchRequestResult();
            this.jobStatus = '';
          } else {
            this.jobStatus = 'Request In Processing...';
          }
        },
        (errorResponse: HttpErrorResponse) => {
        }
      );
    }
  }

  private subscribeToData(): void {
    this.timerSubscription = timer(100, 3000).subscribe(() => this.getJobStatus());
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked(): void {
    this.restriket = 0;
  }

  public refreshTable() {
    this.dataSourceOneArray = [];
    this.dataSourceTwoArray = [];
    this.dataSourceThreeArray = [];
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.draw();
      });
    });
  }

  public searchByName(name: string, searchField: string, datatableId: string) {
    let tableColumnsOrder = [];
    if (datatableId === '0' || datatableId === '00') {
      tableColumnsOrder = this.tableCoumnOrders;
    } else if (datatableId === '1' || datatableId === '11') {
      tableColumnsOrder = this.tableCoumnOrdersTwo;
    } else if (datatableId === '2' || datatableId === '22') {
      tableColumnsOrder = this.tableCoumnOrdersThree;
    } else if (datatableId === '3' || datatableId === '33') {
      tableColumnsOrder = this.tableCoumnOrdersThree;
    } else if (datatableId === '4' || datatableId === '44') {
      tableColumnsOrder = this.tableCoumnOrdersThree;
    } else if (datatableId === '5' || datatableId === '55') {
      tableColumnsOrder = this.tableCoumnOrdersThree;
    } else if (datatableId === '6' || datatableId === '66') {
      tableColumnsOrder = this.tableCoumnOrdersThree;
    } else if (datatableId === '7' || datatableId === '77') {
      tableColumnsOrder = this.tableCoumnOrdersThree;
    } else if (datatableId === '8' || datatableId === '88') {
      tableColumnsOrder = this.tableCoumnOrdersThree;
    }
    tableColumnsOrder.forEach(function (value) {
      if (value.data === searchField) {
        $('#' + datatableId).DataTable().columns(value.index + 1).search(name).draw();
      }
    });
  }

  public verifyForceMatchData(value: boolean) {
    this.forceMatchForm = {
      type: ReconDataType.RECONCILED, reconId: this.id, description: null, dataSourceOneId: null, rowOneId: null, dataSourceTwoId: null,
      rowTwoId: [], dataSourceThreeId: null, rowThreeId: []
    };
    if (this.dataSourceOneArray.length === 0) {
      if (this.dataSourceTwoArray.length === 1) {
        for (const found of this.dataSourceTwoArray) {
          this.forceMatchForm.dataSourceOneId = found.dataSourceId;
          this.forceMatchForm.rowOneId = found.ids;
        }
      } else if (this.dataSourceTwoArray.length > 1) {
        for (const found of this.dataSourceTwoArray) {
          this.forceMatchForm.dataSourceTwoId = found.dataSourceId;
          this.forceMatchForm.rowTwoId.push(found.ids);
        }
      }
    } else {
      if (this.dataSourceOneArray.length === 1) {
        for (const found of this.dataSourceOneArray) {
          this.forceMatchForm.dataSourceOneId = found.dataSourceId;
          this.forceMatchForm.rowOneId = found.ids;
        }
      } else if (this.dataSourceOneArray.length > 1) {
        if (this.forceMatchForm.rowTwoId.length === 0) {
          for (const found of this.dataSourceOneArray) {
            this.forceMatchForm.dataSourceTwoId = found.dataSourceId;
            this.forceMatchForm.rowTwoId.push(found.ids);
          }
        } else {
          for (const found of this.dataSourceOneArray) {
            this.forceMatchForm.dataSourceThreeId = found.dataSourceId;
            this.forceMatchForm.rowThreeId.push(found.ids);
          }
        }
      }
    }
    if (this.dataSourceTwoArray.length === 0 || this.dataSourceOneArray.length === 0) {
      for (const found of this.dataSourceThreeArray) {
        this.forceMatchForm.dataSourceTwoId = found.dataSourceId;
        this.forceMatchForm.rowTwoId.push(found.ids);
      }
    } else {
      if (this.dataSourceTwoArray.length === 1 && !this.forceMatchForm.rowOneId) {
        for (const found of this.dataSourceTwoArray) {
          this.forceMatchForm.dataSourceOneId = found.dataSourceId;
          this.forceMatchForm.rowOneId = found.ids;
        }
      } else if (this.dataSourceTwoArray.length === 1) {
        if (this.forceMatchForm.rowTwoId.length === 0) {
          for (const found of this.dataSourceTwoArray) {
            this.forceMatchForm.dataSourceTwoId = found.dataSourceId;
            this.forceMatchForm.rowTwoId.push(found.ids);
          }
        } else {
          for (const found of this.dataSourceTwoArray) {
            this.forceMatchForm.dataSourceThreeId = found.dataSourceId;
            this.forceMatchForm.rowThreeId.push(found.ids);
          }
        }
      } else if (this.dataSourceTwoArray.length > 1) {
        if (this.forceMatchForm.rowTwoId.length === 0) {
          for (const found of this.dataSourceTwoArray) {
            this.forceMatchForm.dataSourceTwoId = found.dataSourceId;
            this.forceMatchForm.rowTwoId.push(found.ids);
          }
        } else {

          for (const found of this.dataSourceTwoArray) {
            this.forceMatchForm.dataSourceThreeId = found.dataSourceId;
            this.forceMatchForm.rowThreeId.push(found.ids);
          }
        }
      }
    }
    if (this.dataSourceTwoArray.length !== 0 && this.dataSourceOneArray.length !== 0) {
      if (this.dataSourceThreeArray.length === 1 && !this.forceMatchForm.rowOneId) {
        for (const found of this.dataSourceThreeArray) {
          this.forceMatchForm.dataSourceOneId = found.dataSourceId;
          this.forceMatchForm.rowOneId = found.ids;
        }
      } else if (this.dataSourceThreeArray.length === 1) {
        if (this.forceMatchForm.rowTwoId.length === 0) {
          for (const found of this.dataSourceThreeArray) {
            this.forceMatchForm.dataSourceTwoId = found.dataSourceId;
            this.forceMatchForm.rowTwoId.push(found.ids);
          }
        } else {
          for (const found of this.dataSourceThreeArray) {
            this.forceMatchForm.dataSourceThreeId = found.dataSourceId;
            this.forceMatchForm.rowThreeId.push(found.ids);
          }
        }
      } else if (this.dataSourceThreeArray.length > 1) {
        if (this.forceMatchForm.rowTwoId.length === 0) {
          for (const found of this.dataSourceThreeArray) {
            this.forceMatchForm.dataSourceTwoId = found.dataSourceId;
            this.forceMatchForm.rowTwoId.push(found.ids);
          }
        } else {
          for (const found of this.dataSourceThreeArray) {
            this.forceMatchForm.dataSourceThreeId = found.dataSourceId;
            this.forceMatchForm.rowThreeId.push(found.ids);
          }
        }
      }
    }
  }

  async submitForceMatch() {
    const val = this.validation();
    if (val === true) {
      const data = this.forceMatchForm;
      const dialogRef = this.dialog.open(SubmitMultipleRowsComponent, {width: '50%', height: '40%', data});
      dialogRef.afterClosed().subscribe(result => {
        this.refreshTable();
        this.cancel();
      });
    }
  }

  private validation(): boolean {
    let val = false;
    const validate = this.verifyDataSource();
    if (validate) {
      val = true;
      val = this.verifyMultipleRows(validate);
    }
    if (val) {
      this.verifyForceMatchData(val);
    }
    return val;
  }

  private verifyDataSource(): boolean {
    let val = true;
    if ((this.dataSourceOneArray.length === 0 && this.dataSourceTwoArray.length === 0)
      || (this.dataSourceOneArray.length === 0 && this.dataSourceThreeArray.length === 0)
      || (this.dataSourceTwoArray.length === 0 && this.dataSourceThreeArray.length === 0)) {
      this.httpService.displayErrorOnPopUp('Select At least Two Data Source');
      val = false;
    }
    return val;
  }

  private verifyMultipleRows(value: boolean): boolean {
    let val = true;

    if (this.dataSourceOneArray.length > 1 && this.dataSourceTwoArray.length > 1 && this.dataSourceThreeArray.length > 1) {
      this.httpService.displayErrorOnPopUp('Select Only One Row On Any Data Source');
      val = false;
      return false;
    }
    return val;
  }

  public cancel() {
    this.ngOnInit();
  }

  public patchKnockOffData() {
    if (this.dataSourceOneArray.length > 0 && this.dataSourceTwoArray.length === 0 && this.dataSourceThreeArray.length === 0) {
      this.putDataInKnockOff(this.dataSourceOneArray);
      return false;
    } else if (this.dataSourceOneArray.length === 0 && this.dataSourceTwoArray.length > 0 && this.dataSourceThreeArray.length === 0) {
      this.putDataInKnockOff(this.dataSourceTwoArray);
      return false;
    } else if (this.dataSourceOneArray.length === 0 && this.dataSourceTwoArray.length === 0 && this.dataSourceThreeArray.length > 0) {
      this.putDataInKnockOff(this.dataSourceThreeArray);
      return false;
    } else if (this.dataSourceOneArray.length === 0 && this.dataSourceTwoArray.length === 0 && this.dataSourceThreeArray.length === 0) {
      this.httpService.displayErrorOnPopUp('Select One Data Source Row');
      return true;
    } else {
      this.httpService.displayErrorOnPopUp('Select Only One Data Source Row');
      return true;
    }
  }

  public transactionalHistory(): boolean {
    let val = false;
    if (this.dataSourceOneArray.length > 0 && this.dataSourceTwoArray.length === 0 && this.dataSourceThreeArray.length === 0) {
      val = this.checkIdShouldNotMultiple(this.dataSourceOneArray);
      return val;
    } else if (this.dataSourceOneArray.length === 0 && this.dataSourceTwoArray.length > 0 && this.dataSourceThreeArray.length === 0) {
      val = this.checkIdShouldNotMultiple(this.dataSourceTwoArray);
      return val;
    } else if (this.dataSourceOneArray.length === 0 && this.dataSourceTwoArray.length === 0 && this.dataSourceThreeArray.length > 0) {
      val = this.checkIdShouldNotMultiple(this.dataSourceThreeArray);
      return val;
    } else if (this.dataSourceOneArray.length === 0 && this.dataSourceTwoArray.length === 0 && this.dataSourceThreeArray.length === 0) {
      this.httpService.displayErrorOnPopUp('Select At least One Data Source ');
      return false;
    } else {
      this.httpService.displayErrorOnPopUp('Select Only One Data Source ');
      return false;
    }
  }

  checkIdShouldNotMultiple(dataSourceArray: any): boolean {
    if (dataSourceArray.length === 1) {
      for (const val of dataSourceArray) {
        this.historyDataId = val.ids;
        this.historyDataSourceId = val.dataSourceId;
      }
      return true;
    } else {
      this.httpService.displayErrorOnPopUp('Select Only One Row in Data Source ');
      return false;
    }
  }

  onSelectHistory() {
    const val = this.transactionalHistory();
    if (val) {
      this.httpService.get('v1/transactionhistory?mapping=' + this.historyDataId +
        '&datasource=' + this.historyDataSourceId, true).subscribe(
        (dataa: any) => {
          if (!isNullOrUndefined(dataa)) {
            const data = {data: dataa};
            const dialogRef = this.dialog.open(TimelineCharComponent, {width: '853px', height: '522px', data});
            dialogRef.afterClosed().subscribe(result => {
              this.cancel();
            });
          }
        });
    }
  }

  knockOffSubmit() {
    let val = false;
    val = this.patchKnockOffData();
    if (!val) {
      const data = this.data;
      const dialogRef = this.dialog.open(SubmitMultipleRowsComponent, {width: '50%', height: '40%', data});
      dialogRef.afterClosed().subscribe(result => {
        this.cancel();
        this.refreshTable();
      });
    }
  }

  private putDataInKnockOff(dataSource: any[]) {
    const rowData = [];
    let sourceId = null;
    for (const val of dataSource) {
      rowData.push({ids: val.ids});
      sourceId = val.dataSourceId;
    }
    this.data = {reconId: this.id, rowId: rowData, dataSourceId: sourceId, type: ReconDataType.KNOCK_OFF};
  }

  private getProposeMatchColumnsDefinition(tableView): any[] {
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

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    this.masterView.tableColumns.forEach((item, index) => {
      this.restriket = this.restriket + 1;
      this.tableCoumnOrders.push({index: index, title: item.label, data: item.fieldName, bSortable: item.sorter});
      if (this.restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2,
          checkboxes: {
            selectRow: true,
            selectAllRender: '<div class="checkbox"><input type="checkbox" class="dt-checkboxes"><label></label></div>'
          }
        });
      }
      if (item.dataType === DataType.DATE) {
        columns.push({
          title: item.label, data: item.fieldName, render: (data, type, full) => {
            return data; // isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
          }
        });
      } else if (item.fieldName === 'TICKET_ID') {
        columns.push({
          title: item.label, data: item.fieldName, bSortable: false, render: (data, type, full) => {
            if (data) {
              const html = '<a id ="ticketDetailBtn" class="ticket-detail-btn" data-id="' + data + '" href="javascript:void(0);" ' +
                '> ' + data + ' </a>';
              return html;
            }
            return '';
          }
        });
      } else {
        columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
      }
    });
    return columns;
  }

  private getColumnsDefinitionTwo(): any[] {
    const columns: any [] = [];
    this.masterViewTwo.tableColumns.forEach((item, index) => {
      this.restriket = this.restriket + 1;
      this.tableCoumnOrdersTwo.push({index: index, title: item.label, data: item.fieldName, bSortable: item.sorter});
      if (this.restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2,
          checkboxes: {
            selectRow: true,
            selectAllRender: '<div class="checkbox"><input type="checkbox" class="dt-checkboxes"><label></label></div>'
          }
        });
      }
      if (item.dataType === DataType.DATE) {
        columns.push({
          title: item.label, data: item.fieldName, render: (data, type, full) => {
            return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
          }
        });
      } else if (item.fieldName === 'TICKET_ID') {
        columns.push({
          title: item.label, data: item.fieldName, bSortable: false, render: (data, type, full) => {
            if (data) {
              const html = '<a id ="ticketDetailBtn" class="ticket-detail-btn" data-id="' + data + '" href="javascript:void(0);" ' +
                '> ' + data + ' </a>';
              return html;
            }
            return '';
          }
        });
      } else {
        columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
      }
    });
    return columns;
  }

  private getColumnsDefinitionThree(): any[] {
    const columns: any [] = [];
    this.masterViewThree.tableColumns.forEach((item, index) => {
      this.restriket = this.restriket + 1;
      this.tableCoumnOrdersThree.push({index: index, title: item.label, data: item.fieldName, bSortable: item.sorter});
      if (this.restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2,
          checkboxes: {
            selectRow: true,
            selectAllRender: '<div class="checkbox"><input type="checkbox" class="dt-checkboxes"><label></label></div>'
          }
        });
      }
      if (item.dataType === DataType.DATE) {
        columns.push({
          title: item.label, data: item.fieldName, render: (data, type, full) => {
            return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
          }
        });
      } else if (item.fieldName === 'TICKET_ID') {
        columns.push({
          title: item.label, data: item.fieldName, bSortable: false, render: (data, type, full) => {
            if (data) {
              const html = '<a id ="ticketDetailBtn" class="ticket-detail-btn" data-id="' + data + '" href="javascript:void(0);" ' +
                '> ' + data + ' </a>';
              return html;
            }
            return '';
          }
        });
      } else {
        columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
      }
    });
    return columns;
  }

  private getColumnsDefinitionFive(): any[] {
    const columns: any [] = [];
    this.masterViewFive.tableColumns.forEach((item, index) => {
      this.restriket = this.restriket + 1;
      this.tableCoumnOrdersFive.push({index: index, title: item.label, data: item.fieldName, bSortable: item.sorter});
      if (this.restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2, render: (data, type, full) => {
            const html = '  <input id="check"  type="checkbox">';
            return html;
          }
        });
      }
      if (item.dataType === DataType.DATE) {
        columns.push({
          title: item.label, data: item.fieldName, render: (data, type, full) => {
            return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
          }
        });
      } else {
        columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
      }
    });
    return columns;
  }

  private getColumnsDefinitionSix(): any[] {
    const columns: any [] = [];
    this.masterViewSix.tableColumns.forEach((item, index) => {
      this.restriket = this.restriket + 1;
      this.tableCoumnOrdersSix.push({index: index, title: item.label, data: item.fieldName, bSortable: item.sorter});
      if (this.restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2, render: (data, type, full) => {
            const html = '  <input id="check"  type="checkbox">';
            return html;
          }
        });
      }
      if (item.dataType === DataType.DATE) {
        columns.push({
          title: item.label, data: item.fieldName, render: (data, type, full) => {
            return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
          }
        });
      } else {
        columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
      }
    });
    return columns;
  }

  private getColumnsDefinitionSeven(): any[] {
    const columns: any [] = [];
    this.masterViewSeven.tableColumns.forEach((item, index) => {
      this.restriket = this.restriket + 1;
      this.tableCoumnOrdersSeven.push({index: index, title: item.label, data: item.fieldName, bSortable: item.sorter});
      if (this.restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2, render: (data, type, full) => {
            const html = '  <input id="check"  type="checkbox">';
            return html;
          }
        });
      }
      if (item.dataType === DataType.DATE) {
        columns.push({
          title: item.label, data: item.fieldName, render: (data, type, full) => {
            return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
          }
        });
      } else {
        columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
      }
    });
    return columns;
  }

  private getColumnsDefinitionEight(): any[] {
    const columns: any [] = [];
    this.masterViewEight.tableColumns.forEach((item, index) => {
      this.restriket = this.restriket + 1;
      this.tableCoumnOrdersEight.push({index: index, title: item.label, data: item.fieldName, bSortable: item.sorter});
      if (this.restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2, render: (data, type, full) => {
            const html = '  <input id="check"  type="checkbox">';
            return html;
          }
        });
      }
      if (item.dataType === DataType.DATE) {
        columns.push({
          title: item.label, data: item.fieldName, render: (data, type, full) => {
            return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
          }
        });
      } else {
        columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
      }
    });
    return columns;
  }

  private getColumnsDefinitionNine(): any[] {
    const columns: any [] = [];
    this.masterViewNine.tableColumns.forEach((item, index) => {
      this.restriket = this.restriket + 1;
      this.tableCoumnOrdersNine.push({index: index, title: item.label, data: item.fieldName, bSortable: item.sorter});
      if (this.restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2, render: (data, type, full) => {
            const html = '  <input id="check"  type="checkbox">';
            return html;
          }
        });
      }
      if (item.dataType === DataType.DATE) {
        columns.push({
          title: item.label, data: item.fieldName, render: (data, type, full) => {
            return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
          }
        });
      } else {
        columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
      }
    });
    return columns;
  }

  private getColumnsDefinitionTen(): any[] {
    const columns: any [] = [];
    this.masterViewNine.tableColumns.forEach((item, index) => {
      this.restriket = this.restriket + 1;
      this.tableCoumnOrdersNine.push({index: index, title: item.label, data: item.fieldName, bSortable: item.sorter});
      if (this.restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2, render: (data, type, full) => {
            const html = '  <input id="check"  type="checkbox">';
            return html;
          }
        });
      }
      if (item.dataType === DataType.DATE) {
        columns.push({
          title: item.label, data: item.fieldName, render: (data, type, full) => {
            return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
          }
        });
      } else {
        columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
      }
    });
    return columns;
  }

  private onDetailButtonSelect(rowData: any) {
    // const rowIds = this.getParameterCaseInsensitive(rowData, 'id');
    const that = this;
    $('table').find('td').unbind('click').on('change', 'input', function () {
      const dataTableName = $(this).closest('table').attr('id');
      const status = $(this).prop('checked');
      const rowIds = Number($(this).closest('tr').find('td').eq(1).text());
      that.getData(rowIds, dataTableName, status);
    });
    $('table').find('th div').unbind('click').on('change', 'input', function () {
      const dataTableName = $(this).closest('table').attr('id');
      const status = $(this).prop('checked');
      that.getSelectedIdsTwo(dataTableName).then((resultIds: any) => {
        resultIds.forEach((item, index) => {
          that.getData(item, dataTableName, status);
        });
      });
    });
  }

  private getTableId(dataTableId: string): number {
    let tableId;
    if (dataTableId === '0' || dataTableId === '00') {
      tableId = 0;
    } else if (dataTableId === '1' || dataTableId === '11') {
      tableId = 1;
    } else {
      tableId = 2;
    }
    return tableId;
  }

  private getData(rowId: number, dataTableId: any, status: boolean) {
    const lastChar = this.getTableId(dataTableId);
    let dataSource;
    for (let dataSourceindex = 0; dataSourceindex < this.DataSources.length; dataSourceindex++) {
      dataSource = this.DataSources[dataSourceindex].datasourceVo;

      if (lastChar === 0 && lastChar === dataSourceindex) {
        let existEntity = false;
        if (isNullOrUndefined(this.dataSourceOneArray) || this.dataSourceOneArray.length === 0) {
          this.dataSourceOneArray = [{ids: rowId, dataSourceId: dataSource.id}];
        } else {
          for (let i = 0; i < this.dataSourceOneArray.length; i++) {
            const exist = this.dataSourceOneArray[i];
            if (rowId === exist.ids) {
              this.dataSourceOneArray.splice(i, 1);
              existEntity = true;
              break;
            }
          }
          if (!existEntity) {
            this.dataSourceOneArray.push({ids: rowId, dataSourceId: dataSource.id});
          }
        }
      } else if (lastChar === 1 && lastChar === dataSourceindex) {
        let existEntity = false;
        if (isNullOrUndefined(this.dataSourceTwoArray) || this.dataSourceTwoArray.length === 0) {
          this.dataSourceTwoArray = [{ids: rowId, dataSourceId: dataSource.id}];
        } else {
          for (let i = 0; i < this.dataSourceTwoArray.length; i++) {
            const exist = this.dataSourceTwoArray[i];
            if (rowId === exist.ids) {
              this.dataSourceTwoArray.splice(i, 1);
              existEntity = true;
              break;
            }
          }
          if (!existEntity) {
            this.dataSourceTwoArray.push({ids: rowId, dataSourceId: dataSource.id});
          }
        }
      } else if (lastChar === 2 && lastChar === dataSourceindex) {
        let existEntity = false;
        if (isNullOrUndefined(this.dataSourceThreeArray) || this.dataSourceThreeArray.length === 0) {
          this.dataSourceThreeArray = [{ids: rowId, dataSourceId: dataSource.id}];
        } else {
          for (let i = 0; i < this.dataSourceThreeArray.length; i++) {
            const exist = this.dataSourceThreeArray[i];
            if (rowId === exist.ids) {
              this.dataSourceThreeArray.splice(i, 1);
              existEntity = true;
              break;
            }
          }
          if (!existEntity) {
            this.dataSourceThreeArray.push({ids: rowId, dataSourceId: dataSource.id});
          }
        }
      }
    }
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
      that.dtElements.forEach((dtElement: DataTableDirective) => {
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

  submitPerposeTransToApprovalShow() {
    if (this.proposeMatchSelectedSOurceIds.length > 0) {
      jQuery('#proposeMatch-description-modal').modal('show');
    } else {
      this.httpService.displayErrorOnPopUp('Select Atleast One Row');
    }
  }

  proposeMatchDescriptionCancel() {
    jQuery('#proposeMatch-description-modal').modal('hide');
  }

  public submitPerposeTransToApproval() {
    if (this.proposeMatchRequestId) {
      const form = {
        description: this.proposeMatch.controls['description'].value,
        proposeMatchRequestId: this.proposeMatchRequestId,
        dataSourceId: this.sourceIdForProposedMatch,
        mappedRows: this.proposeMatchSelectedSOurceIds
      };
      this.httpService.post('v1/proposematchrequests/approvalrequest', form, true).subscribe(
        (data: any) => {
          this.proposeMatchSelectedSOurceIds = [];
          this.proposeMatchDescriptionCancel();
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
      );
    }
  }

  public cancleProposeMatchrequest() {
    if (this.proposeMatchRequestId) {
      this.httpService.delete('v1/proposematchrequests/' + this.proposeMatchRequestId, true).subscribe(
        (data: any) => {
          this.httpService.displaySuccessOnPopUp('Discard All Propose Match Transactions .');
          this.dtElements.forEach((dtElement: DataTableDirective) => {
            dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.ajax.reload();
            });
          });
        });
    }
  }

  getParameterCaseInsensitive(object, key) {
    return object[Object.keys(object)
      .find(k => k.toLowerCase() === key.toLowerCase())
      ];
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

  private getColumnsDefinitionFour(): any[] {
    const columns: any [] = [];
    this.masterViewFour.tableColumns.forEach((item, index) => {
      this.restriket = this.restriket + 1;
      this.tableCoumnOrdersFour.push({index: index, title: item.label, data: item.fieldName, bSortable: item.sorter});
      if (this.restriket < 2) {
        columns.push({
          title: '', data: item.fieldName, size: 2,
          checkboxes: {
            selectRow: true,
            selectAllRender: '<div class="checkbox"><input type="checkbox" class="dt-checkboxes"><label></label></div>'
          }
        });
      }
      if (item.dataType === DataType.DATE) {
        columns.push({
          title: item.label, data: item.fieldName, render: (data, type, full) => {
            return isNullOrUndefined(data) ? null : this.datePipe.transform(data, 'dd-MM-yyyy');
          }
        });
      } else if (item.fieldName === 'TICKET_ID') {
        columns.push({
          title: item.label, data: item.fieldName, bSortable: false, render: (data, type, full) => {
            if (data) {
              const html = '<a id ="ticketDetailBtn" class="ticket-detail-btn" data-id="' + data + '" href="javascript:void(0);" ' +
                '> ' + data + ' </a>';
              return html;
            }
            return '';
          }
        });
      } else {
        columns.push({title: item.label, data: item.fieldName, bSortable: item.sorter});
      }
    });
    return columns;
  }

  private showTicketDetails(id: number) {
    const data = {id: id};
    this.dialog.open(TicketHistoryComponent, {width: '800px', height: '700px', data});
  }

  private putDataInRaiseTicket(dataSource: any[]) {
    const rowData = [];
    let sourceId = null;
    for (const val of dataSource) {
      rowData.push({ids: val.ids});
      sourceId = val.dataSourceId;
    }
    this.raiseTicketData = {reconId: this.id, rowIds: rowData, dataSourceId: sourceId};
  }


  public raiseTicket(): boolean {
    if (this.dataSourceOneArray.length > 0 && this.dataSourceTwoArray.length === 0 && this.dataSourceThreeArray.length === 0) {
      this.putDataInRaiseTicket(this.dataSourceOneArray);
      return false;
    } else if (this.dataSourceOneArray.length === 0 && this.dataSourceTwoArray.length > 0 && this.dataSourceThreeArray.length === 0) {
      this.putDataInRaiseTicket(this.dataSourceTwoArray);
      return false;
    } else if (this.dataSourceOneArray.length === 0 && this.dataSourceTwoArray.length === 0 && this.dataSourceThreeArray.length > 0) {
      this.putDataInRaiseTicket(this.dataSourceThreeArray);
      return false;
    } else if (this.dataSourceOneArray.length === 0 && this.dataSourceTwoArray.length === 0 && this.dataSourceThreeArray.length === 0) {
      this.raiseTicketData = {reconId: this.id};
      return false;
    }
  }


  async getSelectedIds() {
    const ids = [];
    const data = await this.dtElements.forEach((dtElement: DataTableDirective) => {
      dtElement.dtInstance.then((dtInstance: any) => {
        const rows_selected = dtInstance.column(0).data();
        for (let index = 0; index < rows_selected.length; index++) {
          ids.push(rows_selected[index]);
        }
      });
    });
    return ids;
  }

  async getSelectedIdsForManualMark(source: Source) {
    const ids = [];
    switch (source) {
      case Source.DATA_SOURCE_ONE: {
        for (let i = 0; i < this.dataSourceOneArray.length; i++) {
          ids.push(this.dataSourceOneArray[i].ids);
        }
        break;
      }
      case Source.DATA_SOURCE_TWO: {
        for (let i = 0; i < this.dataSourceTwoArray.length; i++) {
          ids.push(this.dataSourceTwoArray[i].ids);
        }
        break;
      }
      case Source.DATA_SOURCE_THREE: {
        for (let i = 0; i < this.dataSourceThreeArray.length; i++) {
          ids.push(this.dataSourceThreeArray[i].ids);
        }
        break;
      }
      case Source.DATA_SOURCE_FOUR: {
        for (let i = 0; i < this.dataSourceFourArray.length; i++) {
          ids.push(this.dataSourceFourArray[i].ids);
        }
        break;
      }
      default: {
        break;
      }
    }
    return ids;
  }


  async getSelectedIdsTwo(check: String) {
    const ids = [];
    const data = await this.dtElements.forEach((dtElement: DataTableDirective) => {
      dtElement.dtInstance.then((dtInstance: any) => {
        if (check === dtInstance.table().node().id) {
          const rows_selected = dtInstance.column(0).data();
          for (let index = 0; index < rows_selected.length; index++) {
            ids.push(rows_selected[index]);
          }
        }
      });
    });
    return ids;
  }

  getSelectedItems(): boolean {

    const dataSourceId = $('div.custom-tabs-line').find('li.active').data('id');
    let loaded = false;
    const data = this.dtElements.forEach((dtElement: DataTableDirective) => {
      dtElement.dtInstance.then((dtInstance: any) => {
        const rows_selected = dtInstance.column(0).checkboxes.selected();
        for (let index = 0; index < rows_selected.length; index++) {
          this.getData(rows_selected[index], dataSourceId, true);
        }
        loaded = true;
      });
    });
    return loaded;
  }

  async onSelectRaiseTicket() {
    const response = await this.getSelectedItems();
    if (!response) {
      const val = this.raiseTicket();
      if (!val) {
        const data = {data: this.raiseTicketData, dataSources: this.DataSources};
        const dialogRef = this.dialog.open(RaiseTicketComponent, {width: '853px', height: '500px', data});
        dialogRef.afterClosed().subscribe(result => {
          this.cancel();
        });
      }
    }
  }

  manualMark(dataSourceId: number, source: any) {
    const trxnSelected = this.validateSingleTrxnSelection(source);
    if (!trxnSelected) {
      return;
    }

    const ids = this.getSelectedIdsForManualMark(source);
    const data = {
      reconId: this.id,
      dataSourceId: dataSourceId,
      rowIds: ids,
      type: 'TRANSACTION_MANUAL_MARKING'
    };

    const dialogRef = this.dialog.open(SubmitMultipleRowsComponent, {width: '50%', height: '40%', data});
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.refreshTable();
      }
      this.cancel();
    });
  }


  private validateSingleTrxnSelection(source: any): boolean {
    let trxnSelected = true;
    if (source === this.source.DATA_SOURCE_ONE) {
      if (this.dataSourceOneArray.length === 0 || this.dataSourceOneArray.length < 0) {
        this.httpService.displayErrorOnPopUp('Select At least One Row In Source: ' + this.dataSource.dataSourceOne.name);
        trxnSelected = false;
      }
    } else if (source === this.source.DATA_SOURCE_TWO) {
      if (this.dataSourceTwoArray.length === 0 || this.dataSourceTwoArray.length < 0) {
        this.httpService.displayErrorOnPopUp('Select At least One Row In Source: ' + this.dataSource.dataSourceTwo.name);
        trxnSelected = false;
      }
    } else if (source === this.source.DATA_SOURCE_THREE) {
      if (this.dataSourceThreeArray.length === 0 || this.dataSourceThreeArray.length < 0) {
        this.httpService.displayErrorOnPopUp('Select At least One Row In Source: ' + this.dataSource.dataSourceThree.name);
        trxnSelected = false;
      }
    } else if (source === this.source.DATA_SOURCE_FOUR) {
      if (this.dataSourceFourArray.length === 0 || this.dataSourceFourArray.length < 0) {
        this.httpService.displayErrorOnPopUp('Select At least One Row In Source: ' + this.dataSource.dataSourceFour.name);
        trxnSelected = false;
      }
    }

    return trxnSelected;
  }
}
