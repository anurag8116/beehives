import {Component, Injectable} from '@angular/core';
import {ServiceConstant} from './service-constant';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import {HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpParams} from '@angular/common/http';
import {AppConstants} from './app.constants';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {LoaderService} from './loader.service';
import 'rxjs/add/operator/finally';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CoustomErrorComponent} from '../coustom-error/coustom-error.component';
import {DomSanitizer} from '@angular/platform-browser';

@Injectable()
export class HttpService {
  constructor(private http: HttpClient, private router: Router, private datePipe: DatePipe, private loaderService: LoaderService,
              private snackBar: MatSnackBar, private domSanitizer: DomSanitizer) {
  }

  public post(url: string, data: any, errorOnPopUp: boolean) {
    return this.http.post(ServiceConstant.URL + url, data, {headers: this.getHeader()}).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public delete(url: string, errorOnPopUp: boolean) {
    return this.http.delete(ServiceConstant.URL + url, {headers: this.getHeader()}).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public get(url: string, errorOnPopUp: boolean) {
    return this.http.get(ServiceConstant.URL + url, {headers: this.getHeader()}).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public getWithoutAuth(url: string, errorOnPopUp: boolean) {
    return this.http.get(ServiceConstant.URL + url).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  private onEnd(): void {
    this.hideLoader();
  }

  private showLoader(): void {
    this.loaderService.show();
  }

  private hideLoader(): void {
    this.loaderService.hide();
  }

  public captcha(url: string, errorOnPopUp: boolean) {
    return this.http.get(ServiceConstant.URL + url, {headers: this.getHeader()}).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public put(url: string, data: any, errorOnPopUp: boolean) {
    return this.http.put(ServiceConstant.URL + url, data, {headers: this.getHeader()}).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public postWithoutAuth(url: string, data: any, errorOnPopUp: boolean) {
    return this.http.post(ServiceConstant.URL + url, data).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public login(url: string, data: any, errorOnPopUp: boolean) {
    return this.http.post(ServiceConstant.URL + url, data).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public ssoLogin(url: string, token: any, errorOnPopUp: boolean) {
    const header: HttpHeaders = new HttpHeaders().set(AppConstants.SSO_AUTHTOKEN_HEADER, token);
    return this.http.post(ServiceConstant.URL + url, {}, { headers: header}).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public registrationRequest(url: string, token: any, errorOnPopUp: boolean) {
    const header: HttpHeaders = new HttpHeaders().set(AppConstants.SSO_AUTHTOKEN_HEADER, token);
    return this.http.get(ServiceConstant.URL + url, { headers: header}).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public displayErrorOnPopUp(errors: string) {
    this.snackBar.openFromComponent(CoustomErrorComponent, {
      duration: 100 * 1000,
      data: errors,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
    //  $.confirm(this.getErrorModal(errors));
  }

  public displaySuccessOnPopUp(errors: string, durationTime = 2000) {
    this.snackBar.open(errors, 'OK!', {
      extraClasses: 'mat-sanck-sucessfull',
      duration: durationTime,
    });
    // $.confirm(this.getSuccessModal(errors));
  }

  public getMessaage(errorResponse: HttpErrorResponse): string {
    let errors = '';
    if (errorResponse.status === 500) {
      errors += 'Oops!';
    } else if (errorResponse.status === 403) {
      errors += 'you aren\'t authorized to view this page!';
    } else if (errorResponse.status === 404) {
      for (const err of errorResponse.error) {
        errors += err.message + '<br>';
      }
    } else if (errorResponse.status === 400) {

      for (const err of errorResponse.error) {
        if (err.message) {
          errors += err.message + '<br>';
        }
      }
    } else if (errorResponse.status === 401) {
      //    for (const err of errorResponse.error) {
      if (errorResponse.statusText) {
        //  errors += errorResponse.statusText + '<br>';
        errors += 'Invalid access, please login.' + '<br>';
      }
      //    }
      localStorage.clear();
      this.router.navigate(['/authentication']);
    } else {
      errors += 'net::ERR_CONNECTION_REFUSED !!';
    }
    return errors;
  }

  public printReport(url: string) {
    url = url + '&print=true';
    let popupWin;
    popupWin = window.open(url).print();
  }

  public driveDate(strDate: string): any {
    return this.datePipe.transform(strDate, 'dd-MM-yyyy');
  }

  public createHttpParams(params: {}): HttpParams {
    let httpParams: HttpParams = new HttpParams();
    Object.keys(params).forEach(param => {
      if (params[param] !== null && params[param] !== '') {
        httpParams = httpParams.set(param, params[param]);
      }
    });

    return httpParams;
  }

  public getReport(url: string, data: any, errorOnPopUp: boolean) {
    return this.http.get(ServiceConstant.URL + url, {
      headers: this.getHeader(),
      params: this.createHttpParams(data)
    }).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public getHeader(): HttpHeaders {
    if ((localStorage.getItem(AppConstants.AUTH_TOKEN) !== 'null' && localStorage.getItem(AppConstants.USER_ID) !== 'null')) {
      if (localStorage.length > 0) {
        const header: HttpHeaders = new HttpHeaders()
          .set(AppConstants.AUTHTOKEN_HEADER, localStorage.getItem(AppConstants.AUTH_TOKEN))
          .set(AppConstants.USERID_HEADER, localStorage.getItem(AppConstants.USER_ID));
        return header;
      }
    } else {
      const header: HttpHeaders = new HttpHeaders();
      return header;
    }

  }

  private getHeaderForCaptcha(): HttpHeaders {
    const header: HttpHeaders = new HttpHeaders();
    return header;
  }

  private getErrorModal(message: string): any {
    const defaultModal = this.getDefaultModal();
    defaultModal.type = 'red';
    defaultModal.title = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Error ...!';
    defaultModal.buttons.close.btnClass = 'btn-red';
    defaultModal.content = message;
    return defaultModal;
  }

  private getSuccessModal(message: string): any {
    const defaultModal = this.getDefaultModal();
    defaultModal.type = 'green';
    defaultModal.title = 'Success!';
    defaultModal.buttons.close.btnClass = 'btn-green';
    defaultModal.content = message;
    return defaultModal;
  }

  private getDefaultModal() {
    return {
      title: 'Please Fill in the following Details!',
      content: '',
      type: '',
      closeIcon: true,
      closeIconClass: 'fa fa-close',
      animation: 'none',
      offsetBottom: 400,
      height: 'auto',
      buttons: {
        close: {
          btnClass: '', text: 'Close', action: function () {
          }
        }
      }
    };
  }

  public loadImage(url: string): Observable<any> {
    return this.http.get(ServiceConstant.URL + url, {headers: this.getHeader(), responseType: 'blob'});
  }

  public downloadFile(url: string): Observable<any> {
    return this.http.get(ServiceConstant.URL + url, {headers: this.getHeader(), responseType: 'blob'});
  }
}


