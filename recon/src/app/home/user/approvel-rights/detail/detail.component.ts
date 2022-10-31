import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {

  @Input() public approvalRight: any = {};
  @Input() public selectedAction: any = {};
  @Output() private editClick = new EventEmitter<boolean>();

  constructor() {
  }

  ngOnInit() {
  }

  public edit() {
    this.editClick.emit(true);
  }

}
