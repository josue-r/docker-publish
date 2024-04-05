import { InjectionToken } from '@angular/core';

/** Allows injecting the Gateway URL in to  */
export const GATEWAY_TOKEN = new InjectionToken<string>('GATEWAY');
