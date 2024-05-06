import { Router } from '@angular/router';
import { Component, OnInit, Input, HostListener } from '@angular/core';

@Component({
  selector: 'app-footer-one',
  templateUrl: './footer-one.component.html',
  styleUrls: ['./footer-one.component.scss']
})
export class FooterOneComponent implements OnInit {

  @Input() class: string = 'footer-light' // Default class 
  @Input() themeLogo: string = 'assets/images/icon/logo_small_res.png' // Default Logo
  @Input() newsletter: boolean = true; // Default True
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: Event): void {
    event.preventDefault(); // Prevent default behavior (e.g., context menu)
    event.stopPropagation(); // Stop event propagation to parent elements
  }
  public today: number = Date.now();

  constructor(private router: Router) { }

  ngOnInit(): void {

  }

  redirectcat(url:any)
  {
    this.router.navigate([url])
    .then(() => {
        window.location.reload();
    });
  }

}
