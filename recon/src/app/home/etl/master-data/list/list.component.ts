import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';
import {MenuService} from '../../../../shared/menu.service';
import {DataTableDirective} from 'angular-datatables';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public masterDatas: any = [];
  public  selectedIndex: number;

  constructor(private dateTableService: DataTableService, private httpService: HttpService,
              private menuService: MenuService, private router: Router) { }

  ngOnInit() {
    this.httpService.get('v1/masterdataviews?start=0&length=1000', true).subscribe(
      (data: any) => {
        this.masterDatas = data.data;
        this.showMasterDataView(this.masterDatas[0].id);
      });
    this.select(0);
  }

  public showMasterDataView(id: number): void {
    this.router.navigate(['/home/etl/part', 'master-data', {outlets: {'bodyOutlet': ['view', id]}}]);
  }

  public searchMasterDataByName(id: string): void {
    this.httpService.get('v1/masterdatatypes?start=0&length=1000&columns[0][data]=name&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=true&columns[0][search][value]=' + id + '&columns[0][search][regex]=false', true).subscribe(
      (data: any) => {
        this.masterDatas = data.data;
      }
    );
  }

  select(index: number) {
    this.selectedIndex = index;
  }
}
