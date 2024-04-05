import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferContent, OfferContentFacade } from '@vioc-angular/central-ui/discount/data-access-offer-content';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-offer-content',
    templateUrl: './offer-content.component.html',
    providers: [OfferContentFacade],
})
export class OfferContentComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    /** Mode that determines the editable state of the page. */
    accessMode: AccessMode;
    /** Model that holds the values of the offerContent being viewed. */
    model: OfferContent = null;
    /** Form for validating and updating offerContent field values. */
    form: TypedFormGroup<OfferContent>;
    /** The value used when calling `findByName` to load the model. */
    offerContentName: string;

    saveFacade: SaveFacade<OfferContent>;

    isLoading = false;

    private readonly _destroyed = new ReplaySubject(1);

    constructor(
        private readonly changeDetector: ChangeDetectorRef,
        private readonly formFactory: FormFactory,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly routerService: RouterService,
        public readonly messageFacade: MessageFacade,
        public readonly offerContentFacade: OfferContentFacade
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.offerContentFacade.save(model),
            (oc) => `Offer Content ${oc.name} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<OfferContent>, model: OfferContent): OfferContent => {
                return Object.assign({ ...model }, form.value);
            }
        );
        // This will trigger a reload of the component when the parameters change i.e. switching from add to edit etc
        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(() => {
            // Checking if accessMode is set to see if the component is already initialized, otherwise when
            // the component is first created ngOnInit will run twice
            if (this.accessMode) {
                this.ngOnInit();
            }
        });
    }

    // The optional parameter here is needed when we reload this component to prevent not found errors
    // when editing offerContent.name since it is part of the route but is also editable
    ngOnInit(offerContentName?: string): void {
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        if (offerContentName) {
            this.offerContentName = offerContentName;
        } else {
            this.offerContentName = params.offerContentName;
        }

        if (this.accessMode === AccessMode.VIEW || this.accessMode === AccessMode.EDIT) {
            // fetch the model from the facade and load existing data into the form
            this.offerContentFacade.findByName(this.offerContentName).subscribe((offerContent) => {
                this.model = offerContent;
                this.createForm(this.model);
            });
        } else if (this.accessMode === AccessMode.ADD) {
            // Create a new form, default the boolean value as it is required
            this.model = { ...new OfferContent(), active: true };
            this.createForm(this.model);
        }
    }

    private getRouteParams(route: ActivatedRoute): { accessMode: AccessMode; offerContentName: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const offerContentName = params.get('offerContentName');
        return { accessMode, offerContentName };
    }

    /**
     * Initializing the form with the current OfferContent values.
     */
    private createForm(model: OfferContent): void {
        this.form = this.formFactory.group('OfferContent', model, this._destroyed, {
            changeDetector: this.changeDetector,
            accessMode: this.accessMode,
        });
        if (this.accessMode === AccessMode.VIEW) {
            this.form.disable();
        } else if (this.accessMode === AccessMode.EDIT) {
            this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
        } else if (this.accessMode !== AccessMode.ADD) {
            throw Error(`Unhandled Access Mode: ${this.accessMode}`);
        }
    }

    /** Save changes and reload the entity from the API. */
    apply(): void {
        const offerContentName = this.form.getControlValue('name');
        const reload = () => {
            this.form = undefined;
            if (this.accessMode === AccessMode.ADD) {
                this.router.navigate([AccessMode.EDIT.urlSegement, offerContentName], {
                    relativeTo: this.route.parent,
                });
            } else {
                this.ngOnInit(offerContentName);
            }
        };
        this.saveFacade.apply(this.form, this.model, reload).subscribe();
    }

    /** Save and navigate back to previous page. */
    save(): void {
        this.saveFacade.save(this.form, this.model, this.route).subscribe();
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form && this.form.dirty;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
