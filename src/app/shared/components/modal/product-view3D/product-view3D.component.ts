import {
  Component, OnInit, OnDestroy, ViewChild, TemplateRef, Input,
  Injectable, PLATFORM_ID, Inject, Renderer2, ElementRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import '@google/model-viewer';
import { DomSanitizer } from '@angular/platform-browser';
declare let faceLandmarksDetection: any;
declare let AFRAME: any;
@Component({
  selector: 'app-product-view3D',
  templateUrl: './product-view3D.component.html',
  styleUrls: ['./product-view3D.component.scss']
})
export class view3DModalComponent implements OnInit, OnDestroy {

  redIcon = 'assets/images/red-close.png';
  greenIcon = 'assets/images/green-check.png';
  yellowIcon = 'assets/images/yellow-check.png';

  @Input() image3d
  @ViewChild("view3D", { static: false }) view3D: TemplateRef<any>;
  public closeResult: string;
  public modalOpen: boolean = false;
  mode = 'video';
  videomodestatus: boolean = false;
  imagemodestatus: boolean = false;
  modelSrc: string | ArrayBuffer | null = null;
  modelHTML: any
  modelImageHTML: any
  imageUrl: string | ArrayBuffer | null = null;
  canvasElement!: HTMLCanvasElement;
  imageElement!: HTMLImageElement;
  selectedMask!: HTMLImageElement;
  isVideo: boolean = false;
  model: any = null; // Replace 'any' with the appropriate type for your model
  cameraFrame: any = null; // Replace 'any' with the appropriate type for your cameraFrame
  detectFace: boolean = false;
  clearMask: boolean = false;
  maskOnImage: boolean = false;
  masks: any[] = []; // Replace 'any' with the appropriate type for your masks
  maskKeyPointIndexs: number[] = [10, 234, 152, 454]; // overhead, left Cheek, chin, right cheek
  seletedimage: any
  arSystem: any;
  cameraDetact: any;
  faceDetact: any;



  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef<HTMLDivElement>;
  @ViewChild('contentImageContainer', { static: false }) contentImageContainer: ElementRef<HTMLDivElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private modalService: NgbModal, private sanitizer: DomSanitizer, private renderer: Renderer2) { }

  async ngOnInit() {
    AFRAME.registerSystem('custom-ar', {
      init: function () {
        // Initialize your AR system here
        this.arSystem = this.sceneEl.systems["mindar-face-system"];
      }
    });
    this.cameraDetact = this.redIcon;
    this.faceDetact = this.redIcon;

  }

  async initializeAR() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const imageHtml = `
      <style>
      .loading {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 24px;
    }
    
    .spinner-border {
        width: 15rem;
        height: 15rem;
        position: absolute;
    }
      </style>
      <div id="image-container">
      <img width="100%" id="faces" src="">
      <div id="canvas"></div>
      <div class="loading d-none">
        Loading Model
        <div class="spinner-border" role="status">
          <span class="sr-only"></span>
        </div>
      </div>


      <div id="mask-slider" style="display: none;">
        <img id="arrowLeft" src="assets/images/arrow-left.png">
        <div id="mask-list">
          <ul>
            <li class="selected-mask"><img src="${this.seletedimage}" class="full-mask"
                data-mask-type="eye" data-scale-width="1.1" data-scale-height=".3"
                data-top-adj=".15" data-left-adj="-.15"></li>
          </ul>
        </div>
        <img id="arrowRight" src="assets/images/arrow-right.png">
      </div>
    </div>
    <div class="md-overlay"></div>`

      this.modelImageHTML = this.sanitizer.bypassSecurityTrustHtml(imageHtml);
      const unsafeHtml = ` 
      <style>
      /* Adjustments to make the resizable div */
      .example-container {
          border: 1px solid #ccc;
          resize: horizontal; /* Allow horizontal resizing */
          overflow: hidden; /* Enable scrolling if content overflows */
          min-width: 200px; /* Minimum width */
        }
    
        .example-container a-scene {
          width: 100% ; /* Make sure the scene fills the container */
          height: 500px ; /* Set scene height to fill the viewport */
        }
      </style>

      <a-scene mindar-face embedded color-space="sRGB" renderer="colorManagement: true, physicallyCorrectLights" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
      <a-assets>
        <a-asset-item id="headModel" src="assets/images/headOccluder.glb"></a-asset-item>
        <a-asset-item id="glassesModel" src="${this.modelSrc}"></a-asset-item>
      </a-assets>
      <a-camera fov="80" position="0 1.6 0"></a-camera>
  <!-- head occluder -->
      <a-entity  mindar-face-target="anchorIndex: 168">
    <a-gltf-model mindar-face-occluder position="0 -0.3 0.15"rotation="0 0 0" scale="0.065 0.065 0.065" src="#headModel"></a-gltf-model>
      </a-entity>
      <a-entity mindar-face-target="anchorIndex: 168">
    <a-gltf-model mindar-controls="none" rotation="0 -0 0" position="0 -.1 0" scale=".80 .80 .80" src="#glassesModel" class="glasses1-entity" ></a-gltf-model>
      </a-entity>
    </a-scene>
    `
      this.modelHTML = this.sanitizer.bypassSecurityTrustHtml(unsafeHtml);
      this.cameraDetact = this.greenIcon;
      //console.log('Camera Found')
      setTimeout(() => {
        document.querySelector('a-scene').addEventListener("targetFound", event => {
          this.faceDetact=this.greenIcon;
        });
        document.querySelector('a-scene').addEventListener("targetLost", event => {
          this.faceDetact=this.redIcon;
        });
        
      }, 0);

    } catch (error) {
      // Handle errors
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        const unsafeHtml = ``
        this.modelHTML = this.sanitizer.bypassSecurityTrustHtml(unsafeHtml);
        console.error('Camera not found:', error.message);
        this.cameraDetact = this.redIcon;
        // Display an error message to the user or take appropriate action
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        console.error('Camera permission denied:', error.message);
        this.cameraDetact = this.yellowIcon;
        // Prompt the user to allow camera access or take appropriate action
      } else {
        console.error('Error accessing the camera:', error.message);
        // Display a generic error message or take appropriate action
      }
    }
  }


  onFileSelected(event: any): void {
    // Select the image element by its ID
    const imgElement = document.getElementById('canvas mask_0');
    if (imgElement) {
      // Hide the image by setting its display property to 'none'
      imgElement.style.display = 'none';
    } else {
      console.error('Image element not found');
    }

    const file: File = event.target.files[0];
    if (file) {
      this.readFile(file);
      setTimeout(() => {
        if (imgElement) {
          imgElement.style.display = 'block';
        }

        this.startFacemask()
      }, 2000)
    }
    // this.imageUrl = 'assets/images/uttar.png';
    // setTimeout(()=>{
    //   this.startFacemask()
    // },2000)
  }

  startFacemask() {
    this.startFaceMask()
      .then(() => {
        this.maskOnImage = true;
        this.detectFaces();
      });
  }

  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result;
      // Get a reference to the image element using TypeScript
      const myImageElement = document.getElementById('faces') as HTMLImageElement;
      // Set the src attribute of the image element
      myImageElement.src = String(this.imageUrl);
      this.canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
      this.imageElement = document.getElementById('faces') as HTMLImageElement;
      this.selectedMask = document.querySelector(".selected-mask img") as HTMLImageElement;
    };
    reader.readAsDataURL(file);
  }


  async startFaceMask(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      document.querySelector(".loading")?.classList.remove('d-none');
      if (this.model == null) {
        this.model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
        //console.log("model loaded");
        this.cameraFrame = await this.detectFaces();
        document.querySelector(".loading")?.classList.add('d-none');
        resolve();
      } else if (!this.isVideo) {
        this.cameraFrame = await this.detectFaces();
        document.querySelector(".loading")?.classList.add('d-none');
        resolve();
      }
    });
  }

  async detectFaces(): Promise<void> {
    let inputElement = this.imageElement;
    let flipHorizontal = this.isVideo;
    //console.log('model ', this.model.estimateFaces)
    //console.log('inputElement ', inputElement)
    let predictions = await this.model.estimateFaces
      ({
        input: inputElement,
        returnTensors: false,
        flipHorizontal: flipHorizontal,
        predictIrises: false
      });
    //console.log('predictions ', predictions)
    let confident_predictions = predictions.filter(p => p.faceInViewConfidence > 0.5);
    this.drawMask(confident_predictions);
    if (this.clearMask) {
      this.clearCanvas();
      this.clearMask = false;
    }
    if (this.detectFace) {
      this.cameraFrame = requestAnimationFrame(this.detectFaces);
    }
  }

  drawMask(predictions: any[]): void {
    if (this.masks.length !== predictions.length) {
      this.clearCanvas();
    }
    let overheadIndex = 0;
    let chinIndex = 2;
    let leftCheekIndex = this.isVideo ? 3 : 1;
    let rightCheekIndex = this.isVideo ? 1 : 3;

    if (predictions.length > 0) {
      for (let x = 0; x < predictions.length; x++) {
        const keypoints = predictions[x].scaledMesh;  // 468 key points of face;

        let dots: any[];
        let maskElement: HTMLImageElement;

        if (this.masks.length > x) {
          dots = this.masks[x].keypoints;
          maskElement = this.masks[x].maskElement;
        } else {
          dots = [];
          maskElement = document.createElement("img");
          maskElement.src = this.selectedMask.src;
          maskElement.id = `mask_${x}`;
          maskElement.classList.add('mask');
          this.masks.push({
            keypoints: dots,
            maskElement: maskElement
          });
          this.canvasElement.appendChild(maskElement);
        }

        for (let i = 0; i < this.maskKeyPointIndexs.length; i++) {
          const coordinate = this.getCoordinate(keypoints[this.maskKeyPointIndexs[i]][0], keypoints[this.maskKeyPointIndexs[i]][1]);
          let dot: any;

          if (dots.length > i) {
            dot = dots[i];
          } else {
            let dotElement = document.createElement("div");
            dotElement.classList.add('dot');
            dot = { top: 0, left: 0, element: dotElement };
            dots.push(dot);
            this.canvasElement.appendChild(dotElement);
          }

          dot.left = coordinate[0];
          dot.top = coordinate[1];
          dot.element.style.top = `${dot.top}px`;
          dot.element.style.left = `${dot.left}px`;
          dot.element.style.position = 'absolute';
        }

        let maskType = this.selectedMask.getAttribute("data-mask-type");
        let maskCoordinate, maskHeight, maskWidth, maskSizeAdjustmentWidth, maskSizeAdjustmentHeight, maskSizeAdjustmentTop, maskSizeAdjustmentLeft;
        let maskTop, maskLeft;

        switch (maskType) {
          case 'eye':
            maskCoordinate = { top: dots[overheadIndex].top, left: dots[leftCheekIndex].left };
            maskHeight = (dots[chinIndex].top - dots[overheadIndex].top);
            break;
          case 'full':
            maskCoordinate = { top: dots[overheadIndex].top, left: dots[leftCheekIndex].left };
            maskHeight = (dots[chinIndex].top - dots[overheadIndex].top);
            break;
          case 'half':
          default:
            maskCoordinate = dots[leftCheekIndex];
            maskHeight = (dots[chinIndex].top - dots[leftCheekIndex].top);
            break;
        }

        maskWidth = (dots[rightCheekIndex].left - dots[leftCheekIndex].left);
        maskSizeAdjustmentWidth = parseFloat(this.selectedMask.getAttribute("data-scale-width") || '0');
        maskSizeAdjustmentHeight = parseFloat(this.selectedMask.getAttribute("data-scale-height") || '0');
        maskSizeAdjustmentTop = parseFloat(this.selectedMask.getAttribute("data-top-adj") || '0');

        maskSizeAdjustmentLeft = parseFloat(this.selectedMask.getAttribute("data-left-adj") || '0');

        maskTop = maskCoordinate.top - ((maskHeight * (maskSizeAdjustmentHeight - 1)) / 2) - (maskHeight * maskSizeAdjustmentTop);
        maskLeft = maskCoordinate.left - ((maskWidth * (maskSizeAdjustmentWidth - 1)) / 2) - (maskWidth * maskSizeAdjustmentLeft);

        maskElement.style.top = `${maskTop}px`;
        maskElement.style.left = `${maskLeft}px`;
        maskElement.style.width = `${maskWidth * maskSizeAdjustmentWidth}px`;
        maskElement.style.height = `${maskHeight * maskSizeAdjustmentHeight}px`;
        maskElement.style.position = 'absolute';
      }
    }
  }

  getCoordinate(x: number, y: number): number[] {
    return [x, y];
  }

  clearCanvas(): void {
    while (this.canvasElement.firstChild) {
      this.canvasElement.removeChild(this.canvasElement.lastChild as Node);
    }
    this.masks = [];
  }

  switchSource(): void {
    this.canvasElement.style.transform = "";
    const containerElement = document.getElementById("image-container") as HTMLElement;
    document.getElementById("button-control")?.classList.remove("d-none");
    this.canvasElement.style.width = `${this.imageElement.clientWidth}px`;
    this.canvasElement.style.height = `${this.imageElement.clientHeight}px`;
    containerElement.appendChild(this.canvasElement);
    containerElement.appendChild(document.querySelector(".loading") as Node);
    containerElement.appendChild(document.getElementById("mask-slider") as Node);
    this.clearCanvas();
  }
  modeChage(modename: any) {
    this.mode = modename;
    //console.log('this.mode', this.mode)
  }


  openModal() {
    console.log('imageUrl==============', this.imageUrl);
    this.modelSrc = this.image3d.Threed_Tryon;
    this.seletedimage = this.image3d.Twod_Tryon;
    this.modalOpen = true;
    this.initializeAR();

    if (isPlatformBrowser(this.platformId)) {
      this.modalService.open(this.view3D, {
        size: 'md',
        ariaLabelledBy: 'view3d-modal',
        centered: true,
        windowClass: 'view3D'
      }).result.then((result) => {
        //console.log(`Result: ${result}`);
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
  }


  private getDismissReason(reason: any): string {
    this.modelHTML = '';
    this.modelImageHTML = '';
    this.mode = 'video';

    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnDestroy() {
    if (this.modalOpen) {
      this.modalService.dismissAll();
      this.imageUrl = '';
      this.mode = 'video';
      this.modelHTML = '';
      this.modelImageHTML = '';
    }

  }


}
