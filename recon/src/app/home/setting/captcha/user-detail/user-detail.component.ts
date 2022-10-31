import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html'
})
export class UserDetailComponent implements OnInit {

  @Input() public user: any = [];
  @Output() private editClick = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  public edit() {
    this.editClick.emit(true);
  }

}
