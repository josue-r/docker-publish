import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { appRoutes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { environment } from '../environments/environment';
import { WebSocketService, WebSocketServiceFactory } from '@vioc-angular/shared/common-websocket';
import { MyRxStompConfig } from './websocket/rx-stomp.config';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppStatusService } from '@vioc-angular/bottom-side-ui/config/app-status';

export function initializeWebSocket() {
    return WebSocketServiceFactory(MyRxStompConfig);
}

export const appConfig: ApplicationConfig = {
    providers: [
        AppStatusService,
        provideRouter(appRoutes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
        importProvidersFrom(HttpClientModule),
        { provide: GATEWAY_TOKEN, useValue: environment.gateway },
        {
            provide: WebSocketService,
            useFactory: initializeWebSocket,
        },
        importProvidersFrom([BrowserAnimationsModule]),
    ],
};
