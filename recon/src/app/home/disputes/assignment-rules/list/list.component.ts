import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {DataTableService} from '../../../../shared/services/data-table-service';
import {FilterService} from '../../../../shared/services/filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  public modules: any[] = [];
  public roles: any[] = [];
  public isLoading: boolean;

  constructor(private activatedRout: ActivatedRoute, private dateTableService: DataTableService, private filter: FilterService,
              private httpService: HttpService, private router: Router) {
  }

  ngOnInit() {
    this.dtOptions = Object.assign(this.dateTableService.getBasicTable('v1/assignmentrules', this.getColumnsDefinition()));

    this.httpService.get('v1/modules?start=0&length=1000', true).subscribe(
      (data: any) => {
        this.modules = data.data;
      });

    this.httpService.get('v1/roles?start=0&length=1000', true).subscribe(
      (data: any) => {
        this.roles = data.data;
      });
  }

  public search(val: string, columnIndex: number): void {
    this.filter.search(val, columnIndex, this.dtElement);
  }

  private getColumnsDefinition(): any[] {
    const columns: any [] = [];
    columns.push({title: 'MODULE', data: 'moduleName', render:  $.fn.dataTable.render.text()});
    columns.push({title: 'ROLE', data: 'roleName'});
    return columns;
  }
}
