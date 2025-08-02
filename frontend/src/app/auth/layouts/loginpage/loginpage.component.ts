import { Component } from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import {
  RouterOutlet,
  RouterLink,
  Router,
  NavigationEnd,
} from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  sequence,
} from '@angular/animations';

@Component({
  selector: 'app-loginpage.component',
  imports: [RouterOutlet, RouterLink, NgClass],
  templateUrl: './loginpage.component.html',
  styleUrl: './loginpage.component.scss',
  animations: [
    trigger('routeAnim', [
      transition('* <=> *', [
        /* Ambos componentes ocupan el mismo espacio */
        query(
          ':enter, :leave',
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }),
          { optional: true },
        ),

        /* Secuencia: sale ➜ entra */
        sequence([
          /* 1) Fade-out + slide Left del saliente */
          query(
            ':leave',
            animate(
              '1000ms ease',
              style({ opacity: 0, transform: 'translateX(-20px)' }),
            ),
            { optional: true },
          ),

          /* 2) Estado inicial del entrante (fuera de escena) */
          query(
            ':enter',
            style({ opacity: 0, transform: 'translateX(20px)' }),
            { optional: true },
          ),

          /* 3) Fade-in + slide a posición */
          query(
            ':enter',
            animate(
              '1000ms ease',
              style({ opacity: 1, transform: 'translateX(0)' }),
            ),
            { optional: true },
          ),
        ]),
      ]),
    ]),
  ],
})
export class LoginpageComponent {
  tabIndex = 0;
  private sub: Subscription;

  constructor(private router: Router) {
    this.sub = router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(
        (e) =>
          (this.tabIndex = e.urlAfterRedirects.includes('/signup') ? 1 : 0),
      );
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
