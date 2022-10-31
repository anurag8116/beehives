import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup} from '@angular/forms';
import {HttpService} from '../../../../shared/services/http-service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {DomSanitizer} from '@angular/platform-browser';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public userDetail: any = {};
  public isLoading: boolean;
  public profilePic;
  public form: FormGroup;
  public fileName: string;
  public url: any;
  public defaultImage = 'assets/images/avatar.png';

  constructor(private httpService: HttpService, private router: Router, private domSanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      firstName: new FormControl(),
      lastName: new FormControl(),
      email: new FormControl(),
      mobile: new FormControl(),
      profilePicture: new FormControl(),
      fileName: new FormControl(),
    });
    this.onURLinserted('v1/profiles/image');
    this.httpService.get('v1/profiles', true).subscribe(
      (data: any) => {
        this.userDetail = data;
        this.form.patchValue(data);
      }
    );
  }

  public fileChangeEvent(event: any) {
    this.isLoading = true;
    $('.show-added-photo').attr('src', event.events);
    this.form.patchValue({profilePicture: event.filePath, fileName: event.fileName});
  }

  remove() {
    this.profilePic = this.defaultImage;
    this.form.get('profilePicture').patchValue(null);
    this.form.get('fileName').patchValue(null);
  }

  submit() {
    this.httpService.put('v1/profiles', this.form.getRawValue(), true).subscribe(
      (data: any) => {
        this.router.navigate(['/home/user/full', 'profile', {
          outlets: {
            'fullBodyOutlet': ['detail'],
          }
        }]);
        this.httpService.displaySuccessOnPopUp('Profile Successfully Updated!');
        this.cancel();
      },
    );
  }

  cancel() {
    this.router.navigate(['/home/user/full', 'profile', {
      outlets: {
        'fullBodyOutlet': ['detail'],
      }
    }]);
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

}
