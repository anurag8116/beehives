import {Injectable} from '@angular/core';
import {ServiceConstant} from './service-constant';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {AppConstants} from './app.constants';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';

@Injectable()
export class StremSetHttpService {

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {
  }

  public post(url: string, data: any, errorOnPopUp: boolean) {
    return this.http.post(ServiceConstant.SS_URL + url, data, {headers: this.getHeader()}).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public delete(url: string, errorOnPopUp: boolean) {
    return this.http.delete(ServiceConstant.SS_URL + url, {headers: this.getHeader()}).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public get(url: string, errorOnPopUp: boolean) {
    return this.http.get(ServiceConstant.SS_URL + url, {headers: this.getHeader()}).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public put(url: string, data: any, errorOnPopUp: boolean) {
    return this.http.put(ServiceConstant.SS_URL + url, data, {headers: this.getHeader()}).catch(
      (errorResponse: HttpErrorResponse) => {
        if (errorOnPopUp) {
          this.displayErrorOnPopUp(this.getMessaage(errorResponse));
        }
        return Observable.throw(errorResponse);
      }
    );
  }

  public displayErrorOnPopUp(errors: string) {
    $.confirm(this.getErrorModal(errors));
  }

  public getMessaage(errorResponse: HttpErrorResponse): string {
    let errors = '';
    if (errorResponse.status === 500) {
      errors += 'Internal Server Error !!';
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
      errors += 'Access denied !!';
      localStorage.clear();
      this.router.navigate(['/authentication']);
    } else {
      errors += 'net::ERR_CONNECTION_REFUSED !!';
    }
    return errors;
  }

  private getHeader(): HttpHeaders {
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

  private getErrorModal(message: string): any {
    const defaultModal = this.getDefaultModal();
    defaultModal.type = 'red';
    defaultModal.title = 'Error!';
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
          btnClass: '', action: function () {
          }
        }
      }
    };
  }
}
