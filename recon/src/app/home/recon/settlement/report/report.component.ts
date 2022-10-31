import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-settlement-report',
  templateUrl: './report.component.html'
})
export class ReportComponent implements OnInit {

  public ownNtslSettleData: any = null;
  public npciNtslSettleData: any = null;
  public compareNtslSettleReport: any = null;
  public url: any = null;


  constructor(private httpService: HttpService, private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.httpService.downloadFile('v1/ntslsettlereportexec/excel').subscribe(response => {
      const blob = new Blob([response.body], {type: 'application/octet-stream'});
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    });

    this.httpService.get('v1/ntslsettlereportexec/comparereport', true).subscribe(
      (data: any) => {
        this.compareNtslSettleReport = data;
      }
    );
    this.httpService.get('v1/ntslsettlereportexec?reportType=OWN', true).subscribe(
      (data: any) => {
        this.ownNtslSettleData = data;
      }
    );
    this.httpService.get('v1/ntslsettlereportexec?reportType=NPCI', true).subscribe(
      (data: any) => {
        this.npciNtslSettleData = data;
      }
    );
  }
}
