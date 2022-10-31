import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  public modules = [];
  public reports = [];
  public exportIds = [];
  public exportUrl = '';
  public export: boolean;
  public selectedIndex: number;

  constructor(private httpService: HttpService, private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.exportIds = [];
    this.exportUrl = this.genrateLocalUrl('v1/reports?Export=JsonFile');
    this.httpService.get('v1/modules?Find=Parents', true).subscribe(
      (data: any) => {
        this.modules = data.data;
        this.onSelectModule(this.modules[0].id);
      }
    );
    this.select(0);
  }

  select(index: number) {
    this.selectedIndex = index;
  }

  onSelectModule(moduleId: number) {
    this.exportUrl = this.genrateLocalUrl('v1/reports?Export=JsonFile');
    this.exportIds = [];
    this.httpService.get('v1/reports?get=bymodule&moduleId=' + moduleId, true).subscribe(
      (data: any) => {
        this.reports = data;
      }
    );
  }

  updatePrivilege(event: any): void {
    this.exportUrl = this.genrateLocalUrl('v1/reports?Export=JsonFile');
    if (event.target.checked) {
      this.exportIds.push(event.target.value);
    } else {
      if (this.exportIds.indexOf(event.target.value) !== -1) {
        this.exportIds.splice(this.exportIds.indexOf(event.target.value), 1);
      }
    }
    if (this.exportUrl.length > 0) {
      this.exportUrl = this.genrateLocalUrl('v1/reports?Export=JsonFile&ids=' + this.exportIds.join());
    }
    if (this.exportIds.length > 0) {
      this.export = true;
    } else {
      this.export = false;
    }
  }

  genrateLocalUrl(url: string): any {
    this.httpService.downloadFile(url).subscribe(response => {
      const blob = new Blob([response.body], {type: 'application/octet-stream'});
      return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    });
  }

}
