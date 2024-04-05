import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { PreventativeMaintenanceQualifier } from '@vioc-angular/central-ui/service/data-access-service-category';
import { Described } from '@vioc-angular/shared/common-functionality';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { Observable, ReplaySubject } from 'rxjs';

/**
 * Component used to display preventative maintenance qualifier fields for a service category
 */
@Component({
    selector: 'vioc-angular-preventative-maintenance-qualifier',
    templateUrl: './preventative-maintenance-qualifier.component.html',
})
export class PreventativeMaintenanceQualifierComponent implements OnInit, OnDestroy {
    /**
     * FormArray of PreventativeMaintenanceQualifier fields.
     */
    @Input() pmQualifierFormArray: FormArray;

    /**
     * Determines whether or not the add/remove button will appear
     */
    @Input() isViewMode: boolean;

    transmissionType$: Observable<Described[]>;

    /**
     * Used on the HTML side for sorting
     */
    describedEquals = Described.idEquals;

    private readonly _destroyed = new ReplaySubject(1);

    constructor(
        public readonly commonCodeFacade: CommonCodeFacade,
        private readonly changeDetector: ChangeDetectorRef,
        private readonly formFactory: FormFactory
    ) {}

    ngOnInit(): void {
        this.transmissionType$ = this.commonCodeFacade.findByType('TRNSTYPE', true);
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }

    /**
     * Adds a new preventative maintenance qualifier to the form array
     */
    addPreventativeMaintenanceQualifier(): void {
        this.pmQualifierFormArray.push(
            this.formFactory.group(
                'PreventativeMaintenanceQualifier',
                new PreventativeMaintenanceQualifier(),
                this._destroyed,
                {
                    changeDetector: this.changeDetector,
                }
            )
        );
        // manually detect changes since form is modified directly
        this.changeDetector.detectChanges();
    }

    /**
     * Removed a new preventative maintenance qualifier to the form array at the given index
     */
    removePreventativeMaintenanceQualifier(index: number): void {
        this.pmQualifierFormArray.removeAt(index);
        // manually detect changes since form is modified directly
        this.changeDetector.detectChanges();
    }

    /**
     * Determine if a preventative maintenance qualifier is addable
     */
    isPreventativeMaintenanceQualifierAddable(index: number): boolean {
        return !this.isViewMode && index + 1 === this.pmQualifierFormArray.length;
    }
}
