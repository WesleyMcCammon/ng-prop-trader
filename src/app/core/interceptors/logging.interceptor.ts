import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  return next(req).pipe(
    tap({
      error: err => console.error(`[HTTP] Error on ${req.url}:`, err.message)
    })
  );
};
