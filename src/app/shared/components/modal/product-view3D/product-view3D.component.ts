import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, Input,
  Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import '@google/model-viewer';

@Component({
  selector: 'app-product-view3D',
  templateUrl: './product-view3D.component.html',
  styleUrls: ['./product-view3D.component.scss']
})
export class view3DModalComponent implements OnInit, OnDestroy  {


  @Input() image3d

  @ViewChild("view3D", { static: false }) view3D: TemplateRef<any>;
  modelSrc: string;
  public closeResult: string;
  public modalOpen: boolean = false;
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  openModal() {
    this.modalOpen = true;
  
    if (isPlatformBrowser(this.platformId)) {
      this.modelSrc=this.image3d;
      this.modalService.open(this.view3D, { 
        size: 'md',
        ariaLabelledBy: 'view3d-modal',
        centered: true,
        windowClass: 'view3D' 
      }).result.then((result) => {
        console.log(`Result: ${result}`);
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
  }
  
  
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnDestroy() {
    if(this.modalOpen){
      this.modalService.dismissAll();
    }
  }

}
