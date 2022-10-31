import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  public recon: any = {module: {name: ''}, relaxMatchRuleGroups: [], manuleRuleGroup: {}};
  private id: number;

  constructor(private httpService: HttpService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;

      this.httpService.get('v1/recons/detail/' + this.id, true).subscribe(
        (data: any) => {
          this.recon = data;
        }
      );
    });
  }
}
