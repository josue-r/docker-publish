import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';

/**
 *
 *
 * In order to use this service you need to provide a configuration object of type RxStompConfig
 * using the function located in this same lib WebSocketServiceFactory ('./web-socket-service-factory').
 *
 * Example:
 *
 * ```ts
 * const MyRxStompConfig: RxStompConfig = {
 *   // Which server?
 *   brokerURL: environment.websocketUrl,
 *
 *   // Headers
 *   // Typical keys: login, passcode, host
 *   connectHeaders: {},
 *
 *   // How often to heartbeat?
 *   // Interval in milliseconds, set to 0 to disable
 *   heartbeatIncoming: 0, // Typical value 0 - disabled
 *   heartbeatOutgoing: 20000, // Typical value 20000 - every 20 seconds
 *
 *   // Wait in milliseconds before attempting auto reconnect
 *   // Set to 0 to disable
 *   // Typical value 500 (500 milli seconds)
 *   reconnectDelay: 500,
 * };
 * ```
 *
 * @export
 * @service WebSocketService
 */
@Injectable({
    providedIn: 'root',
})
export class WebSocketService extends RxStomp {
    constructor() {
        super();
    }
}
