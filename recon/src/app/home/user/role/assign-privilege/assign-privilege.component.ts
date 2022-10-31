import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-assign-privilege',
  templateUrl: './assign-privilege.component.html'
})
export class AssignPrivilegeComponent implements OnInit {

  private id: number;
  public isLoading: boolean;
  public role: any = {privilege: [{privilegeMenu: [{}]}]};
  private assignPrivilege: any;
  public selectedIndex: number;

  constructor(private httpService: HttpService, private activeRoute: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      this.id = +params['id'] || null;

      this.httpService.get('v1/roles/byRole/' + this.id, true).subscribe(
        (data: any) => {
          for (const rolePrivileges of data.rolePrivileges) {
            for (const privilegeTypes of data.privilege) {
              for (const privilegeAction of privilegeTypes.privilegeMenu) {
                if (rolePrivileges.privilegeMenu.menuId === privilegeAction.menuId) {
                  privilegeAction['checked'] = true;
                }
              }
            }
          }
          this.role = data;
          this.assignPrivilege = {roleId: this.id, rolePrivileges: []};
          this.assignPrivilege.rolePrivileges.push(...data.rolePrivileges);
        }
      );
    });
    this.select(0);
  }

  select(index: number) {
    this.selectedIndex = index;
  }

  public updatePrivilege(event: any): void {
    if (event.target.checked === true) {
      this.assignPrivilege.rolePrivileges.push({privilegeMenu: {menuId: event.target.value}});
    } else {
      for (let i = 0; i < this.assignPrivilege.rolePrivileges.length; i++) {
        if (+this.assignPrivilege.rolePrivileges[i].privilegeMenu.menuId === +event.target.value) {
          this.assignPrivilege.rolePrivileges.splice(i, 1);
        } else if (+this.assignPrivilege.rolePrivileges[i].privilegeMenu.menuId === +event.target.value) {
          this.assignPrivilege.rolePrivileges.splice(i, 1);
        }
      }
    }
  }

  public submitForm() {
    this.httpService.post('v1/roles?Operation=UpdatePrivilege', this.assignPrivilege, true).subscribe(
      (data: any) => {
        this.httpService.displaySuccessOnPopUp('Updated Successfully !');
        this.router.navigate(['/home/user/full', 'role', {outlets: {'fullBodyOutlet': ['list']}}]);
      },
      (errorResponse: HttpErrorResponse) => {
      }
    );
  }

  cancel() {
    this.router.navigate(['/home/user/full', 'role', {
      outlets: {
        'fullBodyOutlet': ['list'],
      }
    }]);
  }

}
