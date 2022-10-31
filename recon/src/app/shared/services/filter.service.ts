import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpService} from './http-service';
import {ServiceConstant} from './service-constant';


@Injectable()
export class FilterService {

  public editor;

  constructor(private router: Router, private httpService: HttpService) {}

  public search(searchdata: string, columnIndex: number, dtElement: any) {
    dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns(columnIndex).search(searchdata).draw();
    });
  }

  public searchByDate(searchdata: string, columnIndex: number, dtElement: any): void {
    if (null !== searchdata) {
      dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.columns(columnIndex).search(this.httpService.driveDate(searchdata)).draw();
      });
    } else {
      searchdata = ' ';
      dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.columns(columnIndex).search(searchdata).draw();
      });
    }
  }

  public searchForDynamic(name: string, searchField: string, tableCoumnOrders: any[], dtElement, startIndex: number): void {
    dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      tableCoumnOrders.forEach(function (value) {
        if (value.data === searchField) {
          dtInstance.columns(value.index + startIndex).search(name).draw();
        }
      });
    });
  }


}
