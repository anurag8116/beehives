import {Component, EventEmitter, OnInit, Output, Input} from '@angular/core';
import {HttpService} from '../../../../shared/services/http-service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {

  @Input() public passwordPolicy: any = {};
  @Output() private onEdit = new EventEmitter<boolean>();

  constructor(private http: HttpService) {
  }

  ngOnInit() {
  }

  public edit() {
    this.onEdit.emit(true);
  }

}
