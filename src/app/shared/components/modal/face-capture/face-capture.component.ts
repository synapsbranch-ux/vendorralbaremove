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
  lastDetectionTime: number = 0;
  alignmentStartTime: number | null = null;
  alignmentDurationThreshold = 2000; // 2 seconds
  countdownValue: number | null = null;
  countdownInterval: any = null;
  countdownTimeout: any = null;
  constructor(private sanitizer: DomSanitizer) { }

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
        audio: false,
      });

      const video = this.videoElement.nativeElement;

      // Stop previous stream if any
      if (video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }

      video.srcObject = stream;

      video.onloadedmetadata = async () => {
        await video.play();  // Ensures mobile support
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
    const now = Date.now();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const ovalCenterX = canvas.width / 2;
    const ovalCenterY = canvas.height / 2;
    const ovalRadiusX = 150;
    const ovalRadiusY = 200;
    const eyeOffsetY = -40;
    const eyeY = ovalCenterY + eyeOffsetY;

    // Dim outside the oval
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.ellipse(ovalCenterX, ovalCenterY, ovalRadiusX, ovalRadiusY, 0, 0, Math.PI * 2);
    ctx.fill('evenodd');

    // Oval outline
    const pulse = 3 + Math.sin(now / 300) * 1.5;
    ctx.beginPath();
    ctx.lineWidth = pulse;
    ctx.setLineDash([]);
    ctx.strokeStyle = this.isAligned ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)';
    ctx.ellipse(ovalCenterX, ovalCenterY, ovalRadiusX, ovalRadiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Nose vertical guide line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,255,0,0.6)';
    ctx.lineWidth = 4;
    ctx.setLineDash([2, 6]);
    ctx.moveTo(ovalCenterX, ovalCenterY - ovalRadiusY);
    ctx.lineTo(ovalCenterX, ovalCenterY + ovalRadiusY);
    ctx.stroke();

    // Eye horizontal line guide
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(0,255,0,0.4)';
    ctx.lineWidth = 4;
    ctx.moveTo(ovalCenterX - ovalRadiusX, eyeY);
    ctx.lineTo(ovalCenterX + ovalRadiusX, eyeY);
    ctx.stroke();

    // Throttle detection every 100ms
    if (now - this.lastDetectionTime > 100) {
      this.lastDetectionTime = now;

      try {
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
          const isNoseCentered = Math.abs(nose.x - ovalCenterX) < 20; // more flexible

          const leftEye = landmarks.getLeftEye()[0];
          const rightEye = landmarks.getRightEye()[3];
          const avgEyeY = (leftEye.y + rightEye.y) / 2;
          const isFaceLevel = Math.abs(avgEyeY - eyeY) < 40; // more flexible

          const faceWidth = box.width;
          const isZoomCorrect = faceWidth >= 240 && faceWidth <= 320; // wider range

          this.isAligned = fitsInsideOval && isNoseCentered && isFaceLevel && isZoomCorrect;

          // if (!this.isAligned) this.captured = false;
          if (this.isAligned) {
            if (!this.alignmentStartTime) {
              this.alignmentStartTime = now;

              // Start countdown
              this.startCountdown();
            }

            const timeAligned = now - this.alignmentStartTime;
            if (timeAligned >= this.alignmentDurationThreshold && !this.captured) {
              this.captureSelfie();
              this.clearCountdown();
            }
          } else {
            this.alignmentStartTime = null;
            this.captured = false;
            this.clearCountdown();
          }
        } else {
          this.isAligned = false;
        }
      } catch (err) {
        console.warn('Face detection error:', err);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.detectLoop);
  };

  startCountdown() {
    this.countdownValue = 3;
    this.countdownInterval = setInterval(() => {
      if (this.countdownValue && this.countdownValue > 1) {
        this.countdownValue--;
      } else {
        this.clearCountdown();
      }
    }, 700); // slightly faster for better UX
  }

  clearCountdown() {
    this.countdownValue = null;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }



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
