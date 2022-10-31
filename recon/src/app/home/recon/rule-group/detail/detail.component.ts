import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  private id: number;
  public ruleGroup: any = {module: {name: ''}, rules: [{rule: {}}]};

  constructor(private httpService: HttpService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;

      this.httpService.get('v1/rulegroups/' + this.id + "?rulestatuses=ENABLED,DISABLED", true).subscribe(
        (data: any) => {
          this.ruleGroup = data;
        }
      );
    });
  }
}
