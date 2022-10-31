import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpService} from '../../../shared/services/http-service';
import {ServiceConstant} from '../../../shared/services/service-constant';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  public Url: string = null;
  public report: any = {'filters': [], 'sorters': [], 'formatter': {'tableColumns': []}, 'colors': []};
  private id: number;

  constructor(private httpService: HttpService, private router: Router, private  route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe((param: Params) => {
      this.Url = ServiceConstant.URL + 'v1/dashlets/';
      this.id = +param['id'] || null;
      this.httpService.get('v1/reports/' + this.id, true).subscribe(
        (data: any) => {
          this.report = data;
        },
      );
    });
  }

  public onEdit(): void {
    this.router.navigate(['/home/reports/full', {outlets: {'fullBodyOutlet': ['new']}}],
      {queryParams: {id: this.id}});
  }
}
