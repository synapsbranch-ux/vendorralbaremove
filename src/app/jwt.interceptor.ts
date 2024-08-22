import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(map(event => {
      if (event instanceof HttpResponse) {
        if (event.body['error'] == 1) {
          localStorage.removeItem('user_token');
          localStorage.removeItem('cartItems');
          localStorage.removeItem('user_id');
          window.location.reload();

          console.log(event);
        }
      }
      return event;
    }));
  }
}
