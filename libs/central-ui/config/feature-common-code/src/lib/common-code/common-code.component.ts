import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCode, CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { RouterHistoryFacade } from '@vioc-angular/shared/data-access-router-history';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonCodeForms } from '../common-code-module.forms';

/**
 * Component used to add, edit, or update `CommonCode`s.
 */
@Component({
    selector: 'vioc-angular-common-code',
    templateUrl: './common-code.component.html',
    providers: [CommonCodeFacade],
})
export class CommonCodeComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    /**
     * Mode that determines the editable state of the page.
     */
    accessMode: AccessMode;
    /** Model that holds the values of the Common Code being viewed. */
    model: CommonCode;
    /** Form for validating and updating Common Code field values. */
    form: TypedFormGroup<CommonCode>;

    /** List used to populate the `type` dropdown. */
    types$: Observable<Described[]>;

    /** Checks if the `type` is active. If it is inactive and the user is requesting to edit, they are navigated to view instead.*/
    commonCodeType$: Observable<CommonCode>;

    /** `type` is a string in the Common Code model, so a FormControl is required to access the `type`'s code and description  */
    commonCodeTypeControl: FormControl;

    saveFacade: SaveFacade<CommonCode>;

    isLoading = false;

    commonCodeErrorMapping = CommonCodeForms.commonCodeErrorMapping;

    private readonly _destroyed = new ReplaySubject(1);

    constructor(
        private readonly changeDetector: ChangeDetectorRef,
        private readonly formFactory: FormFactory,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly routerService: RouterService,
        private readonly routerHistoryFacade: RouterHistoryFacade,
        public readonly commonCodeFacade: CommonCodeFacade,
        public readonly messageFacade: MessageFacade
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.commonCodeFacade.save(model),
            (cc) => `Common Code ${cc.code} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<CommonCode>, model: CommonCode): CommonCode => {
                return Object.assign({ ...model }, form.value);
            }
        );
        // This will trigger a reload of the component when the route parameters change i.e. switching from add to edit etc
        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(() => {
            // Checking if accessMode is set to see if the component is already initialized, otherwise when
            // the component is first created ngOnInit will run twice
            if (this.accessMode) {
                this.ngOnInit();
            }
        });
    }

    ngOnInit(): void {
        // Parse the parameters from the URL
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        const type = params.type;
        const code = params.code;

        if (this.accessMode === AccessMode.VIEW || this.accessMode === AccessMode.EDIT) {
            // fetch the model from the facade and load existing data into the form
            this.commonCodeFacade.findByTypeAndCode(type, code).subscribe((commonCode) => {
                this.model = commonCode;
                this.commonCodeType$ = this.getCommonCodeType(type);
                this.createForm(this.model);
            });
        } else if (this.accessMode === AccessMode.ADD) {
            // Create a new form, default all the boolean values if they are required
            this.model = { ...new CommonCode(), active: true };
            this.createForm(this.model);
        }
    }

    private getRouteParams(route: ActivatedRoute): { accessMode: AccessMode; type: string; code: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const type = params.get('type');
        const code = params.get('code');
        return { accessMode, type, code };
    }

    private createForm(commonCode: CommonCode): void {
        // Build the form
        this.form = this.formFactory.group('CommonCode', commonCode, this._destroyed, {
            // provide facade to form for optional async validation
            commonCodeFacade: this.commonCodeFacade,
            changeDetector: this.changeDetector,
            accessMode: this.accessMode,
        });
        // Configure based on accessibility
        if (this.accessMode === AccessMode.VIEW) {
            this.form.disable();
        } else if (this.accessMode === AccessMode.EDIT) {
            this.commonCodeType$.subscribe((commonCodeType) => {
                const isTypeActive = commonCodeType?.active;
                // If requesting edit and the type is inactive, navigate to the view screen instead.
                if (!isTypeActive) {
                    /* routerService.back() goes back to the edit screen, which navigates back to the view screen.
                    revertRouterHistory(1) removes the navigation to the edit screen from the router history
                    so clicking cancel goes back to the search screen as intended. */
                    this.routerHistoryFacade.revertRouterHistory(1);
                    this.router.navigate([`/config/common-code/view/${commonCode.type}/${commonCode.code}`]);
                    this.form.disable();
                } else {
                    this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
                }
            });
        } else if (this.accessMode === AccessMode.ADD) {
            this.loadDropdownValues();
            // Updates type description when a type is selected
            this.commonCodeTypeControl = new FormControl(null);
            this.commonCodeTypeControl.setValidators(Validators.required);
            this.commonCodeTypeControl.valueChanges.pipe(takeUntil(this._destroyed)).subscribe((type) => {
                // use TypedFormGroup#setControlValueDirtying
                // so the 'dirty' state will be propagated through the form
                this.form.setControlValueDirtying('type', type.code);
            });
        } else {
            throw Error('Unhandled Access Mode: ' + this.accessMode);
        }
    }

    getCommonCodeType(typeToFind: string): Observable<CommonCode> {
        return this.commonCodeFacade.findByTypeAndCode('CDTYPE', typeToFind);
    }

    /** Load dropdown options externally */
    private loadDropdownValues(): void {
        this.types$ = this.commonCodeFacade.findByType('CDTYPE', true);
    }

    /** Save changes and reload the entity from the API. */
    apply(): void {
        const type = this.form.getControlValue('type').toUpperCase();
        const code = this.form.getControlValue('code').toUpperCase();
        const reload = () => {
            this.form = undefined;
            if (this.accessMode === AccessMode.ADD) {
                this.router.navigate([`/config/common-code/edit/${type}/${code}`], {
                    relativeTo: this.route.parent,
                });
            } else {
                this.ngOnInit();
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
        // form is maked as pristine on successful save
        return this.form?.dirty;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
