import { AsyncPipe} from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoadingService } from '../../services/loading-service.service';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';

@Component({
selector: 'app-loading-indicator',
  templateUrl: "./loading-indicator.component.html",
  styleUrls: ["./loading-indicator.component.css"],
  imports: [AsyncPipe],
  standalone: true,
})
export class LoadingIndicatorComponent implements OnInit {

  loading$: Observable<boolean>;

  @Input()
  detectRouteTransitions = false;

  constructor(
  private loadingService: LoadingService, private router: Router) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit() {
    if (this.detectRouteTransitions) {
      this.router.events
        .pipe(
          tap((event) => {
            if (event instanceof RouteConfigLoadStart) {
              this.loadingService.loadingOn();
            } else if (event instanceof RouteConfigLoadEnd) {
              this.loadingService.loadingOff();
            }
          })
        )
        .subscribe();
    }
  }
}
  
