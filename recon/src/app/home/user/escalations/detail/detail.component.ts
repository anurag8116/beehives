import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {

  @Input() public escalations: any = {};
  @Output() private onEdit = new EventEmitter<boolean>();

  constructor() {
  }

  ngOnInit() {
  }

  public edit() {
    this.onEdit.emit(true);
  }

}
