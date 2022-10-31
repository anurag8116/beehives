import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  private id: number;
  public rule: any = {primaryDataSource: {name: ''}, secondaryDataSource: {name: ''}, module: {name: ''}, conditions: [{dataElement: {}}]};

  constructor(private httpService: HttpService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;

      this.httpService.get('v1/rules/' + this.id, true).subscribe(
        (data: any) => {
          this.rule = data;
        }
      );
    });
  }
}
