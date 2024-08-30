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
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor( private router: Router) { }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(map(event => {
      if (event instanceof HttpResponse) {
        if (event.body['error'] == 1) {
          if(event.body['message'] == 'Authorization Failed : jwt expired')
          {
            event.body['data']=[];
            localStorage.removeItem('u_token');
            localStorage.removeItem('cartItems');
            localStorage.removeItem('user_');
            this.router.navigateByUrl('login')
          }
          console.log('event Error JWT',event)

          console.log(event);
        }
      }
      return event;
    }));
  }
}
