import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-transition',
  templateUrl: './page-transition.component.html',
  styleUrls: ['./page-transition.component.scss']
})
export class PageTransitionComponent implements OnInit {
  
  ngOnInit(): void {
    this.setupPageTransition();
  }
  
  setupPageTransition(): void {
    const exploreBtn = document.getElementById('exploreBtn');
    const pageTransition = document.getElementById('pageTransition');
    
    if (exploreBtn && pageTransition) {
      exploreBtn.addEventListener('click', function() {
        // Show page transition
        pageTransition.classList.add('active');
        
        // Simulate page load (would normally redirect to shop page)
        setTimeout(function() {
          pageTransition.classList.remove('active');
          // In a real implementation, this would be:
          // window.location.href = '/shop';
          alert('This would navigate to the Shop page in the full implementation!');
        }, 1500);
      });
    }
  }
}