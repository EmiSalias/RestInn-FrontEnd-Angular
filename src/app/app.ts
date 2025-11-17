import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookiesBanner } from "./components/cookies-banner/cookies-banner";
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { LoadingOverlay } from './components/loading-overlay/loading-overlay';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CookiesBanner, CookiesBanner, LoadingOverlay],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('RestInn-Frontend-Angular');
}
