import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Only run sparkle generation on the browser
    if (isPlatformBrowser(this.platformId)) {
      // Wait for DOM to be ready
      setTimeout(() => {
        this.generateSparkles();
      }, 0);
    }
  }

  generateSparkles(): void {
    const container = document.getElementById('sparkle-container');
    console.log('Sparkle container found:', !!container);

    if (!container) return;
    
    const sparkleCount = 30;
    const heroSection = container.closest('.hero');
    console.log('Hero section found:', !!heroSection);
    
    if (!heroSection) return;
    
    // Get hero section dimensions
    const heroWidth = heroSection.clientWidth;
    const heroHeight = heroSection.clientHeight;

    console.log('Hero dimensions:', heroSection.clientWidth, 'x', heroSection.clientHeight);
    
    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.classList.add('sparkle');
      
      // Random position within hero section
      const posX = Math.random() * heroWidth;
      const posY = Math.random() * heroHeight;
      
      sparkle.style.left = `${posX}px`;
      sparkle.style.top = `${posY}px`;
      
      // Random size - slightly larger for more visibility
      const size = Math.random() * 4 + 2;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      
      // Random delay and duration
      sparkle.style.animationDelay = `${Math.random() * 10}s`;
      sparkle.style.animationDuration = `${Math.random() * 3 + 2}s`;
      
      container.appendChild(sparkle);
      console.log('Created sparkle', i);
    }
  }
}