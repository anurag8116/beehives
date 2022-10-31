import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {isNullOrUndefined} from 'util';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  private id: number;
  public dataSourceView: any = {datasourceVo: {name: ''}, unmatchedTransactionView: {name: ''}, reconVo: {name: ''}, filters: [], sorters: [], tableColumns: []};
  constructor(private httpService: HttpService, private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;

      this.httpService.get('v1/unmatchedtransactions/' + this.id, true).subscribe(
        (data: any) => {
          this.dataSourceView = data;
        }
      );
    });
  }
}
