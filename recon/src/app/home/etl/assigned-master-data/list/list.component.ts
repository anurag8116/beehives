import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public masterDataViews: any = [];
  public  selectedIndex: number;

  constructor(private httpService: HttpService, private router: Router) {
  }

  ngOnInit() {
    this.httpService.get('v1/masterdataviews?start=0', true).subscribe(
      (data: any) => {
        this.masterDataViews = data.data;
        this.firstDataSourceSelected();
      });
    this.select(0);
  }

  public firstDataSourceSelected() {
    for (const firstRecord of this.masterDataViews) {
      const firstRecordId = firstRecord.id;
      this.showMasterDataView(firstRecordId);
      break;
    }
  }

  public showMasterDataView(id: string): void {
    this.router.navigate(['/home/etl/part', 'assigned-master-data', {outlets: {'bodyOutlet': ['form', id]}}]);
  }

  public searchMasterDataByName(id: string): void {
    this.httpService.get('v1/masterdatas?start=0&length=1000&columns[0][data]=name&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=true&columns[0][search][value]=' + id + '&columns[0][search][regex]=false', true).subscribe(
      (data: any) => {
        this.masterDataViews = data.data;
      }
    );
  }

  select(index: number) {
    this.selectedIndex = index;
  }
}
