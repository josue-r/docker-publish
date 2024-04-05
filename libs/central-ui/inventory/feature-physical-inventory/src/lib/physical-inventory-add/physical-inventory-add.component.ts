import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { PhysicalInventoryFacade } from '@vioc-angular/central-ui/inventory/data-access-physical-inventory';
import {
    ReceiptOfMaterial,
    ReceiptOfMaterialFacade,
} from '@vioc-angular/central-ui/inventory/data-access-receipt-of-material';
import { ResourceFacade, Resources } from '@vioc-angular/central-ui/organization/data-access-resources';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { ApiErrorResponse, instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import { CONFLICT } from 'http-status-codes';
import { Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-physical-inventory-add',
    templateUrl: './physical-inventory-add.component.html',
    styleUrls: ['./physical-inventory-add.component.scss'],
    providers: [PhysicalInventoryFacade, ResourceFacade, CommonCodeFacade, ReceiptOfMaterialFacade],
})
export class PhysicalInventoryAddComponent implements OnInit, OnDestroy {
    @ViewChild('openReceiptsDialog', { static: true }) openReceiptsDialog: DialogComponent;

    private readonly _destroyed = new ReplaySubject(1);

    readonly accessRoles = ['ROLE_PHYSICAL_INVENTORY_ADD'];

    @ViewChild('existingProductCountDialog', { static: true }) existingProductCountDialog: DialogComponent;

    /** Mode that determines state of the page. */
    accessMode: AccessMode;

    /** Id of existing count for store*/
    existingProductCountNumber: string;

    /** Store control that holds and validates the value for the selected store. */
    store = new FormControl(null, Validators.required);

    /** Frequency control that holds and validates the value for the selected frequency. */
    frequency = new FormControl(null, Validators.required);

    /** Lists of store to be selected from when starting a product count. */
    stores$: Observable<Resources>;

    /** List of count frequencies to be selected from when starting a product count. */
    frequencies$: Observable<Described[]>;

    openReceipts: ReceiptOfMaterial[];

    isLoading = false;

    describedEquals = Described.idEquals;

    descriptionDisplayFn = Described.descriptionMapper;

    storeDisplayFn = Described.codeAndDescriptionMapper;

    constructor(
        public readonly physicalInventoryFacade: PhysicalInventoryFacade,
        public readonly resourceFacade: ResourceFacade,
        public readonly commonCodeFacade: CommonCodeFacade,
        public readonly messageFacade: MessageFacade,
        public readonly receiptOfMaterialFacade: ReceiptOfMaterialFacade,
        private readonly routerService: RouterService,
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        // Parse parameters from URL for view
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        if (this.accessMode.isAdd) {
            this.stores$ = this.resourceFacade.findStoresByRoles(this.accessRoles, 'ACTIVE', true).pipe(
                tap((response) => {
                    if (response.resources.length === 1) {
                        this.store.setValue(response.resources[0]);
                    }
                })
            );
            this.frequencies$ = this.commonCodeFacade.findByType('COUNTFREQ', true);
        } else {
            throw Error(`Unhandled Access Mode: ${this.accessMode?.urlSegement}`);
        }
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this.openReceiptsDialog = null;
        this.existingProductCountDialog = null;
    }

    /** Trigger the creation of a new product count. */
    createCount(): void {
        this.isLoading = true;
        this.physicalInventoryFacade.createCount(this.store.value.code, this.frequency.value.code).subscribe(
            (id) => {
                this.isLoading = false;
                this.messageFacade.addMessage({
                    message: `Product Count ${id} has been created.`,
                    severity: 'success',
                });
                // redirect from the add page to the edit page
                this.router.navigate([AccessMode.EDIT.urlSegement, this.store.value.code, id], {
                    relativeTo: this.route.parent,
                });
            },
            (error) => {
                this.isLoading = false;
                if (error.status === CONFLICT && instanceOfApiErrorResponse(error.error)) {
                    const apiError = error.error as ApiErrorResponse;
                    this.existingProductCountNumber = apiError.error.errors[0].messageParams[0];
                    if (this.existingProductCountDialog) {
                        this.openExistingProductCountDialog();
                    } else {
                        this.messageFacade.addMessage({
                            message:
                                'There is an existing product count that prevented the product count from being created',
                            severity: 'warn',
                        });
                    }
                } else {
                    throw error;
                }
            }
        );
    }

    /** Get route parameters from URL. */
    private getRouteParams(route: ActivatedRoute): { accessMode: AccessMode } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        return { accessMode };
    }

    checkOpenRMsAndCreateCount(): void {
        this.isLoading = true;
        this.receiptOfMaterialFacade.findOpenProductCountReceipts(this.store.value.code).subscribe(
            (openRms) => {
                if (openRms.length > 0) {
                    this.isLoading = false;
                    this.openReceipts = openRms;
                    if (this.openReceiptsDialog) {
                        this.openReceiptsDialog.open();
                    } else {
                        this.messageFacade.addMessage({
                            message: 'There are open receipts that prevented the product count from being created',
                            severity: 'warn',
                        });
                    }
                } else {
                    this.createCount();
                }
            },
            (err) => {
                this.isLoading = false;
                throw err;
            }
        );
    }

    navigateToOpenReceipt(receiptNumber: string): void {
        this.navigateToReceipt(AccessMode.EDIT, this.store.value.code, receiptNumber);
    }

    private navigateToReceipt(accessMode: AccessMode, store: string, receiptNumber: string) {
        this.router.navigate(['/inventory/receipt-of-material', accessMode.urlSegement, store, receiptNumber]);
    }

    navigateToOpenExistingProductCount(countId: string): void {
        this.router.navigate([AccessMode.EDIT.urlSegement, this.store.value.code, countId], {
            relativeTo: this.route.parent,
        });
        this.closeExistingProductCountDialog();
    }

    openExistingProductCountDialog(): void {
        this.existingProductCountDialog.open();
    }
    closeExistingProductCountDialog(): void {
        this.isLoading = false;
        this.existingProductCountDialog.close();
    }

    get isFrequencyEditable(): boolean {
        return this.store.valid;
    }
}
