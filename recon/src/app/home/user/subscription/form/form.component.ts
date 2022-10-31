import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import {isNullOrUndefined} from 'util';
import {Location} from '@angular/common';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public appUserId: any;
  public isSubscription = false;
  public form: FormGroup;
  public subscriptions: any = [{id: {}, emailSupported: {}, smsSupported: {}, uiSupported: {}, slackSupported: {}}];
  public dropDownValue: any = [{name: 'Notification Subscriptions', value: 'Subscription'}];
  public url: any = 'user/setting';
  public urlSubscription: any = 'user/setting/subscription';
  public currentUrl: any;
  public selectedAction: any;
  public settingType: any;

  constructor(private location: Location, private http: HttpService, private router: Router) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      subscriptions: new FormArray([])
    });
    this.onDropDownChange(this.dropDownValue[0].value);
  }

  onDropDownChange(event: any) {
    this.selectedAction = event;
    if (event === 'Subscription') {
      this.settingType = 'Notification Subscriptions';
      this.isSubscription = true;
      this.http.get('subscriptions', true).subscribe(
        (data: any) => {
          for (const notify of data.data) {
            this.addSuscription(notify);
          }
        }
      );
    }
  }

  public addSuscription(notify: any): void {
    this.appUserId = notify.appUser;
    const control = new FormGroup({
      id: new FormControl(notify.id),
      notification: new FormGroup({
        displayMessage: new FormControl(notify.displayMessage),
        id: new FormControl(notify.notificationId)
      }),
      emailSubscribed: new FormControl(notify.emailSupported),
      smsSubscribed: new FormControl(notify.smsSupported),
      uiSubscribed: new FormControl(notify.uiSupported),
      slackSubscribed: new FormControl(notify.slackSupported),
    });
    (<FormArray>this.form.get('subscriptions')).push(control);
  }

  onSubmit() {
    if (isNullOrUndefined(this.appUserId)) {
      this.http.post('subscriptions', this.form.controls['subscriptions'].value, true).subscribe(
        (data: any) => {
          this.http.displaySuccessOnPopUp('Subscription Created Successfully !');
        },
        (errorResponse: HttpErrorResponse) => {
        }
      );
    } else {
      this.http.put('subscriptions', this.form.controls['subscriptions'].value, true).subscribe(
        (data: any) => {
          this.http.displaySuccessOnPopUp('Subscription Updated Successfully !');
        },
        (errorResponse: HttpErrorResponse) => {
        }
      );
    }

  }

  cancel() {
    this.router.navigate(['/home/dashboard']);
  }

}
