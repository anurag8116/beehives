import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-financial-institution-detail',
  templateUrl: './financial-institution-detail.component.html'
})
export class FinancialInstitutionDetailComponent implements OnInit {
  @Input() public user: any = [];
  @Output() private editClick = new EventEmitter<boolean>();
  public isLoading: boolean;

  constructor() {
  }

  ngOnInit() {
  }

  edit() {
    this.isLoading = true;
    this.editClick.emit(true);
    this.isLoading = false;
  }

}
