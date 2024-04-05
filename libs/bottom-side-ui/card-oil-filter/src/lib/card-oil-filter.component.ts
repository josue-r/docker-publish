import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '@vioc-angular/ui-kit/molecules/card';
import { CardContentComponent, CardContentConstants } from '@vioc-angular/ui-kit/atoms/card-content';
import {
    Part,
    PartTypeApiEnum,
    VehicleSpecificationFacade,
} from '@vioc-angular/bottom-side-ui/config/data-access-vehicle-specifications';
import { CardTitleConstants } from '@vioc-angular/ui-kit/atoms/card-title';
import { EMPTY, Subscription } from 'rxjs';
import { AppStatusService } from '@vioc-angular/bottom-side-ui/config/app-status';
import { BaseStoreEvent, EventTypeEnum } from '@vioc-angular/shared/common-event-models';
import { catchError } from 'rxjs/operators';
import { ContentErrorComponent } from '@vioc-angular/ui-kit/atoms/content-error';

@Component({
    selector: 'vioc-card-oil-filter',
    standalone: true,
    imports: [CommonModule, CardComponent, CardContentComponent, ContentErrorComponent],
    providers: [VehicleSpecificationFacade],
    templateUrl: './card-oil-filter.component.html',
    styleUrls: ['./card-oil-filter.component.scss'],
})
export class CardOilFilterComponent implements OnInit, OnDestroy {
    private appStatusSubscription: Subscription = new Subscription();
    apiError = false;
    apiErrorMessage = '';

    titleConfiguration = {
        label: 'Oil Filter',
        size: CardTitleConstants.Size.Large,
        color: CardTitleConstants.Color.Secondary,
        align: CardTitleConstants.Align.Center,
    };
    contentTitleColor = CardContentConstants.Color.Secondary;
    contentSize = CardContentConstants.Size.Large;
    partsContent: { title: string; notes: string }[] = [];

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

    fillCard(engineConfigId: string) {
        this.vehicleSpecificationFacade
            .getPartsByVehicleToEngineConfigIdAndPartType(engineConfigId, PartTypeApiEnum.OIL_FILTER)
            .pipe(
                catchError((err) => {
                    this.apiError = true;
                    this.apiErrorMessage = err.message;
                    return EMPTY;
                })
            )
            .subscribe((oilFilters: Part[]) => {
                const partsToShow = oilFilters.length >= 3 ? oilFilters.slice(0, 3) : oilFilters;
                partsToShow.forEach((part) => {
                    this.partsContent.push({
                        title: part.part!,
                        notes:
                            'Notes: ' +
                            part
                                .notes!.filter((note) => !!note)
                                .map((note) => note.value)
                                .join('; '),
                    });
                });
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
