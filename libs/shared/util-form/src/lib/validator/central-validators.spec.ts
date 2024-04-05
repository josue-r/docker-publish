import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Moment } from 'moment';
import { ReplaySubject } from 'rxjs';
import { TypedFormGroup } from '../form/typed-form-group';
import { CentralValidators } from './central-validators';
import { DecimalOptions } from './decimal-options';
import { IntegerOptions } from './integer-options';

describe('CentralValidators', () => {
    it('should validate decimals', () => {
        function getErrors(value: any, decimalOptions?: DecimalOptions) {
            return CentralValidators.decimal(decimalOptions)(new FormControl(value));
        }
        function expectValid(value: any, decimalOptions?: DecimalOptions) {
            const error = getErrors(value, decimalOptions);
            expect(error).toBeFalsy();
            return error;
        }
        function expectInvalid(value: any, decimalOptions?: DecimalOptions) {
            const error = getErrors(value, decimalOptions);
            expect(error).toBeTruthy();
            return error;
        }

        expectValid(null);
        expectValid(undefined);
        expectValid('-1', { min: -9999.99 });
        expectValid('-1.5', { min: -9999.99 });
        expectValid('-1.5', { decimalPlaces: 2, min: -9999.99 });
        expectValid('-1.50', { decimalPlaces: 1, min: -9999.99 });
        expectValid('0');
        expectValid(' 0 ');
        expectValid('0.42');
        expectValid('.42');
        expectValid('99,999');
        expectInvalid('#abcdef');
        expectInvalid('blah');
        expectInvalid({ blah: 1 });

        expectInvalid('99999.99');
        expectInvalid('99', { max: 10 });
        expectInvalid('-99');
        expectInvalid('-99999.99', { min: -9999.99 });

        expect(expectInvalid('-1.5', { decimalPlaces: 0, min: -9999.99 })).toEqual({
            invalidDecimal: { valid: false, decimalPlaces: 0 },
        });
        expect(expectInvalid('0.423')).toEqual({ invalidDecimal: { valid: false, decimalPlaces: 2 } });

        // Number literals:
        expectValid(-1, { min: -9999.99 });
        expectValid(0);
        expectValid(1.1);
        expectValid(8e5, { max: 10e5 });

        // Whitespace strings:
        expectValid('');
        expectValid(' ');
        expectValid('\t\t');
        expectValid('\n\r');
    });

    it('should validate integers', () => {
        function getErrors(value: any, integerOptions?: IntegerOptions) {
            return CentralValidators.integer(integerOptions)(new FormControl(value));
        }
        function expectValid(value: any, integerOptions?: IntegerOptions) {
            const error = getErrors(value, integerOptions);
            expect(error).toBeFalsy();
            return error;
        }
        function expectInvalid(value: any, message: string, integerOptions?: IntegerOptions) {
            const error = getErrors(value, integerOptions);
            expect(error).toBeTruthy();
            return error;
        }

        expectValid('0');
        expectValid('99');

        expectInvalid('99.9', 'invalid integer value');
        expectInvalid('99999', 'value exceeds default max');
        expectInvalid('99', 'value exceeds custom max', { max: 10 });
        expectInvalid('-99', 'value under default min');
        expectInvalid('-99999', 'value under custom min', { min: -9999.99 });
    });

    describe.each`
        date1                   | date2                   | inclusive | valid
        ${moment('2019-01-21')} | ${moment('2019-01-20')} | ${true}   | ${true}
        ${moment('2019-01-21')} | ${moment('2019-01-20')} | ${false}  | ${true}
        ${moment('2019-01-21')} | ${moment('2019-01-21')} | ${true}   | ${true}
        ${moment('2019-01-21')} | ${moment('2019-01-21')} | ${false}  | ${false}
        ${moment('2019-01-20')} | ${moment('2019-01-21')} | ${true}   | ${false}
        ${moment('2019-01-20')} | ${moment('2019-01-21')} | ${false}  | ${false}
        ${'2019-01-21'}         | ${'2019-01-20'}         | ${true}   | ${true}
        ${'2019-01-21'}         | ${'2019-01-20'}         | ${false}  | ${true}
        ${'2019-01-21'}         | ${'2019-01-21'}         | ${true}   | ${true}
        ${'2019-01-21'}         | ${'2019-01-21'}         | ${false}  | ${false}
        ${'2019-01-20'}         | ${'2019-01-21'}         | ${true}   | ${false}
        ${'2019-01-20'}         | ${'2019-01-21'}         | ${false}  | ${false}
        ${'2019-01-21'}         | ${moment('2019-01-20')} | ${true}   | ${true}
        ${'2019-01-21'}         | ${moment('2019-01-20')} | ${false}  | ${true}
        ${'2019-01-21'}         | ${moment('2019-01-21')} | ${true}   | ${true}
        ${'2019-01-21'}         | ${moment('2019-01-21')} | ${false}  | ${false}
        ${'2019-01-20'}         | ${moment('2019-01-21')} | ${true}   | ${false}
        ${'2019-01-20'}         | ${moment('2019-01-21')} | ${false}  | ${false}
        ${moment('2019-01-21')} | ${'2019-01-20'}         | ${true}   | ${true}
        ${moment('2019-01-21')} | ${'2019-01-20'}         | ${false}  | ${true}
        ${moment('2019-01-21')} | ${'2019-01-21'}         | ${true}   | ${true}
        ${moment('2019-01-21')} | ${'2019-01-21'}         | ${false}  | ${false}
        ${moment('2019-01-20')} | ${'2019-01-21'}         | ${true}   | ${false}
        ${moment('2019-01-20')} | ${'2019-01-21'}         | ${false}  | ${false}
        ${null}                 | ${moment('2019-01-21')} | ${true}   | ${true}
        ${null}                 | ${moment('2019-01-21')} | ${false}  | ${true}
        ${null}                 | ${'2019-01-21'}         | ${true}   | ${true}
        ${null}                 | ${'2019-01-21'}         | ${false}  | ${true}
        ${moment('2019-01-21')} | ${null}                 | ${true}   | ${true}
        ${moment('2019-01-21')} | ${null}                 | ${false}  | ${true}
        ${'2019-01-21'}         | ${null}                 | ${true}   | ${true}
        ${'2019-01-21'}         | ${null}                 | ${false}  | ${true}
    `('dateAfterValidator', ({ date1, date2, inclusive, valid }) => {
        it(`should ${valid ? 'not ' : ''}error on comparing ${date1} to ${date2} & inclusive=${inclusive}`, () => {
            const error = CentralValidators.dateAfterValidator(
                new FormControl(date2),
                inclusive
            )(new FormControl(date1));
            if (valid) {
                expect(error).toBeFalsy();
            } else {
                expect(error).toBeTruthy();
            }
        });
    });

    describe.each`
        date1                   | date2                   | inclusive | valid
        ${moment('2019-01-21')} | ${moment('2019-01-20')} | ${true}   | ${false}
        ${moment('2019-01-21')} | ${moment('2019-01-20')} | ${false}  | ${false}
        ${moment('2019-01-21')} | ${moment('2019-01-21')} | ${true}   | ${true}
        ${moment('2019-01-21')} | ${moment('2019-01-21')} | ${false}  | ${false}
        ${moment('2019-01-20')} | ${moment('2019-01-21')} | ${true}   | ${true}
        ${moment('2019-01-20')} | ${moment('2019-01-21')} | ${false}  | ${true}
        ${'2019-01-21'}         | ${'2019-01-20'}         | ${true}   | ${false}
        ${'2019-01-21'}         | ${'2019-01-20'}         | ${false}  | ${false}
        ${'2019-01-21'}         | ${'2019-01-21'}         | ${true}   | ${true}
        ${'2019-01-21'}         | ${'2019-01-21'}         | ${false}  | ${false}
        ${'2019-01-20'}         | ${'2019-01-21'}         | ${true}   | ${true}
        ${'2019-01-20'}         | ${'2019-01-21'}         | ${false}  | ${true}
        ${'2019-01-21'}         | ${moment('2019-01-20')} | ${true}   | ${false}
        ${'2019-01-21'}         | ${moment('2019-01-20')} | ${false}  | ${false}
        ${'2019-01-21'}         | ${moment('2019-01-21')} | ${true}   | ${true}
        ${'2019-01-21'}         | ${moment('2019-01-21')} | ${false}  | ${false}
        ${'2019-01-20'}         | ${moment('2019-01-21')} | ${true}   | ${true}
        ${'2019-01-20'}         | ${moment('2019-01-21')} | ${false}  | ${true}
        ${moment('2019-01-21')} | ${'2019-01-20'}         | ${true}   | ${false}
        ${moment('2019-01-21')} | ${'2019-01-20'}         | ${false}  | ${false}
        ${moment('2019-01-21')} | ${'2019-01-21'}         | ${true}   | ${true}
        ${moment('2019-01-21')} | ${'2019-01-21'}         | ${false}  | ${false}
        ${moment('2019-01-20')} | ${'2019-01-21'}         | ${true}   | ${true}
        ${moment('2019-01-20')} | ${'2019-01-21'}         | ${false}  | ${true}
        ${null}                 | ${moment('2019-01-21')} | ${true}   | ${true}
        ${null}                 | ${moment('2019-01-21')} | ${false}  | ${true}
        ${null}                 | ${'2019-01-21'}         | ${true}   | ${true}
        ${null}                 | ${'2019-01-21'}         | ${false}  | ${true}
        ${moment('2019-01-21')} | ${null}                 | ${true}   | ${true}
        ${moment('2019-01-21')} | ${null}                 | ${false}  | ${true}
        ${'2019-01-21'}         | ${null}                 | ${true}   | ${true}
        ${'2019-01-21'}         | ${null}                 | ${false}  | ${true}
    `('dateBeforeValidator', ({ date1, date2, inclusive, valid }) => {
        it(`should ${valid ? 'not ' : ''}error on comparing ${date1} to ${date2} & inclusive=${inclusive}`, () => {
            const error = CentralValidators.dateBeforeValidator(
                new FormControl(date2),
                inclusive
            )(new FormControl(date1));
            if (valid) {
                expect(error).toBeFalsy();
            } else {
                expect(error).toBeTruthy();
            }
        });
    });

    describe('dateAfterTodayValidator', () => {
        const today = moment().startOf('day');
        const toApiDateFormat = (date: Moment) => date.format('YYYY-MM-DD[T]HH:mm:ss.SSS');

        describe.each`
            date                                                   | inclusive | valid
            ${today}                                               | ${true}   | ${true}
            ${today}                                               | ${false}  | ${false}
            ${toApiDateFormat(today)}                              | ${true}   | ${true}
            ${toApiDateFormat(today)}                              | ${false}  | ${false}
            ${today.clone().add(1, 'day')}                         | ${true}   | ${true}
            ${today.clone().add(1, 'day')}                         | ${false}  | ${true}
            ${toApiDateFormat(today.clone().add(1, 'day'))}        | ${true}   | ${true}
            ${toApiDateFormat(today.clone().add(1, 'day'))}        | ${false}  | ${true}
            ${today.clone().add(1, 'month')}                       | ${true}   | ${true}
            ${today.clone().add(1, 'month')}                       | ${false}  | ${true}
            ${toApiDateFormat(today.clone().add(1, 'month'))}      | ${true}   | ${true}
            ${toApiDateFormat(today.clone().add(1, 'month'))}      | ${false}  | ${true}
            ${today.clone().subtract(1, 'day')}                    | ${true}   | ${false}
            ${today.clone().subtract(1, 'day')}                    | ${false}  | ${false}
            ${toApiDateFormat(today.clone().subtract(1, 'day'))}   | ${true}   | ${false}
            ${toApiDateFormat(today.clone().subtract(1, 'day'))}   | ${false}  | ${false}
            ${today.clone().subtract(1, 'month')}                  | ${true}   | ${false}
            ${today.clone().subtract(1, 'month')}                  | ${false}  | ${false}
            ${toApiDateFormat(today.clone().subtract(1, 'month'))} | ${true}   | ${false}
            ${toApiDateFormat(today.clone().subtract(1, 'month'))} | ${false}  | ${false}
            ${null}                                                | ${true}   | ${true}
            ${null}                                                | ${false}  | ${true}
        `('validation', ({ date, inclusive, valid }) => {
            it(`should ${valid ? 'not ' : ''}error on ${date} & inclusive=${inclusive}`, () => {
                const error = CentralValidators.dateAfterTodayValidator(inclusive)(new FormControl(date));
                if (valid) {
                    expect(error).toBeFalsy();
                } else {
                    expect(error).toBeTruthy();
                }
            });
        });
    });

    describe('required', () => {
        const mockValidator = jest.fn();
        const returnValue = { return: 'value' };
        let originalRequiredFunction: ValidatorFn;

        beforeAll(() => {
            // mock the required validator but preserve to reset after tests are done
            originalRequiredFunction = Validators.required;
            mockValidator.mockReturnValue(returnValue);
            Validators.required = mockValidator;
        });

        afterAll(() => {
            // reset mock
            Validators.required = originalRequiredFunction;
        });

        it('should default condition to always', () => {
            const control = new FormControl();

            expect(CentralValidators.required()(control)).toEqual(returnValue);
            expect(Validators.required).toHaveBeenCalledWith(control);
        });

        it('should defer to Validators.required when condition is always', () => {
            const control = new FormControl();

            expect(CentralValidators.required('always')(control)).toEqual(returnValue);
            expect(Validators.required).toHaveBeenCalledWith(control);
        });

        it('should defer to Validators.required when condition is if-dirty and control is dirty', () => {
            const control = new FormControl();
            control.markAsDirty();

            expect(CentralValidators.required('if-dirty')(control)).toEqual(returnValue);
            expect(Validators.required).toHaveBeenCalledWith(control);
        });

        it('should return null when condition is if-dirty and control is not dirty', () => {
            const control = new FormControl();

            expect(CentralValidators.required('if-dirty')(control)).toEqual(null);
        });
    });

    describe('required', () => {
        let formBuilder: FormBuilder;
        let componentDestroyed: ReplaySubject<any>;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [ReactiveFormsModule],
            });
            formBuilder = TestBed.inject(FormBuilder);
            componentDestroyed = new ReplaySubject(1);
        });

        afterEach(() => componentDestroyed.next());

        describe.each`
            value1  | value2  | valid
            ${'v1'} | ${'v2'} | ${true}
            ${'v1'} | ${null} | ${true}
            ${null} | ${'v2'} | ${true}
            ${null} | ${null} | ${false}
        `('oneOfRequired', ({ value1, value2, valid }) => {
            interface TestType {
                value1: string;
                value2: string;
            }

            it(`should be ${valid ? '' : 'in'}valid if value1=${value1} & value2=${value2}`, () => {
                const value: TestType = { value1, value2 };
                const form: TypedFormGroup<TestType> = TypedFormGroup.create(
                    formBuilder.group(value),
                    componentDestroyed
                );
                form.addFormControlValidators('value1', CentralValidators.oneOfRequired(form, 'value2'));
                form.getControl('value1').updateValueAndValidity();
                expect(form.getControl('value1').hasError('oneOfRequired')).toEqual(!valid);
            });
        });

        describe.each`
            value1  | value2  | validValue1 | validValue2
            ${0}    | ${0}    | ${true}     | ${true}
            ${0}    | ${null} | ${true}     | ${false}
            ${null} | ${0}    | ${false}    | ${true}
            ${null} | ${null} | ${true}     | ${true}
        `('requiredIfFieldPresent', ({ value1, value2, validValue1, validValue2 }) => {
            interface TestType {
                value1: number;
                value2: number;
            }

            it(`value1 ${validValue1 ? '' : 'in'}valid and value2 ${
                validValue2 ? '' : 'in'
            }valid if value1=${value1} & value2=${value2}`, () => {
                const value: TestType = { value1, value2 };
                const form: TypedFormGroup<TestType> = TypedFormGroup.create(
                    formBuilder.group(value),
                    componentDestroyed
                );
                form.addFormControlValidators('value1', CentralValidators.requiredIfFieldPresent(form, 'value2'));
                form.addFormControlValidators('value2', CentralValidators.requiredIfFieldPresent(form, 'value1'));
                form.getControl('value1').updateValueAndValidity();
                form.getControl('value2').updateValueAndValidity();
                expect(form.getControl('value1').hasError('required')).toEqual(!validValue1);
                expect(form.getControl('value2').hasError('required')).toEqual(!validValue2);
            });
        });

        describe.each`
            value1  | value2  | validValue1 | validValue2
            ${0}    | ${0}    | ${false}    | ${false}
            ${0}    | ${null} | ${true}     | ${true}
            ${null} | ${0}    | ${true}     | ${true}
            ${null} | ${null} | ${true}     | ${true}
        `('requiredIfFieldNotPresent', ({ value1, value2, validValue1, validValue2 }) => {
            interface TestType {
                value1: number;
                value2: number;
            }

            it(`value1 ${validValue1 ? '' : 'in'}valid and value2 ${
                validValue2 ? '' : 'in'
            }valid if value1=${value1} & value2=${value2}`, () => {
                const value: TestType = { value1, value2 };
                const form: TypedFormGroup<TestType> = TypedFormGroup.create(
                    formBuilder.group(value),
                    componentDestroyed
                );
                form.addFormControlValidators('value1', CentralValidators.requiredIfFieldNotPresent(form, 'value2'));
                form.addFormControlValidators('value2', CentralValidators.requiredIfFieldNotPresent(form, 'value1'));
                form.getControl('value1').updateValueAndValidity();
                form.getControl('value2').updateValueAndValidity();
                expect(form.getControl('value1').hasError('onlyOneRequired')).toEqual(!validValue1);
                expect(form.getControl('value2').hasError('onlyOneRequired')).toEqual(!validValue2);
            });
        });
    });

    describe.each`
        url                                            | valid
        ${'not a url'}                                 | ${false}
        ${'http://url.com'}                            | ${true}
        ${'https://url.com'}                           | ${true}
        ${'https://url.com/deep/link'}                 | ${true}
        ${'https://url.com:8080'}                      | ${true}
        ${'https://url.com/endpoint?queryParam=param'} | ${true}
    `('url', ({ url, valid }) => {
        it(`should validate ${valid ? '' : 'in'}valid url ${url}`, () => {
            const control = new FormControl(url, CentralValidators.url());
            control.updateValueAndValidity();
            expect(control.hasError('invalidUrl')).toEqual(!valid);
        });
    });
});
