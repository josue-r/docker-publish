/** Event data to send to google */
export interface GoogleAnalyticsEvent {
    eventCategory: string;
    eventAction: string;
    eventLabel?: string;
    eventValue?: number;
}
