import {Component, HostListener, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthConfig, JwksValidationHandler, OAuthService} from 'angular-oauth2-oidc';
import {environment} from '../environments/environment';


const oAuthConfig: AuthConfig = {
  issuer: 'https://accounts.google.com',
  strictDiscoveryDocumentValidation: false,
  redirectUri: window.location.origin,
  clientId: environment.clientId,
  scope: 'openid profile email'
};

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {

  @HostListener('window:beforeunload', ['$event'])
  doSomething($event) {
     /*commented for VAPT certification a user can login one browser.*/
   // localStorage.clear();
  }
  constructor(private router: Router, private oAuthService: OAuthService) {
    this.configureWithNewConfigApi();
  }

  private configureWithNewConfigApi() {
    this.oAuthService.configure(oAuthConfig);
    this.oAuthService.tokenValidationHandler = new JwksValidationHandler();
    this.oAuthService.loadDiscoveryDocumentAndTryLogin().catch((err) => {
      console.log('Error while trying to login using sso', err);
    });
  }

  ngOnInit() {
  }

}
