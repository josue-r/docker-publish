import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, NgControl } from '@angular/forms';
import { MatMomentDateModule, MomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import * as moment from 'moment';
import { DateRangeInputComponent } from './date-range-input.component';

describe('DateRangeInputComponent', () => {
    let component: DateRangeInputComponent;
    let fixture: ComponentFixture<DateRangeInputComponent>;
    const nov1st = moment('2020-11-01');
    const nov2nd = moment('2020-11-02');
    const nov4th = moment('2020-11-04');
    const nov8th = moment('2020-11-08');

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatFormFieldModule,
                MatDatepickerModule,
                NoopAnimationsModule,
                MomentDateModule,
                MatMomentDateModule,
            ],
            declarations: [DateRangeInputComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DateRangeInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        describe.each`
            initialFormValue    | expectedStartDate | expectedEndDate
            ${[nov1st, nov2nd]} | ${nov1st}         | ${nov2nd}
            ${[nov1st, null]}   | ${undefined}      | ${undefined}
            ${[null, nov2nd]}   | ${undefined}      | ${undefined}
            ${[null, null]}     | ${undefined}      | ${undefined}
            ${null}             | ${undefined}      | ${undefined}
        `('value=$initialFormValue', ({ initialFormValue, expectedStartDate, expectedEndDate }) => {
            it(`should be initialized with startDate=${expectedStartDate} & endDate=${expectedEndDate}`, () => {
                component.value = initialFormValue;
                component.ngOnInit();
                expect(component.startDate).toEqual(expectedStartDate);
                expect(component.endDate).toEqual(expectedEndDate);
            });
        });
    });

    describe('date range values', () => {
        describe.each`
            newStartDate | endDate   | expectedValue
            ${null}      | ${null}   | ${null}
            ${null}      | ${nov2nd} | ${null}
            ${nov1st}    | ${null}   | ${null}
            ${nov1st}    | ${nov4th} | ${[nov1st, nov4th]}
        `('startDate', ({ newStartDate, endDate, expectedValue }) => {
            it(`should update the form value to ${expectedValue} if endDate=${endDate} and a start date of ${newStartDate} is selected`, fakeAsync(() => {
                component['endDate'] = endDate;
                component.startDate = newStartDate;
                flush();
                expect(component.value).toEqual(expectedValue);
            }));
        });

        describe.each`
            newEndDate | startDate | expectedValue
            ${null}    | ${null}   | ${null}
            ${null}    | ${nov1st} | ${null}
            ${nov4th}  | ${null}   | ${null}
            ${nov4th}  | ${nov1st} | ${[nov1st, nov4th]}
        `('endDate', ({ newEndDate, startDate, expectedValue }) => {
            it(`should update the form value to ${expectedValue} if startDate=${startDate} and a end date of ${newEndDate} is selected`, fakeAsync(() => {
                component['startDate'] = startDate;
                component.endDate = newEndDate;
                flush();
                expect(component.value).toEqual(expectedValue);
            }));
        });
    });

    describe('component inputs', () => {
        beforeEach(() => jest.spyOn(component.stateChanges, 'next').mockImplementation());

        it('should emit next on the stateChanges when the placeholder changes', () => {
            component.placeholder = 'test';
            expect(component.stateChanges.next).toHaveBeenCalled();
        });
        it('should emit next on the stateChanges when required changes', () => {
            component.required = true;
            expect(component.stateChanges.next).toHaveBeenCalled();
        });
    });

    describe.each`
        value               | expectation
        ${null}             | ${true}
        ${undefined}        | ${true}
        ${''}               | ${true}
        ${[nov1st, nov8th]} | ${false}
    `('empty', ({ value, expectation }) => {
        it(`should be ${expectation} with value of ${value}`, () => {
            component.value = value;
            expect(component.empty).toEqual(expectation);
        });
    });

    describe.each`
        empty    | focused  | expectation
        ${true}  | ${true}  | ${true}
        ${false} | ${true}  | ${true}
        ${true}  | ${false} | ${false}
        ${false} | ${false} | ${true}
    `('shouldLabelFloat', ({ empty, focused, expectation }) => {
        it(`should be ${expectation} when empty is ${empty} and focused is ${focused}`, () => {
            if (!empty) {
                component.value = [nov4th, nov8th];
            }
            component.focused = focused;
            expect(component.shouldLabelFloat).toEqual(expectation);
        });
    });

    describe.each`
        disabled | touched  | invalid  | expectation
        ${true}  | ${true}  | ${true}  | ${false}
        ${false} | ${true}  | ${true}  | ${true}
        ${true}  | ${false} | ${true}  | ${false}
        ${false} | ${false} | ${true}  | ${false}
        ${true}  | ${true}  | ${false} | ${false}
        ${false} | ${true}  | ${false} | ${false}
        ${true}  | ${false} | ${false} | ${false}
        ${false} | ${false} | ${false} | ${false}
    `('errorState', ({ disabled, touched, invalid, expectation }) => {
        it(`should be ${expectation} when disabled is ${disabled}, touched is ${touched}, and valid is ${invalid}`, () => {
            component.disabled = disabled;
            component.ngControl = { touched, invalid } as NgControl;
            expect(component.errorState).toEqual(expectation);
        });
    });

    describe.each`
        disabled | expectTouched
        ${true}  | ${false}
        ${false} | ${true}
    `('onContainerClick', ({ disabled, expectTouched }) => {
        it(`should ${expectTouched ? '' : 'not '} be touched if disabled is ${disabled}`, () => {
            const mockControl = { control: { markAsTouched: () => {} } };
            const spy = jest.spyOn(mockControl.control, 'markAsTouched');
            component.ngControl = mockControl as NgControl;
            component.disabled = disabled;
            component.onContainerClick();
            if (expectTouched) {
                expect(spy).toHaveBeenCalled();
            } else {
                expect(spy).not.toHaveBeenCalled();
            }
        });
    });
});
