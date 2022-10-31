import {AfterViewChecked, Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';

@Component({
  selector: 'app-privilege',
  templateUrl: './privilege.component.html'
})
export class PrivilegeComponent implements OnInit, AfterViewChecked {

  public privileges: any[] = [];
  public privilegeMenus: any[] = [];
  public ids: any;
  public selectedIndex: number;

  constructor(private httpService: HttpService) {
  }

  ngOnInit() {
    this.httpService.get('v1/privileges', true).subscribe(
      (data: any) => {
        this.privileges = data.data;
        this.selectPrivilege();
      }
    );
    this.select(0);
  }

  select(index: number) {
    this.selectedIndex = index;
  }

  ngAfterViewChecked(): void {
    const that = this;
    jQuery('#checke').on('click', 'td', 'a', function () {
      const tr = $(this).closest('td');
      if (jQuery(this).closest('td').hasClass('row-selected')) {
        jQuery(this).closest('td').removeClass('row-selected');
      } else {
        jQuery(this).closest('td').addClass('row-selected');
      }
    });
  }

  public selectPrivilege() {
    for (const privilege of this.privileges) {
      const ids = privilege.id;
      this.onSelectPrivilege(ids);
      break;
    }
  }

  public onSelectPrivilege(privilegeId: number): void {
    this.httpService.get('v1/privileges/' + privilegeId, true).subscribe(
      (data: any) => {
        this.privilegeMenus = data.data;
      }
    );
  }

}
