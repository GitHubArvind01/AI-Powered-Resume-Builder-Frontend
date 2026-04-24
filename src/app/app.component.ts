import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStateService } from './services/auth-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private authState = inject(AuthStateService);
  title = 'quantity-measurement-app-frontend';

  ngOnInit(): void {
    this.authState.initialize().subscribe();
  }
}
