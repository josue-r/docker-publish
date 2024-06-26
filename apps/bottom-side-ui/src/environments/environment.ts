// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --configuration=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular.json`.

export const environment = {
    production: 'false',
    environmentName: 'dev',
    gateway: 'https://apis.dev.vioc.valvoline.com/',
    deployUrl: '',
    version: 'UNKNOWN',
    websocketUrl: 'wss://store-local.app.valvoline.com:443/pos/store-websocket/websocket',
};
