import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {HttpClient, HttpClientModule} from "@angular/common/http";

interface CapturedImageData {
  imageAsDataUrl: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, NgIf, HttpClientModule],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './app.component.html',
})
export class AppComponent {
  @ViewChild('webCam') webCam?: ElementRef<HTMLVideoElement>;

  public hasError: boolean = false;
  public cameraStarted: boolean = false;
  public cameraStarting: boolean = false;
  public imageCaptured: boolean = false;
  public requestSent: boolean = false;
  public finished: boolean = false;
  public response: string | null = null;

  public imageData: CapturedImageData | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {

    console.log('Bewirb dich jetzt als webdeveloper bei teraone! - mail an pool@teroane.de')
  }

  startCamera(): void {
    this.cameraStarting = true;
    this.imageData = null;
    this.imageCaptured = false;
    this.requestSent = false;
    this.finished = false;
    this.cdr.detectChanges()
    if (!this.webCam) {
      console.log('no webcam.. trying again')
      this.startCamera()
      return;
    }
    this.cdr.detectChanges();
    navigator.mediaDevices?.getUserMedia({video: true})
      .then(stream => {
        this.cameraStarted = true;
        this.webCam!.nativeElement.srcObject = stream;
      })
      .catch(err => {
        alert('Leider konnte keine Kamera gefunden werden')
        this.cameraStarted = false;
        this.hasError = true;
      });
  }

  captureImage() {

    if (!this.webCam) {
      return;
    }
    const width = this.webCam.nativeElement.videoWidth;
    const height = this.webCam.nativeElement.videoHeight;
    this.webCam.nativeElement.pause();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.drawImage(this.webCam.nativeElement, 0, 0, width, height);


    const imageData = canvas.toDataURL('image/jpeg');

    this.imageData = {imageAsDataUrl: imageData};
    this.webCam.nativeElement.play();

    this.imageCaptured = true;
  }

  sendImage() {
    if (!this.imageData) {
      return;
    }


    this.requestSent = true;
    this.cdr.detectChanges();
    //add the loading class to body
    document.body.classList.add('loading');

    this.http.post('https://vogler-ai.teraone.workers.dev/', {
      image: this.imageData.imageAsDataUrl
    }, {
      responseType: 'text',
      observe: 'body',
    }).subscribe({
      next: (chunk) => {

        this.requestSent = false;
        this.finished = true;
        const s = JSON.parse(chunk)
        this.response = s.response
        this.cdr.detectChanges();

      },
      error: (error) => {
        console.error('Error:', error);
        this.requestSent = false;
        this.finished = true;
        this.response = 'NICHTS... da ist was schief gelaufen...';
        this.cdr.detectChanges();

      },
      complete: () => {
        //remove the loading class from body
        document.body.classList.remove('loading');
        this.cdr.detectChanges();
      },
    });

  }
}
