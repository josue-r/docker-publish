import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { OfferContent } from '@vioc-angular/central-ui/discount/data-access-offer-content';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { OfferContentModuleForms } from './offer-content-module-forms';

describe('OfferContentModuleForms', () => {
    describe('registerForms', () => {
        it('should register OfferContent models', () => {
            const mockFormFactory = { register: jest.fn() } as unknown as FormFactory;
            OfferContentModuleForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('OfferContent', expect.any(Function));
        });
    });

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        const testOfferContent: OfferContent = new OfferContent();
        const changeDetector = {} as ChangeDetectorRef;
        let componentDestroyed: ReplaySubject<any>;

        beforeAll(() => OfferContentModuleForms.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        it('should require changeDetector', () => {
            expect(() => formFactory.group('OfferContent', new OfferContent(), componentDestroyed)).toThrow();
        });

        describe('OfferContent', () => {
            describe.each`
                field
                ${'name'}
                ${'active'}
                ${'shortText'}
            `('required fields', ({ field }) => {
                it(`should validate that ${field} is required`, () => {
                    const group = formFactory.group('OfferContent', testOfferContent, componentDestroyed, {
                        changeDetector,
                        accessMode: AccessMode.EDIT,
                    });
                    group.getControl(field).updateValueAndValidity();
                    expect(group.getControl(field).hasError('required')).toBe(true);
                });
            });

            describe('maxLenth fields', () => {
                describe('name', () => {
                    it('should validate that name has a max lenght of 100', () => {
                        const group = formFactory.group('OfferContent', testOfferContent, componentDestroyed, {
                            changeDetector,
                            accessMode: AccessMode.EDIT,
                        });
                        group.getControl('name').setValue('a'.repeat(101));
                        expect(group.getControl('name').hasError('maxlength')).toBe(true);
                    });
                });

                describe.each`
                    field
                    ${'shortText'}
                    ${'disclaimerShortText'}
                `('shortText, disclaimerShortText', ({ field }) => {
                    it(`should validate that ${field} has a max length of 512`, () => {
                        const group = formFactory.group('OfferContent', testOfferContent, componentDestroyed, {
                            changeDetector,
                            accessMode: AccessMode.EDIT,
                        });
                        group.getControl(field).setValue('a'.repeat(513));
                        expect(group.getControl(field).hasError('maxlength')).toBe(true);
                    });
                });

                describe.each`
                    field
                    ${'longText'}
                    ${'disclaimerLongText'}
                    ${'conditions'}
                `('longText, disclaimerLongText, conditions', ({ field }) => {
                    it(`should validate that ${field} has a max length of 2000`, () => {
                        const group = formFactory.group('OfferContent', testOfferContent, componentDestroyed, {
                            changeDetector,
                            accessMode: AccessMode.EDIT,
                        });
                        group.getControl(field).setValue('a'.repeat(2001));
                        expect(group.getControl(field).hasError('maxlength')).toBe(true);
                    });
                });
            });
        });
    });
});
