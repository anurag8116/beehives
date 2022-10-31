import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html'
})
export class SettingComponent implements OnInit {

  constructor(private httpService: HttpService, private router: Router, private  route: ActivatedRoute) {
  }

  ngOnInit() {
    this.onTatClick();
  }
  onTatClick() {
    this.router.navigate(['/home/disputes/part', 'tat', {
      outlets: {
        'bodyOutlet': ['list'],
      }
    }]);
  }
}
