import { Component } from '@angular/core';

import { CommonModule, NgIf } from '@angular/common';


@Component({
  selector: 'app-cookies-banner',
  templateUrl: './cookies-banner.html',
  styleUrls: ['./cookies-banner.css'],
  imports: [NgIf]
})
export class CookiesBanner {
  showBanner = !localStorage.getItem('cookiesAccepted');

  acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    this.showBanner = false;
  }

  rejectCookies() {
    this.showBanner = false;
  }
}
