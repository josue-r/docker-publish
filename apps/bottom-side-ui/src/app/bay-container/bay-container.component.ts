import { Component, OnDestroy, OnInit, Input as RouterParam } from '@angular/core';
import { MaterialSvgIconsLoaderService } from '@vioc-angular/shared/util-assets';
import { HeaderComponent } from '@vioc-angular/bottom-side-ui/header';
import { AppStatusService } from '@vioc-angular/bottom-side-ui/config/app-status';
import { WebSocketService } from '@vioc-angular/shared/common-websocket';
import { Message } from '@stomp/stompjs';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { BaseStoreEvent, EventType, EventTypeEnum } from '@vioc-angular/shared/common-event-models';
import { CardAirFilterComponent } from '@vioc-angular/bottom-side-ui/card-air-filter';
import { CardCabinAirFilterComponent } from '@vioc-angular/bottom-side-ui/card-cabin-air-filter';
import { CardOilFilterComponent } from '@vioc-angular/bottom-side-ui/card-oil-filter';
import { CardOilFilterChangeComponent } from '@vioc-angular/bottom-side-ui/card-oil-filter-change';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        HeaderComponent,
        CardAirFilterComponent,
        CardOilFilterComponent,
        CardCabinAirFilterComponent,
        CardOilFilterChangeComponent,
    ],
    selector: 'vioc-angular-bay-container',
    templateUrl: './bay-container.component.html',
    styleUrls: ['./bay-container.component.scss'],
})
export class BayContainerComponent implements OnInit, OnDestroy {
    private readonly logger = Loggers.get('central-ui', 'BayContainerComponent');
    private webSocketSubscription: Subscription;
    readonly EventTypeEnum = EventTypeEnum;

    private _bayId: string;

    @RouterParam() set bayId(value: string) {
        this._bayId = value;
    }

    get bayId(): string {
        return this._bayId;
    }

    vehicleToEngineConfigId: number;
    eventType: EventType;

    constructor(
        private readonly svgIconsLoader: MaterialSvgIconsLoaderService,
        private readonly webSocketService: WebSocketService,
        private readonly appStatusService: AppStatusService
    ) {
        svgIconsLoader.loadIcons();
    }

    ngOnInit(): void {
        this.webSocketSubscription = this.webSocketService.watch('/store-events').subscribe((message: Message) => {
            const parsedEvent = BaseStoreEvent.fromJsonString(message.body);
            if (parseInt(this.bayId) !== parsedEvent.bayNumber) {
                this.logger.debug('EVENT RECEIVED, BUT IT IS NOT FOR THIS BAY, IGNORING!', parsedEvent);
            } else {
                this.vehicleToEngineConfigId = parsedEvent.vehicleToEngineConfigId || this.vehicleToEngineConfigId;
                this.eventType = parsedEvent.eventType;
                this.appStatusService.setStoreEvent(parsedEvent);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.webSocketSubscription) {
            this.webSocketSubscription.unsubscribe();
        }
    }
}
