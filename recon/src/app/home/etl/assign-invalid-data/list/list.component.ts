import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';
import {MenuService} from '../../../../shared/menu.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public invalidDataViews: any = [];
  public  selectedIndex: number;

  constructor(private dateTableService: DataTableService, private httpService: HttpService,
              private menuService: MenuService, private router: Router) {
  }

  ngOnInit() {
    this.httpService.get('v1/invaliddataviews?start=0', true).subscribe(
      (data: any) => {
        this.invalidDataViews = data.data;
        this.firstDataSourceViewSelected();
      });

    this.select(0);
  }

  public firstDataSourceViewSelected() {
    for (const firstRecord of this.invalidDataViews) {
      const firstRecordId = firstRecord.id;
      this.showMasterDataView(firstRecordId);
      break;
    }
  }

  public showMasterDataView(id: string): void {
    this.router.navigate(['/home/etl/part', 'assign-invalid-data', {outlets: {'bodyOutlet': ['form', id]}}]);
  }

  public searchMasterDataByName(id: string): void {
    this.httpService.get('v1/invaliddatas?start=0&length=1000&columns[0][data]=name&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=true&columns[0][search][value]=' + id + '&columns[0][search][regex]=false', true).subscribe(
      (data: any) => {
        this.invalidDataViews = data.data;
      }
    );
  }

  select(index: number) {
    this.selectedIndex = index;
  }
}
