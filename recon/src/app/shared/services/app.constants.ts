export class AppConstants {
  public static USER_ROLE = 'userRole';
  public static AUTH_TOKEN = 'authToken';
  public static USER_ID = 'userId';
  public static MOBILE_NUMBER = 'contactNumber';
  public static USER_NAME = 'userName';
  public static USER_MODULE = 'module';
  public static USER_PRIVILEGE = 'USER_PRIVILEGE';

  public static SSO_AUTHTOKEN_HEADER = 'X-ASCENT-SSO-AUTHTOKEN';
  public static AUTHTOKEN_HEADER = 'X-ASCENT-AUTHTOKEN';
  public static USERID_HEADER = 'X-ASCENT-USERID';

  public static USER = 'USER';
  public static USER_ALLOW_CHANGE_PASS = 'userAllowChangePass';

  public static ARCHIVE_DATA_TILL_DATE = 'archiveDataTillDate';

  public static ENCRYPTION_KEY = 'bXVzdGJlMTZieXRlc2tleQ==';
  private static MILI_SEC_TO_DAY = 1000 * 60 * 60 * 24;

  public static getDatePickerConfig(restrictFutureDate: boolean = false, fromDate: string = null): any {
    const date: Date = new Date(fromDate);
    return {
      dateInputFormat: 'DD-MM-YYYY',
      containerClass: 'theme-blue',
      maxDate: (restrictFutureDate === true ? new Date() : null),
      minDate: (fromDate !== null ? new Date(date.setDate(date.getDate() + 1)) : null),
    };
  }

  public static getDatePickerOnlyFuture(FromDate: string = null): any {
    const date: Date = FromDate == null ? new Date() : new Date(FromDate);
    return {
      dateInputFormat: 'DD-MM-YYYY',
      containerClass: 'theme-blue',
      minDate: new Date(date.setDate(date.getDate()))
    };
  }

  public static getDatePickerOnlyPast(FromDate: string = null): any {
    const date: Date = FromDate == null ? new Date() : new Date(FromDate);
    return {
      dateInputFormat: 'DD-MM-YYYY',
      containerClass: 'theme-blue',
      maxDate: new Date(date.setDate(date.getDate()))
    };
  }

  public static getDateFromString(date: string = null): any {
    const val = date;
    const dateArray = val.split('-');
    const finalDate = new Date(dateArray[1] + '-' + dateArray[0] + '-' + dateArray[2]);
    return finalDate;
  }

  public static getDateDiff(currentDate: Date, pastDate: Date) {
    const timeDiff = currentDate.getTime() - pastDate.getTime();
    return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate()))/AppConstants.MILI_SEC_TO_DAY);
    // return timeDiff/AppConstants.MILI_SEC_TO_DAY;
  }

  public static base64ToExcel(base64File: string): any {
    const padding = '='.repeat((4 - base64File.length % 4) % 4);
    const base64 = (base64File + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    const byteNumbers = new Array(base64File.length);

    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return new Blob([outputArray], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});

  }

  public static genType(fileName: string): string {
    let fileNameArr = fileName.split('.');
    if(fileNameArr.length < 1) return '';
    const fileType =  fileNameArr[fileNameArr.length-1];
    return fileType;
  }

  public static base64ToBlob(b64Data, fileName: string = '', sliceSize = 512) {
    const type = this.genType(fileName);
    if (b64Data.split(',').length > 1) {
      b64Data = b64Data.split(',')[1];
    }
    b64Data = b64Data.replace(/\s/g, ''); //IE compatibility...
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: type });
  }
}
