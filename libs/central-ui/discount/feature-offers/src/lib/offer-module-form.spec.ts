import { FormBuilder } from '@angular/forms';
import { Offer } from '@vioc-angular/central-ui/discount/data-access-offers';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { FormFactory } from '@vioc-angular/shared/util-form';
import moment = require('moment');
import { ReplaySubject } from 'rxjs';
import { OfferModuleForms } from './offer-module-forms';

describe('OfferModuleForms', () => {
    describe('registerForms', () => {
        it('should register Offer models', () => {
            const mockFormFactory = { register: jest.fn() } as unknown as FormFactory;
            OfferModuleForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('Offer', expect.any(Function));
            expect(mockFormFactory.register).toHaveBeenCalledWith('StoreDiscount', expect.any(Function));
            expect(mockFormFactory.register).toHaveBeenCalledWith('Store', expect.any(Function));
        });
    });

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        let componentDestroyed: ReplaySubject<any>;

        beforeAll(() => OfferModuleForms.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        describe('Offer', () => {
            const today = moment().startOf('day');

            it('should set active to false if it is null', () => {
                const group = formFactory.group(
                    'Offer',
                    {
                        ...new Offer(),
                    },
                    componentDestroyed,
                    {
                        accessMode: AccessMode.EDIT,
                    }
                );
                expect(group.getControlValue('active')).toEqual(false);
            });

            describe.each`
                field               | value                   | error          | showError
                ${'amount'}         | ${0}                    | ${'min'}       | ${true}
                ${'amount'}         | ${1}                    | ${'min'}       | ${false}
                ${'daysToExpire'}   | ${0}                    | ${'min'}       | ${true}
                ${'daysToExpire'}   | ${1}                    | ${'min'}       | ${false}
                ${'expirationDate'} | ${today}                | ${'dateAfter'} | ${true}
                ${'expirationDate'} | ${today.clone().add(1)} | ${'dateAfter'} | ${false}
            `('form', ({ field, value, error, showError }) => {
                it(`should ${showError ? '' : 'not '}show error ${error} for field ${field} with ${value} 
            }`, () => {
                    const group = formFactory.group(
                        'Offer',
                        {
                            ...new Offer(),
                        },
                        componentDestroyed,
                        {
                            accessMode: AccessMode.EDIT,
                        }
                    );
                    group.getControl(field).setValue(value);
                    group.getControl(field).updateValueAndValidity();
                    expect(group.getControl(field).hasError(error)).toBe(showError);
                });
            });

            describe.each`
                field1            | field2              | value1  | value2                  | error                | showError
                ${'daysToExpire'} | ${'expirationDate'} | ${0}    | ${0}                    | ${'onlyOneRequired'} | ${true}
                ${'daysToExpire'} | ${'expirationDate'} | ${1}    | ${null}                 | ${'onlyOneRequired'} | ${false}
                ${'daysToExpire'} | ${'expirationDate'} | ${null} | ${today.clone().add(1)} | ${'onlyOneRequired'} | ${false}
                ${'daysToExpire'} | ${'expirationDate'} | ${null} | ${null}                 | ${'onlyOneRequired'} | ${false}
                ${'daysToExpire'} | ${'expirationDate'} | ${0}    | ${0}                    | ${'oneOfRequired'}   | ${false}
                ${'daysToExpire'} | ${'expirationDate'} | ${1}    | ${null}                 | ${'oneOfRequired'}   | ${false}
                ${'daysToExpire'} | ${'expirationDate'} | ${null} | ${today.clone().add(1)} | ${'oneOfRequired'}   | ${false}
                ${'daysToExpire'} | ${'expirationDate'} | ${null} | ${null}                 | ${'oneOfRequired'}   | ${true}
            `('form', ({ field1, field2, value1, value2, error, showError }) => {
                it(`should ${
                    showError ? '' : 'not '
                }show error ${error} for fields ${field1} and ${field2} with values ${value1} and ${value2}
            }`, () => {
                    const group = formFactory.group(
                        'Offer',
                        {
                            ...new Offer(),
                        },
                        componentDestroyed,
                        {
                            accessMode: AccessMode.EDIT,
                        }
                    );
                    group.getControl(field1).setValue(value1);
                    group.getControl(field2).setValue(value2);
                    group.getControl(field1).updateValueAndValidity();
                    group.getControl(field2).updateValueAndValidity();
                    expect(group.getControl(field1).hasError(error)).toBe(showError);
                    expect(group.getControl(field2).hasError(error)).toBe(showError);
                });
            });
        });
    });
});
