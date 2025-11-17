import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { HomeComponent } from './home/home.component';
import { CommonModule, NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import { CreateNoteComponent } from './create-note/create-note.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SignupComponent, SigninComponent, HomeComponent, CommonModule, NgIf, CreateNoteComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'my_app';
  isHomePage = false;
  isMenuActive = false;
  isLightTheme = false;

  constructor(private router: Router, private renderer : Renderer2,
    @Inject(DOCUMENT) private document: Document 
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd){
        this.isHomePage = event.urlAfterRedirects === '/home';
      }
    });
  }

  ngOnInit() {
    if(typeof window !== 'undefined'){
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('light-theme', 'dark-theme');
      document.documentElement.classList.add(savedTheme);
    }
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const nav = event as NavigationEnd;
        this.isHomePage = nav.urlAfterRedirects === '/home'; 
      });
  }
}

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
    console.log('Menu active:', this.isMenuActive);
  }

toggleTheme() {
  this.isLightTheme = !this.isLightTheme;

  const theme = this.isLightTheme ? 'light-theme' : 'dark-theme';

  document.documentElement.classList.remove('light-theme', 'dark-theme');
  document.documentElement.classList.add(theme);

  localStorage.setItem('theme', theme);
}

}
