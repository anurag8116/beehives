import {Injectable} from '@angular/core';
import {MenuService} from './menu.service';
import {AuthService} from './services/auth.service';

@Injectable()
export class MenuItemService {

  constructor(private authService: AuthService) {
  }


}
