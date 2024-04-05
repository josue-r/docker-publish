import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatStepper } from '@angular/material/stepper';
import { StepperNavigationComponent } from './stepper-navigation.component';

describe('StepperNavigationComponentComponent', () => {
    let component: StepperNavigationComponent;
    let fixture: ComponentFixture<StepperNavigationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatIconModule],
            declarations: [StepperNavigationComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StepperNavigationComponent);
        component = fixture.componentInstance;
    });

    it('should ensure a MatStepper is provided', () => {
        expect(() => fixture.detectChanges()).toThrowError(
            'StepperNavigationComponent must be provided a MatStepper child element.'
        );
    });

    describe('with a MatStepper', () => {
        beforeEach(() => {
            component.stepper = {
                _steps: [{ id: 1 }, { id: 2 }, { id: 3 }],
                selected: { stepControl: { valid: true } },
                selectedIndex: 0,
                previous: jest.fn(),
                next: jest.fn(),
            } as unknown as MatStepper;
        });

        describe('isNextStepDisabled', () => {
            it.each`
                selectedStep                         | expectedResult
                ${{ stepControl: { valid: true } }}  | ${false}
                ${{ stepControl: { valid: false } }} | ${true}
                ${undefined}                         | ${true}
            `('expectedResult=$expectedResult when selectedStep=$selectedStep', ({ selectedStep, expectedResult }) => {
                component.stepper.selected = selectedStep;
                expect(component.isNextStepDisabled()).toEqual(expectedResult);
            });
        });

        describe('hasPreviousStep', () => {
            it.each`
                selectedIndex | expectedResult
                ${0}          | ${false}
                ${99}         | ${true}
                ${undefined}  | ${false}
            `(
                'expectedResult=$expectedResult when selectedIndex=$selectedIndex',
                ({ selectedIndex, expectedResult }) => {
                    component.stepper.selectedIndex = selectedIndex;
                    expect(component.hasPreviousStep()).toEqual(expectedResult);
                }
            );
        });

        describe('hasNextStep', () => {
            it.each`
                selectedIndex | lastStepIndex | expectedResult
                ${2}          | ${2}          | ${false}
                ${1}          | ${2}          | ${true}
                ${undefined}  | ${2}          | ${false}
                ${undefined}  | ${undefined}  | ${false}
                ${2}          | ${undefined}  | ${false}
            `(
                'expectedResult=$expectedResult when selectedIndex=$selectedIndex and lastStepIndex=$lastStepIndex',
                ({ selectedIndex, expectedResult, lastStepIndex }) => {
                    component.stepper.selectedIndex = selectedIndex;
                    component.lastStepIndex = lastStepIndex;
                    expect(component.hasNextStep()).toEqual(expectedResult);
                }
            );
        });

        describe('previousStep', () => {
            it('delegates to the stepper', () => {
                component.previousStep();
                expect(component.stepper.previous).toHaveBeenCalled();
            });
        });

        describe('nextStep', () => {
            it('delegates to the stepper', () => {
                component.nextStep();
                expect(component.stepper.next).toHaveBeenCalled();
            });
        });
    });
});
