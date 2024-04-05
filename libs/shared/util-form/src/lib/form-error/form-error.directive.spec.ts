import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { formatMoment } from '@vioc-angular/shared/common-functionality';
import * as moment from 'moment';
import { Moment } from 'moment';
import { CentralValidators } from './../validator/central-validators';
import { FormErrorDirective } from './form-error.directive';

describe('FormErrorDirective', () => {
    interface TestData {
        field1: number;
        field2: string;
        field3: string;
        field4: string;
        field5: Moment;
        field6: string;
    }
    // Register global custom validation handler
    FormErrorDirective.standardErrors.globalCustomError = () => 'I broke with a global handler';

    /**
     * Test component containing a form and inputs with validation tied to a data object.
     */
    @Component({
        template: `
            <form [formGroup]="form">
                <mat-form-field class="field1">
                    <input matInput type="number" placeholder="Field 1" formControlName="field1" />
                    <mat-error *viocAngularFormError="form.get('field1').errors; let error">{{ error }}</mat-error>
                </mat-form-field>
                <mat-form-field class="field2">
                    <input matInput placeholder="Field 2" formControlName="field2" />
                    <mat-error
                        *viocAngularFormError="form.get('field2').errors; customErrorMapping: customError; let error"
                        >{{ error }}</mat-error
                    >
                </mat-form-field>
                <mat-form-field class="field3">
                    <input matInput placeholder="Field 3" formControlName="field3" />
                    <mat-error *viocAngularFormError="form.get('field3').errors; let error">{{ error }}</mat-error>
                </mat-form-field>
                <mat-form-field class="field4">
                    <input matInput placeholder="Field 4" formControlName="field4" />
                    <mat-error *viocAngularFormError="form.get('field4').errors; let error">{{ error }}</mat-error>
                </mat-form-field>
                <mat-form-field class="field5">
                    <input matInput placeholder="Field 5" formControlName="field5" />
                    <mat-error *viocAngularFormError="form.get('field5').errors; let error">{{ error }}</mat-error>
                </mat-form-field>
                <mat-form-field class="field6">
                    <input matInput placeholder="Field 6" formControlName="field6" />
                    <mat-error *viocAngularFormError="form.get('field6').errors; let error">{{ error }}</mat-error>
                </mat-form-field>
            </form>
        `,
    })
    class TestErrorComponent {
        form: FormGroup;
        data: TestData = {
            field1: 12,
            field2: 'value',
            field3: 'email@test.com',
            field4: 'no numbers pattern',
            field5: moment().add(1, 'day'), // initialize to tomorrow
            field6: 'http://url.com',
        };

        customError = {
            test: () => 'Custom error message',
        };

        constructor(formBuilder: FormBuilder) {
            this.form = formBuilder.group(this.data);
            // setup validators
            this.form.get('field1').setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
            this.form.get('field2').setValidators([
                Validators.minLength(2),
                Validators.maxLength(6),
                (control: FormControl) => {
                    const errors: ValidationErrors = {};
                    if (control.value === 'test') {
                        errors.test = true;
                    }
                    if (control.value === 'testGl') {
                        errors.globalCustomError = true;
                    }
                    return errors;
                },
            ]);
            this.form.get('field3').setValidators([Validators.email]);
            // letters and spaces only
            this.form.get('field4').setValidators([Validators.pattern('[a-zA-Z ]*')]);
            // must be a date after today
            this.form.get('field5').setValidators([CentralValidators.dateAfterTodayValidator(false)]);
            this.form.get('field6').setValidators([CentralValidators.url()]);
            // mark fields as touched to get any errors to display immediately
            this.form.markAllAsTouched();
        }
    }

    let fixture: ComponentFixture<TestErrorComponent>;
    let form: FormGroup;
    let field1: AbstractControl;
    let field2: AbstractControl;
    let field3: AbstractControl;
    let field4: AbstractControl;
    let field5: AbstractControl;
    let field6: AbstractControl;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, NoopAnimationsModule],
            declarations: [FormErrorDirective, TestErrorComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestErrorComponent);
        form = fixture.componentInstance.form;
        field1 = form.get('field1');
        field2 = form.get('field2');
        field3 = form.get('field3');
        field4 = form.get('field4');
        field5 = form.get('field5');
        field6 = form.get('field6');
        fixture.detectChanges();
    });

    it('should not display an error if the form is valid', () => {
        // data should be initially valid
        expect(form.valid).toEqual(true);
        expect(fixture.debugElement.query(By.css('.mat-error'))).toBeNull();
    });

    describe('displays an error if form is invalid', () => {
        const verifyErrorIsShown = (field: keyof TestData, expectedText: string) => {
            fixture.detectChanges();
            expect(form.invalid).toEqual(true);
            const error = fixture.debugElement.query(By.css(`.${field} mat-error`));
            expect(error).not.toBeNull();
            expect(error.nativeElement.textContent.trim()).toEqual(expectedText);
        };

        it('should display a standard required error', () => {
            field1.patchValue(null);
            verifyErrorIsShown('field1', 'Value is required');
        });

        it('should display a standard min error', () => {
            field1.patchValue(-1);
            verifyErrorIsShown('field1', 'Value cannot be less than 0');
        });

        it('should display a standard max error', () => {
            field1.patchValue(112);
            verifyErrorIsShown('field1', 'Value cannot be more than 100');
        });

        it('should display a standard minlength error', () => {
            field2.patchValue('F');
            verifyErrorIsShown('field2', 'Value must be at least 2 characters');
        });

        it('should display a standard maxlength error', () => {
            field2.patchValue('too long of a value');
            verifyErrorIsShown('field2', 'Value must be 6 characters or less');
        });

        it('should display a standard email error', () => {
            field3.patchValue('not an email');
            verifyErrorIsShown('field3', 'Value must be a valid email');
        });

        it('should display a standard pattern error', () => {
            field4.patchValue('1234');
            verifyErrorIsShown('field4', 'Value is invalid');
        });

        it('should display a custom error', () => {
            field2.patchValue('test');
            verifyErrorIsShown('field2', 'Custom error message');
        });

        it('should display a global custom error', () => {
            field2.patchValue('testGl');
            verifyErrorIsShown('field2', 'I broke with a global handler');
        });

        it('should display a date after error', () => {
            field5.patchValue(moment().startOf('day'));
            verifyErrorIsShown('field5', `Should be after ${formatMoment(moment(), true)}`);
        });

        it('should display a url error', () => {
            field6.patchValue('invalid url');
            verifyErrorIsShown('field6', 'Not a valid url');
        });
    });
});
