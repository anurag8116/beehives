import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  public isFormula = null;
  public detail: any = {configDetails: [{conditions: [{}]}]};
  public config: any = {conditions: [{dataElement: {}}]};
  public conditions: any = {};
  public fields: any = {};
  private id: number;

  constructor(private httpService: HttpService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {

    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;

      this.httpService.get('v1/glconfigrations/' + this.id, true).subscribe(
        (data: any) => {
          this.detail = data;
          /* for (const obj of this.detail.config) {
             if (obj.formula === 'FORMULA') {
               this.isFormula = 'FORMULA';
             } else {
               this.isFormula = 'CONSTANT';
             }
           }*/
        }
      );
    });
  }
}
