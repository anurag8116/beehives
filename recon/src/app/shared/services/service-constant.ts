import { environment } from "../../../environments/environment";
export class ServiceConstant {

  public static URL = environment.apiUrl;
  public static SS_URL = environment.ssUrl;

  public static getDropDownDefaultSetting(): any {
    return {
      singleSelection: false,
      text: 'Select',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      maxHeight: 150,
      badgeShowLimit: 2
    };
  }

  public static getDropDownSingleSelectSetting(): any {
    return {
      singleSelection: true,
      text: 'Select',
      enableSearchFilter: true,
      maxHeight: 150,
      badgeShowLimit: 2
    };
  }

}
