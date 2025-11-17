import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
isSliding = false

constructor(private router : Router){}
    startSlide() {
    this.isSliding = true;

    // Wait for animation to complete, then navigate
    setTimeout(() => {
      this.router.navigate(['/signin']);
    }, 700); // matches CSS animation time
  }
}
  /*items = Array.from({ length: 4 }, () => 0);

increment(index: number) {
    // mutate then create a new array reference so Angular picks up the change reliably
    this.items[index]++; //
    this.items = [...this.items]; // <- forces change detection for bindings that rely on a new reference
  }
  trackByIndex(index: number) { return index; }*/

