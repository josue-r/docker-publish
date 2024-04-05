import { WebSocketService } from './web-socket.service';
import { RxStompConfig } from '@stomp/rx-stomp';

export function WebSocketServiceFactory(config: RxStompConfig) {
    const rxStomp = new WebSocketService();
    rxStomp.configure(config);
    rxStomp.activate();
    return rxStomp;
}
