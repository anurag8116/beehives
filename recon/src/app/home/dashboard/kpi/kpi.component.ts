import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataTableService} from '../../../shared/services/data-table-service';
import {HttpService} from '../../../shared/services/http-service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {isNullOrUndefined} from 'util';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-kpi',
  templateUrl: './kpi.component.html'
})
export class KpiComponent implements OnInit {
  @Input() public dashletId: number;
  @Input() refresh: Subject<any>;
  public kpiData = {key: '', value: null};
  public showKpi = false;
  public interval: any;
  public dashlet = {name: '', dataProvider: null, kpiValueColor: '', kpiLabel : '', kpiLabelColumn: '' , refreshType : null , refreshTime : null};
  constructor(private dateTableService: DataTableService, private httpService: HttpService, private router: Router, private  activatedRoute: ActivatedRoute, public dialog: MatDialog, public snackBar: MatSnackBar) {
  }
  ngOnInit() {
    const me = this;

    this.refresh.subscribe(v => {
      this.refreshKpi();
    });

    this.httpService.get('v1/dashlets/' + this.dashletId, true).subscribe(
      (data: any) => {
        this.dashlet = data;
        if (this.dashlet.refreshType) {
          if (this.dashlet.refreshType === 'AUTOMATIC') {
            const refreshTime = Number(this.dashlet.refreshTime) * 1000;
            if (refreshTime) {
              this.interval = setInterval(() => {
                this.getKpiData();
              }, refreshTime);
            }
          }
        }
        this.getKpiData();
      }
    );
  }

  public getKpiData(): void {
    this.showKpi = false;
      this.httpService.get('v1/datasets/' + this.dashlet.dataProvider + '/execute', true).subscribe(
        (data: any) => {
          if (!isNullOrUndefined(data.data)) {
            const kpiData = data.data[0];
            this.kpiData.key = kpiData[this.dashlet.kpiLabel];
            this.kpiData.value = kpiData[this.dashlet.kpiLabelColumn];
          }
          this.showKpi = true;
        }
      );
  }

  public refreshKpi() {
      this.getKpiData();
  }
}
