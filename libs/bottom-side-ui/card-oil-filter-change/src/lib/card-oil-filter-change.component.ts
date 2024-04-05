import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '@vioc-angular/ui-kit/molecules/card';
import { CardTitleComponent, CardTitleConstants } from '@vioc-angular/ui-kit/atoms/card-title';
import { CardContentComponent, CardContentConstants } from '@vioc-angular/ui-kit/atoms/card-content';
import { WorkingBayFacade, WorkingBayServices } from '@vioc-angular/bottom-side-ui/config/data-access-working-bay';
import {
    EngineDrainPlugTorque,
    OilFilterTorque,
    Part,
    PartTypeApiEnum,
    VehicleSpecificationFacade,
} from '@vioc-angular/bottom-side-ui/config/data-access-vehicle-specifications';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Component({
    selector: 'vioc-card-oil-filter-change',
    standalone: true,
    imports: [CommonModule, CardComponent, CardContentComponent, CardTitleComponent],
    providers: [VehicleSpecificationFacade, WorkingBayFacade],
    templateUrl: './card-oil-filter-change.component.html',
    styleUrls: ['./card-oil-filter-change.component.scss'],
})
export class CardOilFilterChangeComponent implements OnInit {
    @Input() vehicleToEngineConfigId!: number;
    @Input() bayNumber = '#';
    oilFilter: Part[];
    oilFilterTorque: OilFilterTorque;
    plugTorque: EngineDrainPlugTorque;
    oilChange: WorkingBayServices;

    mainTitleConfiguration = {
        label: 'Oil Change',
        size: CardTitleConstants.Size.Medium,
        color: CardTitleConstants.Color.Primary,
        align: CardTitleConstants.Align.Left,
    };
    contentTitleConfig = {
        align: CardTitleConstants.Align.Center,
        color: CardTitleConstants.Color.Secondary,
        size: CardTitleConstants.Size.Medium,
    };
    contentConfig = {
        titleColor: CardContentConstants.Color.Primary,
        contentSize: CardContentConstants.Size.Medium,
    };
    oilFilterContent: { title: string; notes: string }[] = [];
    oilFIlterTorqueContent: { title: string; notes: string };
    plugTorqueContent: { title: string; notes: string };
    oilChangeContent: { drainPlugCode: string; productCode: string; quantity: string };

    constructor(
        private readonly vehicleSpecificationFacade: VehicleSpecificationFacade,
        private readonly workingBayFacade: WorkingBayFacade
    ) {}

    ngOnInit() {
        // TODO: add error handling once that ticket is merged
        this.getOilFilter();
        this.getOilFilterTorque();
        this.getPlugTorque();
        this.getOilChange();
    }

    getOilFilter() {
        this.vehicleSpecificationFacade
            .getPartsByVehicleToEngineConfigIdAndPartType(
                this.vehicleToEngineConfigId?.toString(),
                PartTypeApiEnum.OIL_FILTER
            )
            .pipe(catchError((err) => EMPTY))
            .subscribe((oilFilter) => {
                this.oilFilter = oilFilter;
                this.processOilFilter();
            });
    }

    getOilFilterTorque() {
        this.vehicleSpecificationFacade
            .getOilFilterTorqueByVehicleToEngineConfigId(this.vehicleToEngineConfigId?.toString())
            .pipe(catchError((err) => EMPTY))
            .subscribe((oilFilterTorque) => {
                this.oilFilterTorque = oilFilterTorque[0];
                this.processOilFilterTorque();
            });
    }

    getPlugTorque() {
        this.vehicleSpecificationFacade
            .getEngineDrainPlugTorqueByVehicleToEngineConfigId(this.vehicleToEngineConfigId?.toString())
            .pipe(catchError((err) => EMPTY))
            .subscribe((plugTorque) => {
                this.plugTorque = plugTorque[0];
                this.processplugTorque();
            });
    }

    getOilChange() {
        this.workingBayFacade
            .getWorkingBayServicesByNumberAndRootServiceCategoryCode(this.bayNumber, 'OC')
            .pipe(catchError((err) => EMPTY))
            .subscribe((oilChange) => {
                this.oilChange = oilChange[0];
                this.processOilChange();
            });
    }

    processOilFilter(): void {
        const partsToShow = this.oilFilter?.length > 3 ? this.oilFilter.slice(0, 3) : this.oilFilter;
        partsToShow?.forEach((part) => {
            this.oilFilterContent.push({
                title: part.part!,
                notes: this.getNotes(part.notes),
            });
        });
    }

    processOilFilterTorque(): void {
        this.oilFIlterTorqueContent = {
            title: this.oilFilterTorque?.torque_f ? this.oilFilterTorque.torque_f + ' ft/lbs' : '-',
            notes: this.getNotes(this.oilFilterTorque?.notes),
        };
    }

    processplugTorque(): void {
        this.plugTorqueContent = {
            title: this.plugTorque?.torqueFtLbs ? this.plugTorque.torqueFtLbs + ' ft/lbs' : '-',
            notes: this.getNotes(this.plugTorque?.notes),
        };
    }

    processOilChange(): void {
        const product = this.oilChange?.products[0]!;
        this.oilChangeContent = {
            drainPlugCode: product?.productCategory?.code,
            productCode: product?.product?.code,
            quantity: product?.quantity ? product?.quantity + ' qts' : '-',
        };
    }

    getNotes(notes: any[]) {
        let response: string;
        const formatedNotes = notes
            ?.filter((note) => !!note)
            .map((note) => note.value)
            .join('; ');
        if (formatedNotes) {
            response = 'Notes: ' + formatedNotes;
        }
        return response;
    }
}
