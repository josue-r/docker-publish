import { fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { expectObservable } from '@vioc-angular/test/util-test';
import { ReplaySubject } from 'rxjs';
import { FormFactory } from './form-factory';
import { TypedFormGroup } from './typed-form-group';

class Model {
    fieldNumber1: number = null;
    fieldNumber2: number = null;
    fieldString: string = null;
    fieldBoolean: boolean = null;
}

describe('TypedFormGroup', () => {
    let formBuilder: FormBuilder;
    let componentDestroyed: ReplaySubject<any>;
    let formGroup: TypedFormGroup<Model>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FormFactory],
            imports: [ReactiveFormsModule],
        });
        formBuilder = TestBed.inject(FormBuilder);

        componentDestroyed = new ReplaySubject<any>();
        formGroup = new TypedFormGroup(formBuilder.group(new Model()), componentDestroyed);
    });
    afterEach(
        waitForAsync(() => {
            componentDestroyed.next();
            componentDestroyed.unsubscribe();
        })
    );

    describe('setControlValueDirtying', () => {
        it('should set the value and mark the field as dirty', () => {
            const control = formGroup.getControl('fieldNumber1');
            expect(control.value).toBeNull();
            expect(control.dirty).toBeFalsy();
            formGroup.setControlValueDirtying('fieldNumber1', 5);
            expect(control.value).toEqual(5);
            expect(control.dirty).toBeTruthy();
        });
    });

    describe('addFormControlValidators', () => {
        it('should handle empty validators', () => {
            expect(formGroup.get('fieldNumber1').valid).toBeTruthy();
            expect(formGroup.valid).toBeTruthy();

            formGroup.addFormControlValidators('fieldNumber1', Validators.required);
            formGroup.setControlValue('fieldNumber1', undefined);

            expect(formGroup.get('fieldNumber1').valid).toBeFalsy();
            expect(formGroup.get('fieldNumber1').errors).toEqual({ required: true });
        });

        it('should add on to current validators', () => {
            expect(formGroup.get('fieldNumber1').valid).toBeTruthy();
            expect(formGroup.valid).toBeTruthy();
            formGroup.getControl('fieldNumber1').setValidators(Validators.required);
            formGroup.setControlValue('fieldNumber1', undefined);

            // Initially, it should just be required
            expect(formGroup.get('fieldNumber1').errors).toEqual({ required: true });
            // add the required min validator, repatch and verify that still required
            formGroup.addFormControlValidators('fieldNumber1', Validators.min(0));
            formGroup.setControlValue('fieldNumber1', undefined);
            expect(formGroup.get('fieldNumber1').errors).toEqual({
                required: true,
            });

            // patch a sub min value and verify that the new validator works
            formGroup.setControlValue('fieldNumber1', -1);
            expect(formGroup.get('fieldNumber1').errors).toEqual({
                min: { min: 0, actual: -1 },
            });

            // re-patch and verify that the required validator still works
            formGroup.setControlValue('fieldNumber1', undefined);
            expect(formGroup.get('fieldNumber1').errors).toEqual({
                required: true,
            });
        });
    });

    describe('addFormValidationGroup', () => {
        it('should revalidate the grouped fields once the first is set', fakeAsync(() => {
            formGroup.addFormValidationGroup('fieldNumber1', 'fieldNumber2');

            // create a form such that fieldNumber1 must be greater than the value of fieldNumber2.
            // On updating fieldNumber2, recheck fieldNumber1.
            const greaterThanField2: ValidatorFn = (ctrl) => {
                const f2Value: number = ctrl.parent.get('fieldNumber2').value;
                if (ctrl.value <= f2Value) {
                    return {
                        invalid: true,
                    };
                }
                return undefined;
            };

            // create a valid form (f1>f2)
            formGroup.addFormControlValidators('fieldNumber1', greaterThanField2);
            formGroup.setControlValue('fieldNumber1', 2);
            formGroup.setControlValue('fieldNumber2', 1);
            flush();
            // The form should initially be valid
            expect(formGroup.valid).toEqual(true);

            // make form invalid by changing f2 to be greater than field 1
            formGroup.setControlValue('fieldNumber2', 3);
            flush(); // wait for subscription to update validity of fieldNumber2
            // Validate that fieldNumber1 is now invalid (even though we didn't explicitly touch)
            expect(formGroup.getControl('fieldNumber1').errors).toEqual({
                invalid: true,
            });
        }));
    });

    describe('addRequiredFieldGrouping', () => {
        const requiredRelated = { requiredRelated: true };
        const required = { required: true };

        it('should default the group if not passed', () => {
            formGroup.addRequiredFieldGrouping(['fieldNumber1', 'fieldString', 'fieldNumber2']);
            expect(Object.keys(formGroup['_fieldGroupsValueState'])).toEqual(['fieldNumber1_fieldNumber2_fieldString']);
        });
        it('should not default the group if passed', () => {
            formGroup.addRequiredFieldGrouping(['fieldNumber1', 'fieldString', 'fieldNumber2'], 'relatedGroup');
            expect(Object.keys(formGroup['_fieldGroupsValueState'])).toEqual(['relatedGroup']);
        });

        describe('validations', () => {
            beforeEach(() => {
                formGroup.addRequiredFieldGrouping(['fieldNumber1', 'fieldNumber2', 'fieldString']);
            });

            it('should be valid if no fields are set', fakeAsync(() => {
                formGroup.setControlValue('fieldString', null);
                formGroup.setControlValue('fieldNumber2', null);
                formGroup.setControlValue('fieldNumber1', null);
                formGroup.getControl('fieldString').updateValueAndValidity();
                formGroup.getControl('fieldNumber2').updateValueAndValidity();
                formGroup.getControl('fieldNumber1').updateValueAndValidity();
                flush();

                expect(formGroup.getRawValue()).toEqual({
                    fieldString: null,
                    fieldNumber2: null,
                    fieldNumber1: null,
                    fieldBoolean: null,
                });
                expect(formGroup.getControl('fieldString').errors).toBeFalsy();
                expect(formGroup.getControl('fieldNumber2').errors).toBeFalsy();
                expect(formGroup.getControl('fieldNumber1').errors).toBeFalsy();
                expect(formGroup.valid).toBeTruthy();
            }));

            it('should be invalid if only one fields is set', fakeAsync(() => {
                formGroup.setControlValue('fieldString', null);
                formGroup.setControlValue('fieldNumber2', 1);
                formGroup.setControlValue('fieldNumber1', null);
                formGroup.getControl('fieldString').updateValueAndValidity();
                formGroup.getControl('fieldNumber2').updateValueAndValidity();
                formGroup.getControl('fieldNumber1').updateValueAndValidity();
                flush();

                expect(formGroup.getRawValue()).toEqual({
                    fieldString: null,
                    fieldNumber2: 1,
                    fieldNumber1: null,
                    fieldBoolean: null,
                });
                expect(formGroup.getControl('fieldString').errors).toEqual(required);
                expect(formGroup.getControl('fieldNumber2').errors).toEqual(requiredRelated);
                expect(formGroup.getControl('fieldNumber1').errors).toEqual(required);
                expect(formGroup.valid).toBeFalsy();
            }));

            it('should be valid if all fields are set', fakeAsync(() => {
                formGroup.setControlValue('fieldString', 'a');
                formGroup.setControlValue('fieldNumber2', 1);
                formGroup.setControlValue('fieldNumber1', 1);
                formGroup.getControl('fieldString').updateValueAndValidity();
                formGroup.getControl('fieldNumber2').updateValueAndValidity();
                formGroup.getControl('fieldNumber1').updateValueAndValidity();
                flush();

                expect(formGroup.getRawValue()).toEqual({
                    fieldString: 'a',
                    fieldNumber2: 1,
                    fieldNumber1: 1,
                    fieldBoolean: null,
                });
                expect(formGroup.getControl('fieldString').errors).toBeFalsy();
                expect(formGroup.getControl('fieldNumber2').errors).toBeFalsy();
                expect(formGroup.getControl('fieldNumber1').errors).toBeFalsy();
                expect(formGroup.valid).toBeTruthy();
            }));

            it('should be invalid if one field is blank', fakeAsync(() => {
                formGroup.setControlValue('fieldString', '');
                formGroup.setControlValue('fieldNumber2', 1);
                formGroup.setControlValue('fieldNumber1', 1);
                formGroup.getControl('fieldString').updateValueAndValidity();
                formGroup.getControl('fieldNumber2').updateValueAndValidity();
                formGroup.getControl('fieldNumber1').updateValueAndValidity();
                flush();

                expect(formGroup.getRawValue()).toEqual({
                    fieldString: '',
                    fieldNumber2: 1,
                    fieldNumber1: 1,
                    fieldBoolean: null,
                });
                expect(formGroup.getControl('fieldString').errors).toEqual(required);
                expect(formGroup.getControl('fieldNumber2').errors).toEqual(requiredRelated);
                expect(formGroup.getControl('fieldNumber1').errors).toEqual(requiredRelated);
                expect(formGroup.valid).toBeFalsy();
            }));
        });

        it('should add form validation group by default', () => {
            jest.spyOn(formGroup, 'addFormValidationGroup');

            formGroup.addRequiredFieldGrouping(['fieldNumber1', 'fieldNumber2']);

            expect(formGroup.addFormValidationGroup).toHaveBeenCalledWith('fieldNumber1', 'fieldNumber2');
        });

        it('should not add form validation group if option is disabled', () => {
            jest.spyOn(formGroup, 'addFormValidationGroup');

            formGroup.addRequiredFieldGrouping(['fieldNumber1', 'fieldNumber2'], null, {
                addFormValidationGroup: false,
            });

            expect(formGroup.addFormValidationGroup).not.toHaveBeenCalled();
        });
        it('should report an error if fields are already grouped', () => {
            formGroup.addRequiredFieldGrouping(['fieldNumber2', 'fieldNumber1']);
            // add fields in different order, still using implicit group
            expect(() => formGroup.addRequiredFieldGrouping(['fieldNumber1', 'fieldNumber2'])).toThrowError(
                'Field group "fieldNumber1_fieldNumber2" already exists in fieldNumber1_fieldNumber2'
            );
        });
    });

    describe('isRequiredFieldGroupDisplayed', () => {
        describe.each`
            booleanValue | numberValue | stringValue | expected
            ${null}      | ${null}     | ${null}     | ${false}
            ${false}     | ${null}     | ${null}     | ${false}
            ${null}      | ${null}     | ${''}       | ${false}
            ${true}      | ${3}        | ${null}     | ${true}
            ${null}      | ${0}        | ${null}     | ${true}
            ${null}      | ${1}        | ${null}     | ${true}
            ${null}      | ${null}     | ${'Value'}  | ${true}
            ${true}      | ${1}        | ${null}     | ${true}
        `('return value', ({ booleanValue, numberValue, stringValue, expected }) => {
            it(`should be ${expected} when initial values are set to fieldBoolean=${booleanValue}, fieldNumber1=${numberValue}, fieldString=${stringValue}`, fakeAsync(() => {
                formGroup.patchValue({
                    fieldNumber1: numberValue,
                    fieldString: stringValue,
                    fieldBoolean: booleanValue,
                });
                formGroup.addRequiredFieldGrouping(['fieldNumber1', 'fieldString', 'fieldBoolean'], 'group');
                formGroup.updateValueAndValidity();

                expectObservable(formGroup.isRequiredFieldGroupDisplayed('group')).toEqual(expected);
            }));
        });
        it('should handle updates', fakeAsync(() => {
            // initially set
            formGroup.patchValue({ fieldNumber1: 1, fieldString: 'String' });
            formGroup.addRequiredFieldGrouping(['fieldNumber1', 'fieldString'], 'group');
            formGroup.updateValueAndValidity();
            // and verify...
            expectObservable(formGroup.isRequiredFieldGroupDisplayed('group')).toEqual(true);

            // clear out
            formGroup.patchValue({ fieldNumber1: null, fieldString: null });
            formGroup.updateValueAndValidity();

            // and verify that it reports the updated value
            expectObservable(formGroup.isRequiredFieldGroupDisplayed('group')).toEqual(false);
        }));

        it('should throw an error if the field group does not exist', () => {
            expect(() => formGroup.isRequiredFieldGroupDisplayed('Foo')).toThrowError(
                'Field group "Foo" is not registered.  Make sure to call "addRequiredFieldGrouping" first and specify this group name'
            );
        });
    });

    describe('addClearOnClearedListener', () => {
        it('should clear the second field once the first is cleared', fakeAsync(() => {
            formGroup.addClearOnClearedListener('fieldNumber2', ['fieldNumber1']);

            formGroup.setControlValue('fieldNumber2', null); // trigger the clear
            flush(); // wait for the subscription to fire and process

            expect(formGroup.getControlValue('fieldNumber1')).toBeFalsy();
        }));
    });

    describe.each`
        initialValue | newValue | cleared
        ${1}         | ${2}     | ${true}
        ${null}      | ${1}     | ${true}
        ${1}         | ${null}  | ${true}
        ${1}         | ${1}     | ${false}
        ${null}      | ${null}  | ${false}
    `('addClearOnChangeListener', ({ initialValue, newValue, cleared }) => {
        it(`should ${cleared ? '' : 'not '}clear when changing from ${initialValue} to ${newValue}`, () => {
            const field2InitialValue = 22;
            formGroup = new TypedFormGroup(
                formBuilder.group({ ...new Model(), fieldNumber1: initialValue, fieldNumber2: field2InitialValue }),
                componentDestroyed
            );
            formGroup.addClearOnChangeListener('fieldNumber1', ['fieldNumber2']);
            const control1 = formGroup.getControl('fieldNumber1');
            const control2 = formGroup.getControl('fieldNumber2');
            // verifying initial values
            expect(control1.value).toEqual(initialValue);
            expect(control2.value).toEqual(field2InitialValue);
            // set new value and verify cleared or not cleared
            control1.setValue(newValue);
            expect(control1.value).toEqual(newValue);
            if (cleared) {
                expect(control2.value).toBeNull();
            } else {
                expect(control2.value).toEqual(field2InitialValue);
            }
        });
    });

    describe('addDefaultWhenSetListener', () => {
        describe.each`
            booleanValue | expectedToDefault
            ${true}      | ${true}
            ${false}     | ${false}
            ${null}      | ${false}
            ${undefined} | ${false}
        `('boolean fields', ({ booleanValue, expectedToDefault }) => {
            it(`should ${expectedToDefault ? '' : 'not '}default when value=${booleanValue}`, fakeAsync(() => {
                formGroup.addDefaultWhenSetListener('fieldBoolean', 'fieldString', 'Defaulted');

                formGroup.setControlValue('fieldBoolean', booleanValue);
                flush();

                expect(formGroup.getControlValue('fieldString')).toEqual(expectedToDefault ? 'Defaulted' : null);
            }));
        });

        describe.each`
            stringValue    | expectedToDefault
            ${'Not Blank'} | ${true}
            ${'false'}     | ${true}
            ${''}          | ${false}
            ${null}        | ${false}
            ${undefined}   | ${false}
        `('string fields', ({ stringValue, expectedToDefault }) => {
            it(`should ${expectedToDefault ? '' : 'not '}default when value="${stringValue}"`, fakeAsync(() => {
                formGroup.addDefaultWhenSetListener('fieldString', 'fieldNumber1', 5);

                formGroup.setControlValue('fieldString', stringValue);
                flush();

                expect(formGroup.getControlValue('fieldNumber1')).toEqual(expectedToDefault ? 5 : null);
            }));
        });

        describe.each`
            numberValue  | expectedToDefault
            ${'0'}       | ${true}
            ${'1'}       | ${true}
            ${'2'}       | ${true}
            ${null}      | ${false}
            ${undefined} | ${false}
        `('number fields', ({ numberValue, expectedToDefault }) => {
            it(`should ${expectedToDefault ? '' : 'not '}default when value="${numberValue}"`, fakeAsync(() => {
                formGroup.addDefaultWhenSetListener('fieldNumber1', 'fieldString', 'Defaulted');

                formGroup.setControlValue('fieldNumber1', numberValue);
                flush();

                expect(formGroup.getControlValue('fieldString')).toEqual(expectedToDefault ? 'Defaulted' : null);
            }));
        });

        it('should not default the field if it already has a value', fakeAsync(() => {
            formGroup.setControlValue('fieldString', 'initialValue');
            formGroup.addDefaultWhenSetListener('fieldNumber1', 'fieldString', 'Defaulted');

            formGroup.setControlValue('fieldNumber1', 1);
            flush();

            expect(formGroup.getControlValue('fieldString')).toEqual('initialValue');
        }));
    });

    describe('invalidControls', () => {
        it('should output the invalid form controls', () => {
            formGroup.getControl('fieldNumber1').setErrors({ invalidInteger: { valid: false } });
            formGroup.getControl('fieldNumber2').setErrors({ invalidString: { valid: false } });
            formGroup.updateValueAndValidity();

            expect(formGroup.invalidControls) //
                .toEqual({
                    fieldNumber1: { invalidInteger: { valid: false } },
                    fieldNumber2: { invalidString: { valid: false } },
                });
        });
    });
});
