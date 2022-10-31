import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html'
})
export class DetailsComponent implements OnInit {
  private id: number;
  public detail: any = { fields: [ ]};
  constructor(private httpService: HttpService, private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;
      this.httpService.get('v1/duplicatecriterias/' + this.id, true).subscribe(
        (data: any) => {
          this.detail = data;
        }
      );
    });
  }
}
