import { Params } from '@angular/router';

export interface LoginRedirect {
    /** The segments of the route path */
    segments: string[];
    /** Any query params associated with the route. */
    queryParams: Params;
}
