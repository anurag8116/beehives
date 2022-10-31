import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs/Subject';
import {HttpService} from '../../../shared/services/http-service';
import {BaseChartDirective} from 'ng2-charts';
import {Chart} from 'chart.js';
import 'chartjs-plugin-annotation';
import jsPDF from 'jspdf';
import {HttpErrorResponse} from '@angular/common/http';
import {FilterModelComponent} from '../filter-model/filter-model.component';
import {MatDialog, MatSnackBar} from '@angular/material';
import {GraphModelComponent} from '../graph-model/graph-model.component';
/*import 'chartjs-plugin-labels';*/
import {DatePipe} from '@angular/common';
import 'chartjs-plugin-datalabels';

export interface GraphModelData {
  datasets: any;
  labels: any;
  options: any;
  legend: any;
  chartType: any;
  dashlet: any;
  parentObject: any;
}

export const colores: string[] = [
  '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html'
})
export class GraphComponent implements OnInit, OnDestroy {
  @ViewChild('baseChart')
  chart: BaseChartDirective;
  @Input() changing: Subject<any>;
  @Input() refresh: Subject<any>;
  @Input() changetab: Subject<any>;
  @Input() public dashletId: number;
  @Input() rangFilterValue: any;
  @Output() drillDownValue: EventEmitter<any> = new EventEmitter<any>();
  public dashlet = {
    name: '',
    dashletType: '',
    defaultDashletType: null,
    dataProvider: '',
    dashletTolerances: [],
    tableColumns: [],
    labelColumn: '',
    seriesColumn: '',
    countColumn: '',
    tooltips: [],
    refreshType: '',
    refreshTime: null
  };
  public searchFileds = [];
  public chartType: string;
  public showChart = false;
  public stacked = false;
  public isFilterViewAble = false;
  public interval: any;
  public chartBackgroundColors: any = [];
  public requestFiltersStore = new Map();
  public isComponetActive = true;
  public isShowLegend = true;
  public drillDownFilters = [];
  public currentWidth = 0;
  public chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
  };
  public togglePieChartTypes = [{
    name: 'Pie Chart',
    value: 'CHART_PIE'
  }, {
    name: 'Polar Area Chart',
    value: 'CHART_POLAR_AREA'
  }, {
    name: 'Radar Chart',
    value: 'CHART_RADAR'
  }, {
    name: 'Doughnut Chart',
    value: 'CHART_DOUGHNUT'
  }];

  public toggleBarChartTypes = [{
    name: 'Line Chart',
    value: 'CHART_LINE'
  }, {
    name: 'Bar Chart',
    value: 'CHART_BAR'
  }, {
    name: 'Horizontal Bar Chart',
    value: 'CHART_HORIZONTAL_BAR'
  }, {
    name: 'Stacked Bar Chart',
    value: 'CHART_BAR_STACKED'
  }, {
    name: 'Stacked Line Chart',
    value: 'CHART_LINE_STACKED'
  }];

  public toggleChartTypes = [{
    name: '',
    value: ''
  }];
  public annotation = {
    drawTime: 'afterDatasetsDraw',
    annotations: []
  };
  public horiChartOptions: any = {
    scaleShowVerticalLines: true,
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      position: 'right',
      display: this.isShowLegend
    },
    elements: {
      line: {
        fill: false
      }
    },
    scales: {
      xAxes: [{
        minBarLength: 10,
        beginAtZero: true,
        barThickness: 10,
        ticks: {
          callback: function (value, index, values) {

            const lookup = [
              {value: 1, symbol: ''},
              {value: 1e3, symbol: 'k'},
              {value: 1e6, symbol: 'M'},
              {value: 1e9, symbol: 'G'},
              {value: 1e12, symbol: 'T'},
              {value: 1e15, symbol: 'P'},
              {value: 1e18, symbol: 'E'}
            ];
            const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
            const item = lookup.slice().reverse().find(function (itemm) {
              return value >= itemm.value;
            });
            return item ? (value / item.value).toFixed(2).replace(rx, '$1') + item.symbol : '0';

          }
        }
      }]
    },
    layout: {
      padding: {
        left: 0,
        right: 10,
        top: 0,
        bottom: 0
      }
    },
    plugins: {
      datalabels: {
        anchor: 'right',
        align: 'right',
        clamp: true,
        rotation: 0,
        formatter: (value, context) => {
          const xLabel = context.chart.config.data.labels[context.dataIndex];
          const datasetLabel = context.dataset.label;
          const lookup = [
            {value: 1, symbol: ''},
            {value: 1e3, symbol: 'k'},
            {value: 1e6, symbol: 'M'},
            {value: 1e9, symbol: 'G'},
            {value: 1e12, symbol: 'T'},
            {value: 1e15, symbol: 'P'},
            {value: 1e18, symbol: 'E'}
          ];
          const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
          const item = lookup.slice().reverse().find(function (itemm) {
            return value >= itemm.value;
          });
          return item ? (value / item.value).toFixed(2).replace(rx, '$1') + item.symbol : '0';

        }
      }
    }
  };

  public chartOptions: any = {
    scaleShowVerticalLines: true,
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      position: 'right',
      display: this.isShowLegend
    },
    elements: {
      line: {
        fill: false
      }
    },
    scales: {
      yAxes: [{
        minBarLength: 10,
        beginAtZero: true,
        ticks: {
          callback: function (value, index, values) {

            const lookup = [
              {value: 1, symbol: ''},
              {value: 1e3, symbol: 'k'},
              {value: 1e6, symbol: 'M'},
              {value: 1e9, symbol: 'G'},
              {value: 1e12, symbol: 'T'},
              {value: 1e15, symbol: 'P'},
              {value: 1e18, symbol: 'E'}
            ];
            const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
            const item = lookup.slice().reverse().find(function (itemm) {
              return value >= itemm.value;
            });
            return item ? (value / item.value).toFixed(2).replace(rx, '$1') + item.symbol : '0';

          }
        }
      }],
      xAxes: [{
        barPercentage: 0.6,
        categoryPercentage: 0.8
      }]
    },
    animation: {
      onProgress: function (animation) {
        const sourceCanvas = this.chart.chart.canvas;
        const copyWidth = this.chart.scales['y-axis-0'].width - 10;
        const copyHeight = this.chart.scales['y-axis-0'].height + this.chart.scales['y-axis-0'].top + 10;
        const width = Math.floor(this.data.labels.length * copyWidth);
        if (width > this.width) {
          $('#' + this.chart.canvas.id).parent().parent().find('.graph-dynmic').width(width + 'px');
          $('#' + this.chart.canvas.id).parent().parent().parent().find('.canvas-outer-div').css('overflow-x', 'scroll');
          $('#' + this.chart.canvas.id).parent().parent().parent().find('.canvas-outer-div').css('overflow-y', 'hidden');
        } else {
          $('#' + this.chart.canvas.id).parent().parent().parent().find('.canvas-outer-div').css('overflow-x', 'hidden !important');
        }
      }
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 5,
        bottom: 0
      }
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'top',
        clamp: true,
        rotation: 90,
        minBarLength: 10,
        formatter: (value, context) => {
          const xLabel = context.chart.config.data.labels[context.dataIndex];
          const datasetLabel = context.dataset.label;
          const lookup = [
            {value: 1, symbol: ''},
            {value: 1e3, symbol: 'k'},
            {value: 1e6, symbol: 'M'},
            {value: 1e9, symbol: 'G'},
            {value: 1e12, symbol: 'T'},
            {value: 1e15, symbol: 'P'},
            {value: 1e18, symbol: 'E'}
          ];
          const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
          const item = lookup.slice().reverse().find(function (itemm) {
            return value >= itemm.value;
          });
          return item ? (value / item.value).toFixed(2).replace(rx, '$1') + item.symbol : '0';

        },
      }
    }
  };

  public pieChartOptions: any = {
    scaleShowVerticalLines: true,
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      position: 'right',
      labels: {
        generateLabels: function (chart) {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            return data.labels.map(function (label, i) {
              const meta = chart.getDatasetMeta(0);
              const ds = data.datasets[0];
              const arc = meta.data[i];
              const custom = arc && arc.custom || {};
              const getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
              const arcOpts = chart.options.elements.arc;
              const fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
              const stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
              const bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

              let value = chart.config.data.datasets[arc._datasetIndex].data[arc._index];
              const lookup = [
                {value: 1, symbol: ''},
                {value: 1e3, symbol: 'k'},
                {value: 1e6, symbol: 'M'},
                {value: 1e9, symbol: 'G'},
                {value: 1e12, symbol: 'T'},
                {value: 1e15, symbol: 'P'},
                {value: 1e18, symbol: 'E'}
              ];
              const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
              const item = lookup.slice().reverse().find(function (itemm) {
                return value >= itemm.value;
              });
              value = item ? (value / item.value).toFixed(2).replace(rx, '$1') + item.symbol : '0';

              return {
                text: chart.config.type === 'pie' || chart.config.type === 'doughnut' ? label + '(' + value + ')' : label,
                fillStyle: fill,
                strokeStyle: stroke,
                lineWidth: bw,
                hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                index: i
              };
            });
          } else {
            return [];
          }
        }
      }
    },
    elements: {
      line: {
        fill: false
      }
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 20,
        bottom: 0
      }
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'top',
        clamp: true,
        display: false,
        rotation: 90,
        formatter: (value, context) => {
          const xLabel = context.chart.config.data.labels[context.dataIndex];
          const datasetLabel = context.dataset.label;
          return value;
        }
      }
    }
  };
  public chartOptionsWithStacked: any = {
    maintainAspectRatio: false,
    legend: {
      position: 'right',
      display: this.isShowLegend
    },
    responsive: true,
    elements: {
      line: {
        fill: false
      }
    },
    scales: {
      xAxes: [{
        minBarLength: 10,
        stacked: true
      }],
      yAxes: [{
        stacked: true,
        minBarLength: 10,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        ticks: {
          beginAtZero: true,
          callback: function (value, index, values) {

            const lookup = [
              {value: 1, symbol: ''},
              {value: 1e3, symbol: 'K'},
              {value: 1e6, symbol: 'M'},
              {value: 1e9, symbol: 'G'},
              {value: 1e12, symbol: 'T'},
              {value: 1e15, symbol: 'P'},
              {value: 1e18, symbol: 'E'}
            ];
            const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
            const item = lookup.slice().reverse().find(function (itemm) {
              return value >= itemm.value;
            });
            return item ? (value / item.value).toFixed(2).replace(rx, '$1') + item.symbol : '0';

          }
        }
      }]
    },
    animation: {
      onProgress: function (animation) {
        const sourceCanvas = this.chart.chart.canvas;
        const copyWidth = this.chart.scales['y-axis-0'].width - 10;
        const copyHeight = this.chart.scales['y-axis-0'].height + this.chart.scales['y-axis-0'].top + 10;
        const width = Math.floor(this.data.labels.length * copyWidth);
        if (width > this.width) {
          $('#' + this.chart.canvas.id).parent().parent().find('.graph-dynmic').width(width + 'px');
          $('#' + this.chart.canvas.id).parent().parent().parent().find('.canvas-outer-div').css('overflow-x', 'scroll');
          $('#' + this.chart.canvas.id).parent().parent().parent().find('.canvas-outer-div').css('overflow-y', 'hidden');
        } else {
          $('#' + this.chart.canvas.id).parent().parent().parent().find('.canvas-outer-div').css('overflow-x', 'hidden !important');
        }
      }
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 20,
        bottom: 0
      }
    },
    plugins: {
      zoomOutPercentage: 100,
      datalabels: {
        anchor: 'center',
        align: 'top',
        clamp: true,
        rotation: 0,
        formatter: (value, context) => {
          const xLabel = context.chart.config.data.labels[context.dataIndex];
          const datasetLabel = context.dataset.label;
          const lookup = [
            {value: 1, symbol: ''},
            {value: 1e3, symbol: 'k'},
            {value: 1e6, symbol: 'M'},
            {value: 1e9, symbol: 'G'},
            {value: 1e12, symbol: 'T'},
            {value: 1e15, symbol: 'P'},
            {value: 1e18, symbol: 'E'}
          ];
          const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
          const item = lookup.slice().reverse().find(function (itemm) {
            return value >= itemm.value;
          });
          return item ? (value / item.value).toFixed(2).replace(rx, '$1') + item.symbol : '0';

        }
      }
    }
  };

  public chartLabels: string[] = [];
  public chartLegend = true;
  public chartData: any[] = [];
  public height = 236;
  public parentObject;


  constructor(private httpService: HttpService, private datePipe: DatePipe, private router: Router, private  route: ActivatedRoute, public dialog: MatDialog, public snackBar: MatSnackBar) {
  }

  public chartHovered(e: any): void {
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(FilterModelComponent, {
      height: '600px',
      width: '400px',
      data: {parameters: this.searchFileds, name: this.dashlet.name, requestFiltersStore: this.requestFiltersStore}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
    const sub = dialogRef.componentInstance.onSearch.subscribe(result => {
      this.search(result);
      result.forEach((item, index) => {
        const value = {'value': item.value, 'column': item.column, 'dashletId': this.dashletId, search: true};
        this.drillDownValue.emit(value);
      });
    });
  }

  zoomChart(): void {
    const graphModelRef = this.dialog.open(GraphModelComponent, {
      height: '620px',
      width: '1240px',
      data: {
        datasets: this.chartData,
        labels: this.chartLabels,
        options: this.chartOptions,
        legend: this.chartLegend,
        chartType: this.chartType,
        dashlet: this.dashlet,
        parentObject: this.parentObject
      }
    });

    graphModelRef.afterClosed().subscribe(result => {
    });
  }

  ngOnDestroy() {
    this.isComponetActive = false;
  }

  ngOnInit() {
    const me = this;
    this.parentObject = this;
    this.drillDownFilters = [];
    this.changing.subscribe(filterDatas => {
      if (this.isComponetActive) {
        let itsForMe = false;
        let isDrillDown = false;
        const ownedFilterData = [];
        filterDatas.forEach((item, index) => {
          if (this.dashletId === item.dashletId) {
            itsForMe = true;
          }
          if (item.isDrillDown) {
            isDrillDown = true;
          }
          if (this.dashletId === item.dashletId && item.isTab) {
          } else if (this.dashletId === item.dashletId && item.value != null) {
            ownedFilterData.push({'value': item.value, 'column': item.column});
            if (isDrillDown && itsForMe) {
              let isContains = false;
              this.drillDownFilters.forEach((drillDownFilter, indexdrillDownFilter) => {
                if (drillDownFilter.column === item.column) {
                  drillDownFilter.value = item.value;
                  isContains = true;
                }
              });
              if (!isContains) {
                this.drillDownFilters.push({'value': item.value, 'column': item.column});
              }
            } else {
              this.drillDownFilters = [];
            }
          }
        });
        if (isDrillDown && itsForMe) {
          this.requestFiltersStore.forEach((value: string, key: string) => {
            let found = false;
            ownedFilterData.forEach((item, index) => {
              if (item.column === key) {
                found = true;
              }
            });
            if (!found) {
              ownedFilterData.push({'value': value, 'column': key});
            }
          });
        }
        if (itsForMe) {
          this.search(ownedFilterData);
        } else if (!isDrillDown && ownedFilterData.length === 0) {
          this.search(ownedFilterData);
        }
      }
    });
    this.changetab.subscribe(v => {
      if (this.dashletId === v.dashletId) {
        this.showChart = false;
        this.showChart = true;
        this.chartData = this.chartData.slice();
      }
    });
    this.refresh.subscribe(v => {
      /* if (this.dashlet.refreshType === 'MANUAL') {
         this.refreshGraph();
       }*/
      if (this.isComponetActive) {
        this.refreshGraph();
      }
    });
    this.httpService.get('v1/dashlets/' + this.dashletId, true).subscribe(
      (data: any) => {
        this.dashlet = data;
        if (this.dashlet.refreshType) {
          if (this.dashlet.refreshType === 'AUTOMATIC') {
            const refreshTime = Number(this.dashlet.refreshTime) * 1000;
            if (refreshTime) {
              this.interval = setInterval(() => {
                this.refreshGraph();
              }, refreshTime);
            }
          }
        }
        if (this.dashlet.defaultDashletType === 'CHART') {
          this.chartType = 'line';
          this.toggleChartTypes = this.toggleBarChartTypes;
          this.chartOptions = this.chartOptions;
        } else if (this.dashlet.defaultDashletType === 'CHART_BAR') {
          this.chartType = 'bar';
          this.chartOptions = this.chartOptions;
          this.toggleChartTypes = this.toggleBarChartTypes;
          if (!this.dashlet.seriesColumn) {
            this.chartOptions.legend.display = false;
            this.chartOptionsWithStacked.legend.display = false;
            this.horiChartOptions.legend.display = false;
            this.isShowLegend = false;
          }
        } else if (this.dashlet.defaultDashletType === 'CHART_LINE') {
          this.chartType = 'line';
          this.chartOptions = this.chartOptions;
          this.toggleChartTypes = this.toggleBarChartTypes;
          if (!this.dashlet.seriesColumn) {
            this.chartOptions.legend.display = false;
            this.chartOptionsWithStacked.legend.display = false;
            this.horiChartOptions.legend.display = false;
            this.isShowLegend = false;
          }
        } else if (this.dashlet.defaultDashletType === 'CHART_HORIZONTAL_BAR') {
          this.chartType = 'horizontalBar';
          this.chartOptions = this.horiChartOptions;
          this.toggleChartTypes = this.toggleBarChartTypes;
          if (!this.dashlet.seriesColumn) {
            this.chartOptions.legend.display = false;
            this.chartOptionsWithStacked.legend.display = false;
            this.horiChartOptions.legend.display = false;
            this.isShowLegend = false;
          }
        } else if (this.dashlet.defaultDashletType === 'CHART_RADAR') {
          this.chartType = 'radar';
          this.chartOptions = this.chartOptions;
          this.toggleChartTypes = this.togglePieChartTypes;
        } else if (this.dashlet.defaultDashletType === 'CHART_PIE') {
          this.chartType = 'pie';
          this.chartLegend = true;
          this.chartOptions = this.pieChartOptions;
          this.toggleChartTypes = this.togglePieChartTypes;
        } else if (this.dashlet.defaultDashletType === 'CHART_DOUGHNUT') {
          this.chartType = 'doughnut';
          this.chartLegend = true;
          this.chartOptions = this.pieChartOptions;
          this.toggleChartTypes = this.togglePieChartTypes;
        } else if (this.dashlet.defaultDashletType === 'CHART_POLAR_AREA') {
          this.chartType = 'polarArea';
          this.toggleChartTypes = this.togglePieChartTypes;
        } else if (this.dashlet.defaultDashletType === 'CHART_STACKED') {
          this.chartType = 'line';
          this.chartOptions = this.chartOptionsWithStacked;
          this.toggleChartTypes = this.toggleBarChartTypes;
          if (!this.dashlet.seriesColumn) {
            this.chartOptions.legend.display = false;
            this.chartOptionsWithStacked.legend.display = false;
            this.horiChartOptions.legend.display = false;
            this.isShowLegend = false;
          }
        } else if (this.dashlet.defaultDashletType === 'CHART_BAR_STACKED') {
          this.chartType = 'bar';
          this.chartOptions = this.chartOptionsWithStacked;
          this.toggleChartTypes = this.toggleBarChartTypes;
          if (!this.dashlet.seriesColumn) {
            this.chartOptions.legend.display = false;
            this.chartOptionsWithStacked.legend.display = false;
            this.horiChartOptions.legend.display = false;
            this.isShowLegend = false;
          }
        } else if (this.dashlet.defaultDashletType === 'CHART_LINE_STACKED') {
          this.chartType = 'line';
          this.chartOptions = this.chartOptionsWithStacked;
          this.toggleChartTypes = this.toggleBarChartTypes;
          if (!this.dashlet.seriesColumn) {
            this.chartOptions.legend.display = false;
            this.chartOptionsWithStacked.legend.display = false;
            this.horiChartOptions.legend.display = false;
            this.isShowLegend = false;
          }
        } else {
          this.chartType = 'line';
          this.toggleChartTypes = this.toggleBarChartTypes;
        }
        this.searchFileds = data.filters;
        let queryParams = '';
        let indexCount = 0;
        if (this.searchFileds) {
          this.searchFileds.forEach((item, index) => {
            if (item.inputType === 'CALENDER') {
              if (item.dateType === 'PAST' && this.rangFilterValue['fromDate']) {
                queryParams === '' ? queryParams += '?' : queryParams += '&';
                queryParams += 'columns[' + indexCount + '][data]=' + item.fieldName + '&columns[' + indexCount + '][name]=&columns[' + indexCount + '][searchable]=true&columns[' + indexCount + '][orderable]=true&columns[' + indexCount + '][search][value]=' + this.rangFilterValue.fromDate;
                indexCount = indexCount + 1;
                this.requestFiltersStore.set(item.fieldName, this.rangFilterValue['fromDate']);
              } else if (item.dateType === 'FUTURE' && this.rangFilterValue.toDate) {
                queryParams === '' ? queryParams += '?' : queryParams += '&';
                queryParams += 'columns[' + indexCount + '][data]=' + item.fieldName + '&columns[' + indexCount + '][name]=&columns[' + indexCount + '][searchable]=true&columns[' + indexCount + '][orderable]=true&columns[' + indexCount + '][search][value]=' + this.rangFilterValue.toDate;
                indexCount = indexCount + 1;
                this.requestFiltersStore.set(item.fieldName, this.rangFilterValue.toDate);
              }
            }

            if ((item.inputType === 'DROPDOWN' || item.inputType === 'TEXT') && item.staticValue) {
              this.requestFiltersStore.set(item.fieldName, item.staticValue);
              queryParams === '' ? queryParams += '?' : queryParams += '&';
              queryParams += 'columns[' + indexCount + '][data]=' + item.fieldName + '&columns[' + indexCount + '][name]=&columns[' + indexCount + '][searchable]=true&columns[' + indexCount + '][orderable]=true&columns[' + indexCount + '][search][value]=' + item.staticValue;
              indexCount = indexCount + 1;
            }
            if (item.inputType === 'DROPDOWN') {
              this.getLookUpProviderValue(item);
            }
          });
          this.searchFileds.length > 0 ? this.isFilterViewAble = true : this.isFilterViewAble = false;
        }
        if (this.dashlet.dashletTolerances) {
          const anotations = [];
          this.dashlet.dashletTolerances.forEach((item, index) => {
            anotations.push({
              type: 'line',
              mode: item.mode,
              scaleID: item.scale,
              value: item.value,
              borderColor: item.colorCode,
              label: {
                content: item.label,
                enabled: true,
                position: item.position
              }
            });
          });
          this.chartOptions['annotation'] = {
            drawTime: 'afterDatasetsDraw',
            annotations: anotations
          };
        }
        if (this.dashlet.tableColumns) {
          this.chartLabels = [];
          this.dashlet.tableColumns.forEach((item, index) => {
            this.chartLabels.push(item.label);
          });
        }
        const url = encodeURI('v1/datasets/' + this.dashlet.dataProvider + '/execute' + queryParams);
        this.httpService.get(url, true).subscribe(
          (response: any) => {
            this.chartBackgroundColors = [];
            const series = this.getSeries(response.data);
            const labels = this.getLabels(response.data);
            if (this.dashlet.tooltips) {
              // const tooltips = ;
              this.chartOptions['tooltips'] = {
                footerFontSize: 11,
                bodyFontSize: 11,
                footerFontFamily: 'Helvetica Neue',
                bodyFontFamily: 'Helvetica Neue',
                callbacks: {
                  footer: function (tooltipItems, dataa) {
                    return me.getTooltips(response.data);
                  }
                }
              };
            }
            series.forEach((seriesItem, seriesIndex) => {
              const modifiedData = [];
              const modifiedDataVales = [];
              const modifiedLabels = [];
              const datasets = this.getDatasets(labels);
              const backgroundColors = [];
              this.chartBackgroundColors = [];
              response.data.forEach((item, index) => {
                const color = index < colores.length ? colores[index] : this.dynamicColors();
                backgroundColors.push(color);
                const labelName = item[this.dashlet.labelColumn];
                labels.forEach((labelItem, labelIndex) => {
                  if (labelName === labelItem && seriesItem === item[this.dashlet.seriesColumn]) {
                    datasets[labelIndex] = Number(datasets[labelIndex]) + Number(item[this.dashlet.countColumn]);
                  }
                });
              });
              if (!this.isShowLegend) {
                this.chartBackgroundColors.push({backgroundColor: backgroundColors});
              }
              this.chartData.push({
                data: datasets,
                label: seriesItem,
                backgroundColor: backgroundColors,
                borderColor: this.chartColors.red,
                borderWidth: 1
              });
              this.chartLabels = labels;
            });
            this.showChart = true;
          }
        );
      }
    );
  }

  public dynamicColors() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  public search(filterDatas) {
    this.showChart = false;
    let url = 'v1/datasets/' + this.dashlet.dataProvider + '/execute?start=0';
    if (filterDatas.length === 0) {
      this.requestFiltersStore.clear();
      this.drillDownFilters = [];
    }
    let indexCount = 0;
    filterDatas.forEach((item, index) => {
      if (item.value) {
        this.requestFiltersStore.set(item.column, item.value);
        url += '&columns[' + indexCount + '][data]=' + item.column + '&columns[' + indexCount + '][name]=&columns[' + indexCount + '][searchable]=true&columns[' + indexCount + '][orderable]=true&columns[' + indexCount + '][search][value]=' + item.value;
        indexCount = indexCount + 1;
      }
    });
    this.httpService.get(encodeURI(url), true).subscribe(
      (response: any) => {
        if (response) {
          this.chartData = [];
          this.chartBackgroundColors = [];
          const series = this.getSeries(response.data);
          const labels = this.getLabels(response.data);
          series.forEach((seriesItem, seriesIndex) => {
            const modifiedData = [];
            const modifiedDataVales = [];
            const modifiedLabels = [];
            const backgroundColors = [];
            this.chartBackgroundColors = [];
            const datasets = this.getDatasets(labels);
            response.data.forEach((item, index) => {
              const color = index < colores.length ? colores[index] : this.dynamicColors();
              backgroundColors.push(color);
              const monthName = item[this.dashlet.labelColumn];
              labels.forEach((labelItem, labelIndex) => {
                if (monthName === labelItem && seriesItem === item[this.dashlet.seriesColumn]) {
                  datasets[labelIndex] = Number(datasets[labelIndex]) + Number(item[this.dashlet.countColumn]);
                }
              });
            });
            if (!this.isShowLegend) {
              this.chartBackgroundColors.push({backgroundColor: backgroundColors});
            }
            this.chartData.push({data: datasets, label: seriesItem, borderColor: this.chartColors.red, borderWidth: 1});
            this.chartLabels = labels;
          });
          this.showChart = true;
        } else {
          this.chartLabels = [];
          this.chartData = [];
          this.showChart = true;
        }

      }
    );
  }

  private getSeries(result: any) {
    const seriesData = [];
    result.forEach((item, index) => {
      const seriesName = item[this.dashlet.seriesColumn];
      let seriesFound = false;
      seriesData.forEach((seriesItem, seriesIndex) => {
        if (seriesName === seriesItem) {
          seriesFound = true;
        }
      });
      if (!seriesFound) {
        seriesData.push(item[this.dashlet.seriesColumn]);
      }

    });
    return seriesData;
  }

  private getLabels(result: any) {
    const labels = [];
    result.forEach((item, index) => {
      const label = item[this.dashlet.labelColumn];
      let labelFound = false;
      labels.forEach((labelItem, labelIndex) => {
        if (label === labelItem) {
          labelFound = true;
        }
      });
      if (!labelFound) {
        labels.push(item[this.dashlet.labelColumn]);
      }

    });
    return labels;
  }

  private getTooltips(result: any) {
    const tooltips = [];
    result.forEach((item, index) => {
      this.dashlet.tooltips.forEach((tooltip, tooltipIndex) => {
        const tooltipValue = item[tooltip.fieldName];
        tooltips.push(tooltip.label + ' : ' + tooltipValue);
      });

    });
    return tooltips;
  }

  private getDatasets(result: any) {
    const datasets = [];
    result.forEach((item, index) => {
      datasets.push(0);
    });
    return datasets;
  }

  private getLookUpProviderValue(item) {
    this.httpService.get('v1/lookupproviders/' + item.lookUpProvider + '/execute', true).subscribe(
      (lookUpProviderData: any) => {
        item['lookUpProviders'] = lookUpProviderData.data;
      }
    );
  }

  public chartClicked(e: any): void {
    if (e.active.length > 0) {
      if (e.active[0]._chart.config.data.datasets[1]) {
      }
      const label = e.active[0]._chart.config.data.labels[e.active[0]._index];
      const value = {'value': label, 'column': this.dashlet.labelColumn, 'dashletId': this.dashletId};
      this.drillDownValue.emit(value);
    }
  }

  public tonggleGraph(type: any) {
    if (type) {
      this.showChart = false;
      if (type === 'CHART_STACKED') {
        this.chartOptions = this.chartOptionsWithStacked;
      } else {
        if (type === 'CHART_BAR') {
          this.chart.chartType = 'bar';
          this.chartType = 'bar';
          this.chartOptions = this.chartOptions;
          this.toggleChartTypes = this.toggleBarChartTypes;
        } else if (type === 'CHART_LINE') {
          this.chart.chartType = 'line';
          this.chartType = 'line';
          this.chartOptions = this.chartOptions;
          this.toggleChartTypes = this.toggleBarChartTypes;
        } else if (type === 'CHART_HORIZONTAL_BAR') {
          this.chart.chartType = 'horizontalBar';
          this.chartType = 'horizontalBar';
          this.chartOptions = this.horiChartOptions;
          this.toggleChartTypes = this.toggleBarChartTypes;
        } else if (type === 'CHART_RADAR') {
          this.chart.chartType = 'radar';
          this.chartType = 'radar';
          this.chartOptions = this.chartOptions;
          this.toggleChartTypes = this.togglePieChartTypes;
        } else if (type === 'CHART_PIE') {
          this.chart.chartType = 'pie';
          this.chartType = 'pie';
          this.chartOptions = this.pieChartOptions;
          this.toggleChartTypes = this.togglePieChartTypes;
        } else if (type === 'CHART_DOUGHNUT') {
          this.chart.chartType = 'doughnut';
          this.chartOptions = this.pieChartOptions;
          this.toggleChartTypes = this.togglePieChartTypes;
          this.chartType = 'doughnut';
        } else if (type === 'CHART_POLAR_AREA') {
          this.chart.chartType = 'polarArea';
          this.chartType = 'polarArea';
          this.chartOptions = this.chartOptions;
          this.toggleChartTypes = this.togglePieChartTypes;
        } else if (type === 'CHART_LINE_STACKED') {
          this.chartOptions = this.chartOptionsWithStacked;
          this.chart.chartType = 'line';
          this.chartType = 'line';
          this.toggleChartTypes = this.toggleBarChartTypes;
        } else if (type === 'CHART_BAR_STACKED') {
          this.chartOptions = this.chartOptionsWithStacked;
          this.chart.chartType = 'bar';
          this.chartType = 'bar';
          this.toggleChartTypes = this.toggleBarChartTypes;
        } else {
          this.chart.chartType = 'line';
          this.chartType = 'line';
          this.chartOptions = this.chartOptions;
          this.toggleChartTypes = this.toggleBarChartTypes;
        }
        this.chartOptions = this.chartOptions;
      }
    }
    this.chart.ngOnDestroy();
    this.chart.chart = this.chart.getChartBuilder(this.chart.ctx);
    this.chart.chart.update();

    this.showChart = true;
  }

  public downloadAsPdf(type: String, link) {
    if (type === 'PDF') {
      const cnavasId = 'dashlet-chart-' + this.dashletId;
      const fileName = this.dashlet.name + new Date() + '.pdf';
      const elementToPrint = <HTMLCanvasElement> document.getElementById(cnavasId);
      const newCanvas = elementToPrint.toDataURL('image/png', 1.0);
      const doc = new jsPDF('landscape');
      const totalPagesExp = '{total_pages_count_string}';
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }
      doc.page = 1;
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.setFontStyle('normal');
      const logo = <HTMLImageElement> document.getElementById('brand_logo');
      if (logo) {
        doc.addImage(logo, 'JPEG', 15, 5, 40, 15);
      }
      doc.text(60, 15, this.dashlet.name);
      doc.line(0, 20, width, 20);
      doc.addImage(newCanvas, 'PNG', 50, 20, width / 2, height / 2);
      // Footer
      let str = 'Page ' + doc.internal.getNumberOfPages();
      // Total page number plugin only available in jspdf v1.0+
      if (typeof doc.putTotalPages === 'function') {
        str = str + ' of ' + doc.page;
      }
      doc.setFontSize(10);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(str, 15, pageHeight - 10);
      const footerSignature = 'Generated By BEE Recon on ' + this.datePipe.transform(new Date(), 'dd-MM-yyyy h:mm a');
      doc.text(footerSignature, 205, pageHeight - 10);
      doc.save(fileName);
    } else if (type === 'IMAGE') {
      const cnavasId = 'dashlet-chart-' + this.dashletId;
      const elementToPrint = <HTMLCanvasElement> document.getElementById(cnavasId);
      const height = elementToPrint.height + 60;
      const width = elementToPrint.width + 50;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.rect(0, 0, width, height);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.font = '20px Arial';
      ctx.fillStyle = 'black';
      const logo = <HTMLImageElement> document.getElementById('brand_logo');
      ctx.drawImage(logo, 20, 0);
      ctx.fillText(this.dashlet.name, 30 + logo.width, 30);
      ctx.moveTo(0, 40);
      ctx.lineTo(width, 42);
      ctx.stroke();
      ctx.drawImage(elementToPrint, 20, 40);
      ctx.font = '12px Arial';
      const footerSignature = 'Generated By BEE Recon on ' + this.datePipe.transform(new Date(), 'dd-MM-yyyy h:mm a');
      ctx.fillText(footerSignature, width / 1.6, height - 20);
      const imageUrl = canvas.toDataURL('image/jpeg', 1.0);
      const myLink = link.target;
      myLink.src = imageUrl;
      const fileName = this.dashlet.name + new Date() + '.jpeg';
      myLink.download = fileName;
      myLink.href = imageUrl;
    }
  }

  /*  public activeChart(selectedDashlet: any) {
        const ctx = this.chart.ctx;
      const chart = this.chart;
      const myChart = new Chart(ctx, chart);
      myChart.resize();
    }*/

  public refreshGraph() {
    this.showChart = false;
    const me = this;
    this.httpService.get('v1/dashlets/' + this.dashletId, true).subscribe(
      (data: any) => {
        this.dashlet = data;
        if (!this.dashlet.seriesColumn) {
          this.chartOptions.legend.display = false;
          this.chartOptionsWithStacked.legend.display = false;
          this.horiChartOptions.legend.display = false;
          this.isShowLegend = false;
        }
        if (this.dashlet.defaultDashletType === 'CHART') {
          this.chartType = 'line';
          this.toggleChartTypes = this.toggleBarChartTypes;
          this.chartOptions = this.chartOptions;
        } else if (this.dashlet.defaultDashletType === 'CHART_BAR') {
          this.chartType = 'bar';
          this.chartOptions = this.chartOptions;
          this.toggleChartTypes = this.toggleBarChartTypes;
          if (!this.dashlet.seriesColumn) {
            this.chartOptions.legend.display = false;
            this.chartOptionsWithStacked.legend.display = false;
            this.horiChartOptions.legend.display = false;
            this.isShowLegend = false;
          }
        } else if (this.dashlet.defaultDashletType === 'CHART_LINE') {
          this.chartType = 'line';
          this.chartOptions = this.chartOptions;
          this.toggleChartTypes = this.toggleBarChartTypes;
          if (!this.dashlet.seriesColumn) {
            this.chartOptions.legend.display = false;
            this.chartOptionsWithStacked.legend.display = false;
            this.horiChartOptions.legend.display = false;
            this.isShowLegend = false;
          }
        } else if (this.dashlet.defaultDashletType === 'CHART_HORIZONTAL_BAR') {
          this.chartType = 'horizontalBar';
          this.chartOptions = this.horiChartOptions;
          this.toggleChartTypes = this.toggleBarChartTypes;
          if (!this.dashlet.seriesColumn) {
            this.chartOptions.legend.display = false;
            this.chartOptionsWithStacked.legend.display = false;
            this.horiChartOptions.legend.display = false;
            this.isShowLegend = false;
          }
        } else if (this.dashlet.defaultDashletType === 'CHART_RADAR') {
          this.chartType = 'radar';
          this.chartOptions = this.chartOptions;
          this.toggleChartTypes = this.togglePieChartTypes;
        } else if (this.dashlet.defaultDashletType === 'CHART_PIE') {
          this.chartType = 'pie';
          this.chartLegend = true;
          this.chartOptions = this.pieChartOptions;
          this.toggleChartTypes = this.togglePieChartTypes;
        } else if (this.dashlet.defaultDashletType === 'CHART_DOUGHNUT') {
          this.chartType = 'doughnut';
          this.chartLegend = true;
          this.chartOptions = this.pieChartOptions;
          this.toggleChartTypes = this.togglePieChartTypes;
        } else if (this.dashlet.defaultDashletType === 'CHART_POLAR_AREA') {
          this.chartType = 'polarArea';
          this.toggleChartTypes = this.togglePieChartTypes;
        } else if (this.dashlet.defaultDashletType === 'CHART_STACKED') {
          this.chartType = 'line';
          this.chartOptions = this.chartOptionsWithStacked;
          this.toggleChartTypes = this.toggleBarChartTypes;
          if (!this.dashlet.seriesColumn) {
            this.chartOptions.legend.display = false;
            this.chartOptionsWithStacked.legend.display = false;
            this.horiChartOptions.legend.display = false;
            this.isShowLegend = false;
          }
        } else if (this.dashlet.defaultDashletType === 'CHART_BAR_STACKED') {
          this.chartType = 'bar';
          this.chartOptions = this.chartOptionsWithStacked;
          this.toggleChartTypes = this.toggleBarChartTypes;
          if (!this.dashlet.seriesColumn) {
            this.chartOptions.legend.display = false;
            this.chartOptionsWithStacked.legend.display = false;
            this.horiChartOptions.legend.display = false;
            this.isShowLegend = false;
          }
        } else if (this.dashlet.defaultDashletType === 'CHART_LINE_STACKED') {
          this.chartType = 'line';
          this.chartOptions = this.chartOptionsWithStacked;
          this.toggleChartTypes = this.toggleBarChartTypes;
          if (!this.dashlet.seriesColumn) {
            this.chartOptions.legend.display = false;
            this.chartOptionsWithStacked.legend.display = false;
            this.horiChartOptions.legend.display = false;
            this.isShowLegend = false;
          }
        } else {
          this.chartType = 'line';
          this.toggleChartTypes = this.toggleBarChartTypes;
        }
        this.searchFileds = data.filters;
        if (this.searchFileds) {
          this.searchFileds.forEach((item, index) => {
            if (item.inputType === 'DROPDOWN') {
              this.getLookUpProviderValue(item);
            }
          });
          this.searchFileds.length > 0 ? this.isFilterViewAble = true : this.isFilterViewAble = false;
        }
        if (this.dashlet.dashletTolerances) {
          const anotations = [];
          this.dashlet.dashletTolerances.forEach((item, index) => {
            anotations.push({
              type: 'line',
              mode: item.mode,
              scaleID: item.scale,
              value: item.value,
              borderColor: item.colorCode,
              label: {
                content: item.label,
                enabled: true,
                position: item.position
              }
            });
          });
          this.chartOptions['annotation'] = {
            drawTime: 'afterDatasetsDraw',
            annotations: anotations
          };
        }
        if (this.dashlet.tableColumns) {
          this.chartLabels = [];
          this.dashlet.tableColumns.forEach((item, index) => {
            this.chartLabels.push(item.label);
          });
        }
        me.chartLabels = [];
        me.chartData = [];
        let url = 'v1/datasets/' + this.dashlet.dataProvider + '/execute?start=0';
        let indexCount = 0;
        this.requestFiltersStore.forEach((value: string, key: string) => {
          url += '&columns[' + indexCount + '][data]=' + key + '&columns[' + indexCount + '][name]=&columns[' + indexCount + '][searchable]=true&columns[' + indexCount + '][orderable]=true&columns[' + indexCount + '][search][value]=' + value;
          indexCount = indexCount + 1;
        });
        this.httpService.get(encodeURI(url), true).subscribe(
          (response: any) => {
            this.chartData = [];
            this.chartBackgroundColors = [];
            const series = this.getSeries(response.data);
            const labels = this.getLabels(response.data);
            if (this.dashlet.tooltips) {
              // const tooltips = ;
              this.chartOptions['tooltips'] = {
                footerFontSize: 11,
                bodyFontSize: 11,
                footerFontFamily: 'Helvetica Neue',
                bodyFontFamily: 'Helvetica Neue',
                callbacks: {
                  footer: function (tooltipItems, dataa) {
                    return me.getTooltips(response.data);
                  }
                }
              };
            }
            series.forEach((seriesItem, seriesIndex) => {
              const modifiedData = [];
              const modifiedDataVales = [];
              const modifiedLabels = [];
              const backgroundColors = [];
              this.chartBackgroundColors = [];
              const datasets = this.getDatasets(labels);
              response.data.forEach((item, index) => {
                const color = index < colores.length ? colores[index] : this.dynamicColors();
                backgroundColors.push(color);
                const labelName = item[this.dashlet.labelColumn];
                labels.forEach((labelItem, labelIndex) => {
                  if (labelName === labelItem && seriesItem === item[this.dashlet.seriesColumn]) {
                    datasets[labelIndex] = Number(datasets[labelIndex]) + Number(item[this.dashlet.countColumn]);
                  }
                });
              });
              if (!this.isShowLegend) {
                this.chartBackgroundColors.push({backgroundColor: backgroundColors});
              }
              this.chartData.push({data: datasets, label: seriesItem, borderColor: this.chartColors.red, borderWidth: 1});
              this.chartLabels = labels;
            });
            this.showChart = true;
            console.log('Show chart ', this.showChart);
          }
        );
      }
    );
  }

  public nFormatter(num, digits) {
    const lookup = [
      {value: 1, symbol: ''},
      {value: 1e3, symbol: 'k'},
      {value: 1e6, symbol: 'M'},
      {value: 1e9, symbol: 'G'},
      {value: 1e12, symbol: 'T'},
      {value: 1e15, symbol: 'P'},
      {value: 1e18, symbol: 'E'}
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup.slice().reverse().find(function (itemm) {
      return num >= itemm.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
  }
}
