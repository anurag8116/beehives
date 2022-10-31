import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {

  @Input() public user: any = [];
  @Output() private editClick = new EventEmitter<boolean>();
  public isLoading: boolean;

  constructor() { }

  ngOnInit() {
  }

  public edit() {
    this.isLoading = true;
    this.editClick.emit(true);
    this.isLoading = false;
  }

}
