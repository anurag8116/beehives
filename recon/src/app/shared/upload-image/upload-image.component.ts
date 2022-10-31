import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html'
})
export class UploadImageComponent implements OnInit {

  public fileName: string;
  @Output() public onFileSelect: any = new EventEmitter<{filePath: string, fileName: string, events: any}>();
  constructor() { }

  ngOnInit() {
    this.fileName = '';
  }

  HideBorder() {
    const myInput = document.getElementById('myInput').style;
    myInput.borderStyle = 'none';
  }

  public fileChangeEvent(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = (events: any) => {
        this.fileName = file.name;
        this.onFileSelect.emit({filePath: reader.result.split(',')[1], fileName: file.name, events: events.target.result});
      };
    }
  }
}
