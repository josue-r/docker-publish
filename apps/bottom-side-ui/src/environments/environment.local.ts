//
// This will connect to the CF dev instance by default.  If you wish to connect to a local instance, update the appropriate URL in the
// corresponding api class.
//
export const environment = {
    production: 'false',
    environmentName: 'local',
    gateway: 'http://localhost:9023',
    deployUrl: '',
    version: 'LOCAL',
    websocketUrl: 'wss://store-local.app.valvoline.com:8443/pos/store-websocket/websocket',
};
