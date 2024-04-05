/**
 * Standard error details that provided additional information from errors thrown by the VIOC APIs.
 */
export interface ApiDetailedError {
    messageKey: string;
    developerMessage: string;
    messageParams: string[];
}
