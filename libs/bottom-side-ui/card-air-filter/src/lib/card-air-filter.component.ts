import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '@vioc-angular/ui-kit/molecules/card';
import { CardTitleConstants } from '@vioc-angular/ui-kit/atoms/card-title';
import {
    Part,
    PartTypeApiEnum,
    VehicleSpecificationFacade,
} from '@vioc-angular/bottom-side-ui/config/data-access-vehicle-specifications';
import { CardContentComponent, CardContentConstants } from '@vioc-angular/ui-kit/atoms/card-content';
import { AppStatusService } from '@vioc-angular/bottom-side-ui/config/app-status';
import { Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseStoreEvent, EventTypeEnum } from '@vioc-angular/shared/common-event-models';
import { ContentErrorComponent } from '@vioc-angular/ui-kit/atoms/content-error';

@Component({
    selector: 'vioc-card-air-filter',
    standalone: true,
    imports: [CommonModule, CardComponent, CardContentComponent, ContentErrorComponent],
    providers: [VehicleSpecificationFacade],
    templateUrl: './card-air-filter.component.html',
    styleUrls: ['./card-air-filter.component.scss'],
})
export class CardAirFilterComponent implements OnInit, OnDestroy {
    private appStatusSubscription: Subscription;

    titleConfiguration = {
        label: 'Air Filter',
        size: CardTitleConstants.Size.Large,
        color: CardTitleConstants.Color.Secondary,
        align: CardTitleConstants.Align.Center,
    };
    contentTitleColor = CardContentConstants.Color.Secondary;
    contentTitle = '';
    contentNotes = '';
    apiError = false;
    apiErrorMessage = '';

    constructor(
        private readonly vehicleSpecificationFacade: VehicleSpecificationFacade,
        private readonly appStatusService: AppStatusService
    ) {}

    ngOnInit() {
        this.appStatusSubscription = this.appStatusService.getStoreEvent().subscribe((storeEvent: BaseStoreEvent) => {
            this.cleanErrorStatus();
            switch (storeEvent.eventType) {
                case EventTypeEnum.VEHICLE_UPDATED:
                    this.fillCard(`${storeEvent.vehicleToEngineConfigId}`);
            }
        });
    }

    fillCard(vehicleToEngineConfigId: string) {
        this.vehicleSpecificationFacade
            .getPartsByVehicleToEngineConfigIdAndPartType(vehicleToEngineConfigId, PartTypeApiEnum.AIR_FILTER)
            .pipe(
                catchError((err) => {
                    this.apiError = true;
                    this.apiErrorMessage = err.message;
                    return throwError(err);
                })
            )
            .subscribe((airFilters: Part[]) => {
                const firstPart = airFilters[0];
                this.contentTitle = firstPart.part;
                this.contentNotes =
                    'Notes: ' +
                    firstPart.notes
                        .filter((note) => !!note)
                        .map((note) => note.value)
                        .join('; ');
            });
    }

    ngOnDestroy() {
        if (this.appStatusSubscription) {
            this.appStatusSubscription.unsubscribe();
        }
    }

    cleanErrorStatus() {
        this.apiError = false;
        this.apiErrorMessage = '';
    }
}
