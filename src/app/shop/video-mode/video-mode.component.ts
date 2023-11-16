import { AfterViewInit, Component, ElementRef, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-video-mode',
  templateUrl: './video-mode.component.html',
  styleUrls: ['./video-mode.component.scss']
})
export class VideoModeComponent implements OnInit, AfterViewInit, OnChanges {
  modelSrc = 'https://ralbaassetstorage.s3.us-east-2.amazonaws.com/product/pro-1698997429.glb'
  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // const arContainer = this.elRef.nativeElement.querySelector('#video_data');

    // const arHtml = `
    //   <a-scene mindar-face embedded color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
    //     <a-assets>
    //       <a-asset-item id="headModel" src="assets/images/headOccluder.glb"></a-asset-item>
    //       <a-asset-item id="glassesModel" src="assets/images/pro-1698997429.glb"></a-asset-item>
    //     </a-assets>
    //     <a-camera fov="80" position="0 1.6 0"></a-camera>
    //     <!-- head occluder -->
    //     <a-entity mindar-face-target="anchorIndex: 168">
    //       <a-gltf-model mindar-face-occluder position="0 -0.3 0.15" rotation="0 0 0" scale="0.065 0.065 0.065" src="#headModel"></a-gltf-model>
    //     </a-entity>
    //     <a-entity mindar-face-target="anchorIndex: 168">
    //       <a-gltf-model rotation="0 -0 0" position="0 -.1 0" scale=".80 .80 .80" src="#glassesModel" class="glasses1-entity"></a-gltf-model>
    //     </a-entity>
    //   </a-scene>
    // `;

    // // Add kora HTML string ti div er moddhe append kora
    // arContainer.innerHTML = arHtml;
    // let canvas = document.getElementsByTagName("canvas"); 
    // canvas.width = 511;

  }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log('changes',changes)
    // console.log("canvas" , document.getElementsByTagName("canvas"))
  }

  onFrameLoad() {
    console.log('Frame loaded');
    // Access the iframe content
    const iframe = document.querySelector('iframe');
    const iframeContentWindow = iframe.contentWindow;
    if (iframeContentWindow) {
      iframeContentWindow.navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          console.log('Camera access granted');
          // Handle the stream or perform further actions
        })
        .catch((error) => {
          console.error('getUserMedia error:', error);
          // Handle permission denied error here within the iframe content
          // Display a message to the user guiding them on enabling camera access
        });
    }

    // Request camera access within the iframe content
    // if (iframe) {
    //   iframe.addEventListener('load', () => {

    //   });
    // }
  }

}
