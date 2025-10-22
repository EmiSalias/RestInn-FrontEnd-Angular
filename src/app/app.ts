import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookiesBannerComponent } from "./components/cookies-banner/cookies-banner";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CookiesBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('RestInn-Frontend-Angular');
}
