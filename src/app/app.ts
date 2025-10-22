import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookiesBanner } from "./components/cookies-banner/cookies-banner";
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CookiesBanner, CookiesBanner],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('RestInn-Frontend-Angular');
}
