import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tryon',
  templateUrl: './tryon.component.html',
  styleUrls: ['./tryon.component.scss']
})
export class TryonComponent implements OnInit {
  mode = 'video';
  constructor() { }

  ngOnInit(): void {
  }

  modeChage(modename:any) {
    this.mode = modename;
    console.log('this.mode',this.mode)
  }

}
