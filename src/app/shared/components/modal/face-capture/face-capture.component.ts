import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  EventEmitter,
  Output,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-face-capture',
  templateUrl: './face-capture.component.html',
  styleUrls: ['./face-capture.component.scss'],
})
export class FaceCaptureComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @Output() selfieCaptured = new EventEmitter<string>();
  readonly ovalRadiusX = 150;
  readonly ovalRadiusY = 200;
  selfie: string | null = null;
  safeSelfieUrl: SafeUrl | null = null;
  isAligned = false;
  captured = false;
  animationFrameId: number | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  async ngOnInit() {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
    ]);
  }

  ngAfterViewInit() {
    this.startVideo();
  }

  ngOnDestroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    const stream = this.videoElement.nativeElement.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
  }

  async startVideo() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasVideoInput = devices.some(device => device.kind === 'videoinput');

    if (!hasVideoInput) throw new Error('No video input device found');

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 },
        aspectRatio: 4 / 3,
      },
    });

    const video = this.videoElement.nativeElement;
    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();
      const canvas = this.canvasElement.nativeElement;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      this.detectLoop();
    };
  } catch (err) {
    console.error('Webcam error:', err);
    alert('Unable to access webcam. Please ensure it is connected and allowed.');
  }
}


  detectLoop = async () => {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const ovalCenterX = canvas.width / 2;
    const ovalCenterY = canvas.height / 2;
    const ovalRadiusX = 150;
    const ovalRadiusY = 200;

    // Draw dim overlay with oval cutout
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.ellipse(ovalCenterX, ovalCenterY, ovalRadiusX, ovalRadiusY, 0, 0, Math.PI * 2);
    ctx.fill('evenodd');

    // Vertical dotted green line for nose alignment
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    for (let y = -ovalRadiusY; y <= ovalRadiusY; y++) {
      const x = ovalCenterX;
      const yCoord = ovalCenterY + y;
      if (y === -ovalRadiusY) ctx.moveTo(x, yCoord);
      else ctx.lineTo(x, yCoord);
    }
    ctx.stroke();

    // Curved horizontal dotted line for eye level
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    const curveYOffset = -40;
    for (let x = -ovalRadiusX; x <= ovalRadiusX; x++) {
      const xCoord = ovalCenterX + x;
      const yOffset = 0.2 * Math.sin((x / ovalRadiusX) * Math.PI);
      const yCoord = ovalCenterY + curveYOffset + yOffset * 15;
      if (x === -ovalRadiusX) ctx.moveTo(xCoord, yCoord);
      else ctx.lineTo(xCoord, yCoord);
    }
    ctx.stroke();
    ctx.restore();

    // === Face Detection and Validations ===
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (detection) {
      const box = detection.detection.box;
      const landmarks = detection.landmarks;

      const fitsInsideOval =
        box.x > ovalCenterX - ovalRadiusX &&
        box.y > ovalCenterY - ovalRadiusY &&
        box.x + box.width < ovalCenterX + ovalRadiusX &&
        box.y + box.height < ovalCenterY + ovalRadiusY;

      const nose = landmarks.getNose()[3];
      const isNoseCentered = Math.abs(nose.x - ovalCenterX) < 10;

      const leftEye = landmarks.getLeftEye()[0];
      const rightEye = landmarks.getRightEye()[3];
      const avgEyeY = (leftEye.y + rightEye.y) / 2;
      const isFaceLevel = Math.abs(avgEyeY - (ovalCenterY + curveYOffset)) < 20;

      const faceWidth = box.width;
      const isZoomCorrect = faceWidth >= 260 && faceWidth <= 300;

      this.isAligned = fitsInsideOval && isNoseCentered && isFaceLevel && isZoomCorrect;

      if (!this.isAligned) this.captured = false;
    } else {
      this.isAligned = false;
    }

    this.animationFrameId = requestAnimationFrame(this.detectLoop);
  };

  captureSelfie() {
  const video = this.videoElement.nativeElement;
  const canvas = this.canvasElement.nativeElement;

  const ovalRadiusX = 150;
  const ovalRadiusY = 200;
  const ovalCenterX = canvas.width / 2;
  const ovalCenterY = canvas.height / 2;

  const cropX = ovalCenterX - ovalRadiusX;
  const cropY = ovalCenterY - ovalRadiusY;
  const cropW = ovalRadiusX * 2;
  const cropH = ovalRadiusY * 2;

  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d')!;

  cropCanvas.width = cropW;
  cropCanvas.height = cropH;

  // Draw cropped area
  cropCtx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  // Apply oval mask
  cropCtx.globalCompositeOperation = 'destination-in';
  cropCtx.beginPath();
  cropCtx.ellipse(cropW / 2, cropH / 2, cropW / 2, cropH / 2, 0, 0, Math.PI * 2);
  cropCtx.fill();

  const dataUrl = cropCanvas.toDataURL('image/png');
  this.selfie = dataUrl;
  this.safeSelfieUrl = this.sanitizer.bypassSecurityTrustUrl(dataUrl);
  this.captured = true;
  this.selfieCaptured.emit(dataUrl);
}

}
