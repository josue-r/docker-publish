import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardContentComponent, CardContentConstants } from '@vioc-angular/ui-kit/atoms/card-content';
import { CardTitleConstants } from '@vioc-angular/ui-kit/atoms/card-title';
import { CardComponent } from '@vioc-angular/ui-kit/molecules/card';
import {
    VehicleSpecificationFacade,
    PartTypeApiEnum,
    Part,
} from '@vioc-angular/bottom-side-ui/config/data-access-vehicle-specifications';
import { CardCabinAirFilterConstants } from './card-cabin-air-filter.constants';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { AppStatusService } from '@vioc-angular/bottom-side-ui/config/app-status';
import { BaseStoreEvent, EventTypeEnum } from '@vioc-angular/shared/common-event-models';
import { catchError, map } from 'rxjs/operators';
import { ContentErrorComponent } from '@vioc-angular/ui-kit/atoms/content-error';

@Component({
    selector: 'vioc-card-cabin-air-filter',
    standalone: true,
    imports: [CommonModule, CardContentComponent, CardComponent, ContentErrorComponent],
    providers: [VehicleSpecificationFacade],
    templateUrl: './card-cabin-air-filter.component.html',
    styleUrls: ['./card-cabin-air-filter.component.scss'],
})
export class CardCabinAirFilterComponent implements OnInit, OnDestroy {
    private appStatusSubscription: Subscription;
    cabinAirFilterWithNotes$: Observable<Part[]>;
    apiError = false;
    apiErrorMessage = '';
    noteValues: string[] = [];

    @Input() set size(value: CardCabinAirFilterConstants.Size) {
        this.titleConfiguration.size = value;
        this.contentConfiguration.size = value;
    }

    titleConfiguration = {
        label: 'Cabin Air Filter',
        size: CardTitleConstants.Size.Large,
        color: CardTitleConstants.Color.Secondary,
        align: CardTitleConstants.Align.Center,
    };
    contentConfiguration = {
        titleColor: CardContentConstants.Color.Secondary,
        size: CardContentConstants.Size.Large,
    };

    ngOnInit() {
        this.appStatusSubscription = this.appStatusService.getStoreEvent().subscribe((storeEvent: BaseStoreEvent) => {
            this.cleanErrorStatus();
            switch (storeEvent.eventType) {
                case EventTypeEnum.VEHICLE_UPDATED:
                    this.fillCard(`${storeEvent.vehicleToEngineConfigId}`);
                    break;
                default:
                    break;
            }
        });
    }

    constructor(
        private readonly vehicleSpecificationFacade: VehicleSpecificationFacade,
        private readonly appStatusService: AppStatusService
    ) {}

    ngOnDestroy(): void {
        if (this.appStatusSubscription) {
            this.appStatusSubscription.unsubscribe();
        }
    }

    private fillCard(vehicleToEngineConfigId: string) {
        this.cabinAirFilterWithNotes$ = this.vehicleSpecificationFacade
            .getPartsByVehicleToEngineConfigIdAndPartType(vehicleToEngineConfigId, PartTypeApiEnum.CABIN_AIR)
            .pipe(
                catchError((err) => {
                    this.apiError = true;
                    this.apiErrorMessage = err.message;
                    return EMPTY;
                }),
                map((cabinAirFilters) => {
                    return cabinAirFilters.map((cabinAirFilter, index) => {
                        this.noteValues[index] =
                            'Notes: ' +
                                cabinAirFilter.notes
                                    ?.filter((note) => !!note)
                                    .map((note) => note?.value)
                                    .join('; ') || '';
                        return cabinAirFilter;
                    });
                })
            );
    }

    cleanErrorStatus() {
        this.apiError = false;
        this.apiErrorMessage = '';
    }
}
