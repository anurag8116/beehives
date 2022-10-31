import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HttpService} from '../services/http-service';
import {AppConstants} from '../services/app.constants';
import {DomSanitizer} from '@angular/platform-browser';
import {ServiceConstant} from '../services/service-constant';
import * as FileSaver from 'file-saver';
import {OAuthService} from 'angular-oauth2-oidc';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {

  public isHideLeftMenu = false;
  public userName: string;
  public userDetail: any = {};
  public notifications: any = {};
  public downloads: any = [];
  public allowUserChangedPass: boolean;
  public seen: Boolean = false;
  public profilePic;
  public id: number;
  public url: String;
  public token: String;
  constructor(private httpService: HttpService, private router: Router, private domSanitizer: DomSanitizer, private oAuthService: OAuthService) {
    this.id = +localStorage.getItem(AppConstants.USER_ID);
  }

  ngOnInit() {
    this.token = localStorage.getItem(AppConstants.AUTH_TOKEN);
    this.url = ServiceConstant.URL + 'v1/dashletdownloads/downloads/';
    this.allowUserChangedPass = JSON.parse(localStorage.getItem(AppConstants.USER_ALLOW_CHANGE_PASS));
    this.httpService.get('v1/privileges?Find=ByRole', true).subscribe(
      (data: any) => {
        this.userDetail = data;
      }
    );
    this.dashletData();
    this.httpService.get('uinotifications?maxResults=' + 5, true).subscribe(
      (data: any) => {
        this.notifications = data;
        if (this.notifications.totalResult === 0) {
          this.notifications.totalResult = null;
        }
      }
    );
    this.onURLinserted();
  }

  onURLinserted() {
    this.httpService.loadImage('v1/profiles/image').subscribe(data => {
      this.createImageFromBlob(data);
    }, error => {
      console.log('Error occured', error);
    });
  }

  createImageFromBlob(image) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.profilePic = this.domSanitizer.bypassSecurityTrustUrl(reader.result);
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  profile() {
    this.router.navigate(['/home/user/full', 'profile', {outlets: {'fullBodyOutlet': ['detail']}}]
    );
  }

  public logout() {
    this.httpService.get('v1/logout', true).subscribe(
      (data: any) => {
        localStorage.clear();
        sessionStorage.clear();
        this.oAuthService.logOut();
        this.router.navigate(['/authentication']);
      });
  }

  public changePassword() {
    this.router.navigate(['/authentication/full', {
      outlets: {
        'fullBodyOutlet': ['reset-password', localStorage.getItem(AppConstants.AUTH_TOKEN)]
      }
    }]);
  }

  public onSetting() {
    this.router.navigate(['/home/user/full', 'subscription', {outlets: {'fullBodyOutlet': ['form']}}]
    );
  }

  public dashletData() {
    this.httpService.get('v1/dashletdownloads?maxResults=' + 5, true).subscribe(
      (data: any) => {
        this.downloads = data.data;
      }
    );
  }

  public clickOnHideLeftMenu() {
    if (!$('body').hasClass('layout-fullwidth')) {
      $('body').addClass('layout-fullwidth');
      this.isHideLeftMenu = true;
    } else {
      $('body').removeClass('layout-fullwidth');
      $('body').removeClass('layout-default'); // also remove default behaviour if set
      this.isHideLeftMenu = false;
    }

    $(this).find('.lnr').toggleClass('lnr-arrow-left-circle lnr-arrow-right-circle');

    if ($(window).innerWidth() < 1025) {
      if (!$('body').hasClass('offcanvas-active')) {
        $('body').addClass('offcanvas-active');
      } else {
        $('body').removeClass('offcanvas-active');
      }
    }
  }

  public dayEnd() {
    const that = this;
    $.confirm({
      title: 'Confirm!',
      type: 'green',
      content: ' Are you sure u want to end the day!',
      animation: 'none',
      offsetBottom: 400,
      height: 'auto',
      buttons: {
        confirm: {
          btnClass: 'btn-green',
          action: function () {
            that.httpService.post('dayend', {}, true).subscribe(
              (data: any) => {
                that.httpService.displaySuccessOnPopUp('Day successfully ended !');
              }
            );
          }
        },
        cancel: {
          btnClass: 'btn-red',
          action: function () {
          }
        }
      }
    });
  }

  public unseenClick() {
    this.httpService.put('uinotifications', this.seen, true).subscribe(
      (data: any) => {
        this.router.navigate(['/home/user/full', 'notification', {outlets: {'fullBodyOutlet': ['list']}}]);
      }
    );
  }

  public downloadClick() {
    this.httpService.put('uinotifications', this.seen, true).subscribe(
      (data: any) => {
        this.router.navigate(['/home/dashboard/full', {outlets: {'fullBodyOutlet': ['download-report']}}]);
      }
    );
  }

  public downloadFile(id: number): any {
    this.httpService.get('v1/dashletdownloads/file/' + id, true).subscribe(
      (data: any) => {
        this.httpService.downloadFile('v1/dashletdownloads/downloads/' + id).subscribe(
          (res: any) => {
            FileSaver.saveAs(res, data.dashletName ? data.dashletName : new  Date());
      }
    );
  }
    );
  }

  // public downloadFile(id: number): any {
  //   this.httpService.get('v1/dashletdownloads/downloads/' + id, true).subscribe(
  //     (data: any) => {
  //       FileSaver.saveAs(AppConstants.base64ToExcel(data.filePath), data.dashletName ? data.dashletName : new  Date());
  //     }
  //   );
  // }
}
