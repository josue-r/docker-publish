import { ApiDetailedError } from './api-detailed-error';

/**
 * Standard error for errors thrown by the VIOC APIs.
 */
export interface ApiError {
    status: string;
    timestamp: Date;
    uuid: string;
    path: string;
    messageKey: string;
    developerMessage: string;
    errors?: ApiDetailedError[];
}
