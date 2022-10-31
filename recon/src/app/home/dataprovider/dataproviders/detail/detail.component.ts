import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Params, Router} from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
})
export class DetailComponent implements OnInit {

  public dataProviders: any = {'filters': [], 'sorters': [], 'formatter': {'tableColumns': []}, 'colors': []};
  private id: any;

  constructor(private httpService: HttpService, private router: Router, private  route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe((param: Params) => {
      this.id = param['id'] || null;
      this.httpService.get('v1/datasets/' + this.id, true).subscribe(
        (data: any) => {
          this.dataProviders = data;
        }
      );
    });
  }

}
