import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Params, Router} from '@angular/router';

@Component({
  selector: 'app-lookup-detail',
  templateUrl: './lookup-detail.component.html',
})
export class LookupDetailComponent implements OnInit {

  private id: any;
  public lookUpProviders: any = {};
  constructor(private httpService: HttpService, private router: Router, private  route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe((param: Params) => {
      this.id = param['id'] || null;
      this.httpService.get('v1/lookupproviders/' + this.id, true).subscribe(
        (data: any) => {
          this.lookUpProviders = data;
        }
      );
    });
  }

}
