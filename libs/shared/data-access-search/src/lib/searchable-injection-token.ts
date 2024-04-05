import { InjectionToken } from '@angular/core';
import { Searchable } from './models/searchable';

/**
 * Allows the injection of a `Searchable` facade into the `SearchFacade`.
 */
export const SEARCHABLE_TOKEN = new InjectionToken<Searchable<any>>('SEARCHABLE_FACADE');
