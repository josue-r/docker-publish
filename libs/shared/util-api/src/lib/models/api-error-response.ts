import { ApiError } from './api-error';

/**
 * Standard error response for VIOC API calls.
 */
export interface ApiErrorResponse {
    apiVersion: string;
    error: ApiError;
}

/**
 * Checks to see if the object passed in is an instance of the `ApiErrorResponse`.
 */
export function instanceOfApiErrorResponse(object: any): object is ApiErrorResponse {
    return object !== null && object !== undefined && object.apiVersion !== undefined && object.error !== undefined;
}
