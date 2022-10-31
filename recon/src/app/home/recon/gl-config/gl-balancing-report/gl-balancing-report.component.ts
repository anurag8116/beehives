import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {AppConstants} from '../../../../shared/services/app.constants';
import {BsDatepickerConfig} from 'ngx-bootstrap';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup} from '@angular/forms';
import {ServiceConstant} from '../../../../shared/services/service-constant';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-gl-balancing-report',
  templateUrl: './gl-balancing-report.component.html'
})
export class GlBalancingReportComponent implements OnInit {

  public reportData: any = {creditEntries: [], debitEntries: []};
  public bsConfig: Partial<BsDatepickerConfig> = AppConstants.getDatePickerConfig();
  public glBalanceConfigs: any = [];
  public segregateReport: any = [];
  private type: string;
  private configId: number;
  public date: string;
  public form: FormGroup;
  public url: any = null;
  private reportType: any = 'Segregated';

  constructor(private httpService: HttpService, private router: Router, private activeRoute: ActivatedRoute, private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      'glName': new FormControl(null),
      'glDate': new FormControl(null),
    });
    this.activeRoute.queryParams.subscribe(params => {
      this.type = params['type'];
      this.configId = +params['configId'];
      this.date = params['date'];
      this.reportType = params['tab'];
      this.form.get('glName').patchValue(this.configId);
      this.form.get('glDate').patchValue(this.date);
      this.getReport(this.configId, this.date);
    });
    this.httpService.get('v1/glconfigrations', true).subscribe(
      (data: any) => {
        this.glBalanceConfigs = data.data;
      }
    );
  }

  selectReport(report: string) {
    this.reportType = report;
    let reportUrl = 'v1/glbalancingexecutions/downloads?reportType=Consolidated&glConfigId=' + this.configId + '&date=' + this.date;
    if (this.reportType === 'Segregated') {
      reportUrl = 'v1/glbalancingexecutions/downloads?reportType=Segregated&glConfigId=' + this.configId + '&date=' + this.date;
    }
    this.httpService.downloadFile(reportUrl).subscribe(response => {
      const blob = new Blob([response.body], {type: 'application/octet-stream'});
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    });
  }

  getReport(configId: number, date) {
    if (configId && date) {
      this.configId = configId;
      this.date = date;
      this.httpService.get('v1/glbalancingexecutions/report?glConfigId=' + configId + '&date=' + date, true).subscribe(
        (data: any) => {
          this.reportData = data;
          this.setReportDataForConsolidate(data);
        }
      );
    }
  }

  setReportDataForConsolidate(data: any) {
    const report = [];
    this.segregateReport = [];
    for (let i = 0; i < data.creditEntries.length; i++) {
      report.push(data.creditEntries[i]);
    }
    for (let i = 0; i < data.debitEntries.length; i++) {
      report.push(data.debitEntries[i]);
    }
    report.sort(function (a, b) {
      return a.id - b.id;
    });
    for (let i = 0; i < report.length; i++) {
      this.segregateReport.push(report[i]);
    }
  }

  glConfigDetails(glConfigId: number, tab: string) {
    this.router.navigate(['/home/recon', 'gl-config', {
      outlets: {
        'fullBodyOutlet':
          ['gl-detail']
      }
    }], {queryParams: {id: glConfigId, type: this.type, configId: this.configId, date: this.date, tab: tab}});
  }

  ExportTOExcel() {
    const url = ServiceConstant.URL + 'v1/reportexecutions/downloads?glConfigId=' + this.configId + '&date=' + this.date;
  }
}
