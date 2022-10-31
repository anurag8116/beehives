import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  public exportIds = [];
  public modules = [];
  public dashboards = [];
  public exportUrl = '';
  public isShown: boolean;

  constructor(private httpService: HttpService, private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.exportIds = [];
    this.exportUrl = this.genrateLocalUrl('v1/dashboards?Export=JsonFile');
    this.httpService.get('v1/modules?Find=Parents', true).subscribe(
      (data: any) => {
        this.modules = data.data;
        this.onSelectModule(this.modules[0].id);
      }
    );
  }

  onSelectModule(moduleId: number) {
    this.exportIds = [];
    this.exportUrl = this.genrateLocalUrl('v1/dashboards?Export=JsonFile');
    this.httpService.get('v1/dashboards?Find=ByModule&moduleId=' + moduleId, true).subscribe(
      (data: any) => {
        this.dashboards = data;
      }
    );
  }

  error() {
    this.httpService.displayErrorOnPopUp('Select atleast one dashboard');
  }

  updatePrivilege(event: any): void {
    this.exportIds = [];
    this.exportUrl = this.genrateLocalUrl('v1/dashboards?Export=JsonFile');
    if (event.target.checked) {
      this.exportIds.push(event.target.value);
    } else {
      if (this.exportIds.indexOf(event.target.value) !== -1) {
        this.exportIds.splice(this.exportIds.indexOf(event.target.value), 1);
      }
    }
    if (this.exportUrl.length > 0) {
      this.exportUrl = this.genrateLocalUrl('v1/dashboards?Export=JsonFile&ids=' + this.exportIds.join());
    }
    if (this.exportIds.length > 0) {
      this.isShown = true;
    } else {
      this.isShown = false;
    }
  }


  genrateLocalUrl(url: string): any {
    this.httpService.downloadFile(url).subscribe(response => {
      const blob = new Blob([response.body], {type: 'application/octet-stream'});
      return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    });
  }
}
