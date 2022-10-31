import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {Router} from '@angular/router';

enum SettingGroup {
  USER = 'USER',
  FINANCIAL_INSTITUTION = 'FINANCIAL_INSTITUTION',
  RECON_CYCLE = 'RECON_CYCLE',
  FILE_AVAIL = 'FILE_AVAIL',
  RECON_SETTING = 'RECON_SETTING',
  ETL_SETTING = 'ETL_SETTING'
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {

  public settingGroup: any;
  public selectedIndex: number;
  public settingType: any = [{key: 'Security', value: 'USER'}, {key: 'Financial Institution', value: 'FINANCIAL_INSTITUTION'}
    , {key: 'Recon Cycle', value: 'RECON_CYCLE'}, {key: 'File Availability', value: 'FILE_AVAIL'}, {
      key: 'Recon Setting',
      value: 'RECON_SETTING'
    }, {key: 'ETL Setting', value: 'ETL_SETTING'}];

  constructor(private http: HttpService, private router: Router) {
    this.settingGroup = SettingGroup;
  }

  ngOnInit() {
    this.select(0);
    this.onSelectSubSetting(SettingGroup.USER);
  }

  settingEnums(): Array<string> {
    return Object.keys(this.settingGroup).map(group => Object(this.settingGroup)[group]);
  }

  select(index: number) {
    this.selectedIndex = index;
  }

  onSelectSubSetting(settingGroup: string) {
    switch (settingGroup) {
      case SettingGroup.USER:
        this.userSetting(settingGroup);
        break;
      case SettingGroup.ETL_SETTING:
        this.etlSetting(settingGroup);
        break;
      case SettingGroup.FINANCIAL_INSTITUTION:
        this.financialInstitute(settingGroup);
        break;
      case SettingGroup.RECON_CYCLE:
        this.reconCycle();
        break;
      case SettingGroup.FILE_AVAIL:
        this.router.navigate(['/home/setting/part', 'file-avail', {
          outlets: {
            'bodyOutlet': ['new'],
          }
        }]);
        break;
      case SettingGroup.RECON_SETTING:
        this.reconSetting();
        break;
      default:
        break;
    }
  }

  reconSetting() {
    this.router.navigate(['/home/setting/part', 'captcha', {
      outlets: {
        'bodyOutlet': ['reconSettingForm'],
      }
    }]);
  }

  financialInstitute(settingGroup) {
    this.router.navigate(['home/setting/part', 'captcha', {
      outlets: {
        'bodyOutlet': ['financial-institution-form']
      }
    }], {queryParams: {categoryType: settingGroup}});
  }

  userSetting(settingGroup) {
    this.router.navigate(['/home/setting/part', 'captcha', {
      outlets: {
        'bodyOutlet': ['user-form']
      }
    }], {queryParams: {categoryType: settingGroup}});
  }

  etlSetting(settingGroup) {
    this.router.navigate(['/home/setting/part', 'captcha', {
      outlets: {
        'bodyOutlet': ['user-form']
      }
    }], {queryParams: {categoryType: settingGroup}});
  }

  reconCycle() {
    this.router.navigate(['/home/setting/part', 'captcha', {
      outlets: {
        'bodyOutlet': ['recon-cycle'],
      }
    }]);
  }


}
