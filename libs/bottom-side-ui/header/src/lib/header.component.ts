import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';

import { BadgeComponent } from '@vioc-angular/ui-kit/atoms/badge';
import { StatusComponent } from '@vioc-angular/ui-kit/atoms/status';
import {
    VehicleSpecificationFacade,
    VehicleSpecification,
} from '@vioc-angular/bottom-side-ui/config/data-access-vehicle-specifications';
import { EMPTY, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ContentErrorComponent, ContentErrorConstants } from '@vioc-angular/ui-kit/atoms/content-error';
import {
    BaseStoreEvent,
    EventTypeEnum,
    NavigationActionEnum,
    NavigationEvent,
    ServiceEditedEvent,
} from '@vioc-angular/shared/common-event-models';
import { AppStatusService } from '@vioc-angular/bottom-side-ui/config/app-status';
import { WorkingBay, WorkingBayFacade } from '@vioc-angular/bottom-side-ui/config/data-access-working-bay';
import { FLAGS, FLAG_CONFIGURATIONS, HEADER_STATUS, STATUS_CONFIGURATIONS } from './header.constants';

@Component({
    selector: 'vioc-header',
    standalone: true,
    imports: [
        CommonModule,
        BadgeComponent,
        StatusComponent,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatGridListModule,
        ContentErrorComponent,
    ],
    providers: [VehicleSpecificationFacade, WorkingBayFacade],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
    private appStatusSubscription: Subscription;

    @Input() bayNumber = '#';

    // this is to make sure that we can apply i18n
    bayLabel = 'bay';
    statusConfig = STATUS_CONFIGURATIONS[HEADER_STATUS.NO_VEHICLE_ASSIGNED];
    carDetails = '-';
    showEvacFlag = false;
    showFleetFlag = false;
    flagConfigurations = {
        evac: FLAG_CONFIGURATIONS[FLAGS.EVAC],
        fleet: FLAG_CONFIGURATIONS[FLAGS.FLEET],
    };
    apiError = false;
    apiErrorMessage = '';
    errorOrientation = ContentErrorConstants.Orientation.Horizontal;

    constructor(
        private readonly vehicleSpecificationFacade: VehicleSpecificationFacade,
        private readonly appStatusService: AppStatusService,
        private readonly workingBayFacade: WorkingBayFacade
    ) {}

    ngOnInit(): void {
        this.appStatusSubscription = this.appStatusService.getStoreEvent().subscribe((storeEvent: BaseStoreEvent) => {
            this.cleanErrorStatus();
            switch (storeEvent.eventType) {
                case EventTypeEnum.VEHICLE_UPDATED:
                    this.handleVehicleUpdated(storeEvent.vehicleToEngineConfigId.toString());
                    break;
                case EventTypeEnum.SERVICE_EDITED:
                    this.handleServiceEdited(storeEvent as ServiceEditedEvent);
                    break;
                case EventTypeEnum.NAVIGATION:
                    this.handleNavigation(storeEvent as NavigationEvent);
                    break;
                default:
                    this.statusConfig = STATUS_CONFIGURATIONS[HEADER_STATUS.NO_VEHICLE_ASSIGNED];
                    break;
            }
        });
    }

    handleVehicleUpdated(vehicleToEngineConfigId: string) {
        this.statusConfig = STATUS_CONFIGURATIONS[HEADER_STATUS.GREETED];
        this.workingBayFacade.getWorkingBayStatusByNumber(this.bayNumber).subscribe((result: WorkingBay) => {
            this.showFleetFlag = result.visitCustomerType === FLAGS.FLEET;
        });
        this.workingBayFacade
            .getBooleanAttributeByNumberAndType(this.bayNumber, 'OIL_EVAC_ICON_DISPLAYED')
            .subscribe((result: boolean) => {
                this.showEvacFlag = result;
            });
        this.vehicleSpecificationFacade
            .getVehicleSpecificationsByVehicleToEngineConfigId(vehicleToEngineConfigId)
            .pipe(
                catchError((err) => {
                    if (err.message === '-') {
                        return EMPTY;
                    }
                    this.apiError = true;
                    this.apiErrorMessage = err.message;
                    return EMPTY;
                })
            )
            .subscribe((result: VehicleSpecification) => {
                this.carDetails = `${result.engine || ''}, ${result.displayText || ''}`;
            });
    }

    handleServiceEdited(event: ServiceEditedEvent) {
        switch (event.rootServiceCategoryCode) {
            case 'OC':
                this.statusConfig = STATUS_CONFIGURATIONS[HEADER_STATUS.VERIFY_SHOWTIME];
                break;
            default:
                break;
        }
    }

    handleNavigation(event: NavigationEvent) {
        if (event.action === NavigationActionEnum['STORE_APP:YOUR_VEHICLE'] && event.firstTimeOnPage) {
            this.statusConfig = STATUS_CONFIGURATIONS[HEADER_STATUS.SERVICE_REVIEW];
        }
    }

    ngOnDestroy(): void {
        if (this.appStatusSubscription) {
            this.appStatusSubscription.unsubscribe();
        }
    }

    cleanErrorStatus() {
        this.apiError = false;
        this.apiErrorMessage = '';
    }
}
