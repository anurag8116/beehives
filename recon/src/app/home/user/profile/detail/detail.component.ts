import {Component, OnChanges, OnInit} from '@angular/core';
import {AppConstants} from '../../../../shared/services/app.constants';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '../../../../shared/services/http-service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {

  public id: number;
  public profilePic;
  public userDetail: any = {};
  public salutation: any;
  public SPACE = ' ';

  constructor(private httpService: HttpService, private router: Router, private domSanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.id = +localStorage.getItem(AppConstants.USER_ID);
    this.onURLinserted('v1/profiles/image');
    this.httpService.get('v1/profiles', true).subscribe(
      (data: any) => {
        this.userDetail = data;
        if (data.gender === 'Male') {
          this.salutation = 'Mr.';
        } else if (data.gender === 'Female') {
          this.salutation = 'Mr.';
        }
      }
    );
  }

  onURLinserted(url) {
    this.httpService.loadImage(url).subscribe(data => {
      this.createImageFromBlob(data);
    }, error => {
      console.log('Error occured', error);
    });
  }

  createImageFromBlob(image) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.profilePic = this.domSanitizer.bypassSecurityTrustUrl(reader.result);
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  edit() {
    this.router.navigate(['/home/user/full', 'profile', {outlets: {'fullBodyOutlet': ['update']}}]);
  }

}
