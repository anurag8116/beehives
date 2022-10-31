import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-recon-setting-detail',
  templateUrl: './recon-setting-detail.component.html'
})
export class ReconSettingDetailComponent implements OnInit {

  @Input() public reconSettingData: any = [];
  @Output() private editClick = new EventEmitter<boolean>();
  public settings = [];

  constructor(private router: Router, private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.settings = this.reconSettingData;
  }

  public edit() {
    this.editClick.emit(true);
  }

}
