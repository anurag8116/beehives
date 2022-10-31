import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class MenuService {
  public dropDownMenuChange = new Subject<number>();
  public action = new Subject<number>();
  public actionWithStatus = new Subject<any>();
  public onClickAction = new Subject<number>();

  constructor() {
  }

  onAction(id: number) {
    this.action.next(id);
  }

  onButtonClickAction(id: number) {
    this.onClickAction.next(id);
  }

  onDropDownMenuChange(id: number) {
    this.dropDownMenuChange.next(id);
  }

  public getDropDownMenuId(): number {
    return +localStorage.getItem('DROPDOWN_MENU_ID');
  }

  public setDropDownMenuId(id: number): void {
    localStorage.setItem('DROPDOWN_MENU_ID', id.toString());
  }

  public removeDropDownMenuId(): void {
    localStorage.removeItem('DROPDOWN_MENU_ID');
  }

  public getHeaderMenuId(): number {
    return +localStorage.getItem('HEADER_MENU_ID');
  }

  public setHeaderMenuId(id: number): void {
    localStorage.setItem('HEADER_MENU_ID', id.toString());
  }

}

