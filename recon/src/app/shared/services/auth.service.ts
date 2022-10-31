import {AppConstants} from './app.constants';

export class AuthService {

  public setAuthToken(data: any): void {
    localStorage.setItem(AppConstants.AUTH_TOKEN, data.authToken);
    localStorage.setItem(AppConstants.USER_ID, data.id);
    localStorage.setItem(AppConstants.USER_NAME, data.firstName + ' ' + data.lastName);
    localStorage.setItem(AppConstants.USER_MODULE, data.module);
    //  const role = data.roles[0].name;
    localStorage.setItem(AppConstants.USER_ROLE, data.rolesName);
    localStorage.setItem(AppConstants.ARCHIVE_DATA_TILL_DATE, data.archiveDataTillDate);
    localStorage.setItem(AppConstants.USER_ALLOW_CHANGE_PASS, data.allowUserToChaPass);
  }

  public getRole(): string {
    return localStorage.getItem(AppConstants.USER_ROLE);
  }

  public hasRole(role: string): boolean {
    return this.getRole() === role;
  }

  public hasRoleCardOps(): boolean {
    return this.hasRole('ROLE_CARD_OPS');
  }

  public hasRoleCX(): boolean {
    return this.hasRole('ROLE_CARD_CX');
  }

  public hasRolePartnershipTeam(): boolean {
    return this.hasRole('ROLE_PARTNERSHIP_TEAM');
  }

  public getLoggedInUserModule(): string {
    return localStorage.getItem(AppConstants.USER_MODULE);
  }

  public hasToken(): boolean {
    if (localStorage.getItem(AppConstants.AUTH_TOKEN)) {
      return true;
    } else {
      return false;
    }
  }

  public getUserName(): string {
    return localStorage.getItem(AppConstants.USER_NAME);
  }

  public getUserId(): string {
    return localStorage.getItem(AppConstants.USER_ID);
  }

  public hasPrivilege(): boolean {
    if (localStorage.getItem(AppConstants.USER_PRIVILEGE)) {
      return true;
    } else {
      return false;
    }
  }

  public setUserPrivilege(data: any): void {
    localStorage.setItem(AppConstants.USER_PRIVILEGE, JSON.stringify(data));
  }

  public setOtpFormData(data: any): void {
    localStorage.setItem(AppConstants.MOBILE_NUMBER, data.contactNumber);
    localStorage.setItem(AppConstants.USER_ID, data.id);
  }

  public getUserPrivilege(): any[] {
    const privilegeString = localStorage.getItem(AppConstants.USER_PRIVILEGE);
    const privilege = JSON.parse(privilegeString);
    return privilege;
  }

  public getArchiveDataTillDate(): string {
    return localStorage.getItem(AppConstants.ARCHIVE_DATA_TILL_DATE);
  }

  public hasRoleM2p(): boolean {
    return this.hasRole('ROLE_M2P');
  }

}
