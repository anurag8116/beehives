import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html'
})
export class NotificationsListComponent implements OnInit {

  public notifications: any = {};

  constructor(private httpService: HttpService) {
  }

  ngOnInit() {
    this.httpService.get('uinotifications', true).subscribe(
      (data: any) => {
        this.notifications = data;
        if (this.notifications.totalResult === 0) {
          this.notifications.totalResult = null;
        }
      }
    );
  }

}
