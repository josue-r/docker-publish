import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';

/**
 * A wrapper element containing some styling and navigation elements for an angular material stepper.
 */
@Component({
    selector: 'vioc-angular-stepper-navigation',
    template: `
        <div class="stepper-header">
            <div class="stepper-arrow stepper-arrow-left">
                <button mat-icon-button color="primary" (click)="previousStep()" *ngIf="hasPreviousStep()">
                    <mat-icon>keyboard_arrow_left</mat-icon>
                </button>
            </div>
            <div class="stepper-arrow stepper-arrow-right">
                <button
                    mat-icon-button
                    color="primary"
                    (click)="nextStep()"
                    *ngIf="hasNextStep()"
                    [disabled]="isNextStepDisabled()"
                >
                    <mat-icon>keyboard_arrow_right</mat-icon>
                </button>
            </div>
            <ng-content></ng-content>
        </div>
    `,
    styleUrls: ['./stepper-navigation.component.scss'],
})
export class StepperNavigationComponent implements OnInit, AfterViewInit {
    @Input() stepper: MatStepper;

    /** used to track the last index of the stepper to control whether or not the next arrow is displayed. */
    lastStepIndex: number;

    constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        if (!this.stepper) {
            throw new Error('StepperNavigationComponent must be provided a MatStepper child element.');
        }
    }

    ngAfterViewInit() {
        this.lastStepIndex = this.stepper._steps.length - 1;
        // I'm not seeing a way around this change detection since the stepper input is nested inside this component
        this.changeDetectorRef.detectChanges();
    }

    /** Controls if the next button should appear as disabled if the step is invalid. */
    isNextStepDisabled(): boolean {
        if (this.stepper.selected) {
            return !this.stepper.selected.stepControl.valid;
        } else {
            return true;
        }
    }

    /** Controls if the previous step button will appear on the screen. */
    hasPreviousStep(): boolean {
        return this.stepper.selectedIndex > 0;
    }

    /** Controls if the next step button will appear on the screen. */
    hasNextStep(): boolean {
        return this.lastStepIndex > this.stepper.selectedIndex;
    }

    /** Moves the stepper to the previous step. */
    previousStep(): void {
        this.stepper.previous();
    }

    /** Moves the stepper to the next step. */
    nextStep(): void {
        this.stepper.next();
    }
}
