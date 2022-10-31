import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  public dashlet: any = {'filters': [], 'sorters': [], 'tableColumns': [], 'colors': []};
  private id: number;

  constructor(private httpService: HttpService, private router: Router, private  route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe((param: Params) => {
      this.id = +param['id'] || null;
      this.httpService.get('v1/dashlets/' + this.id, true).subscribe(
        (data: any) => {
          this.dashlet = data;
        },
      );
    });
  }

  public onEdit(): void {
    this.router.navigate(['/home/dashboard/full', 'dashlet', {outlets: {'fullBodyOutlet': ['new']}}],
      {queryParams: {id: this.id}});
  }
}
