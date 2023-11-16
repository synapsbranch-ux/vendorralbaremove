import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-video-mode',
  templateUrl: './video-mode.component.html',
  styleUrls: ['./video-mode.component.scss']
})
export class VideoModeComponent implements OnInit {
  modelSrc = 'https://ralbaassetstorage.s3.us-east-2.amazonaws.com/product/pro-1698997429.glb'
  constructor() { }

  ngOnInit(): void {
  }

}
