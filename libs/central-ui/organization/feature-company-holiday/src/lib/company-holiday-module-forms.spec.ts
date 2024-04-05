import { FormArray, FormBuilder } from '@angular/forms';
import { CompanyHoliday, StoreHoliday } from '@vioc-angular/central-ui/organization/data-access-company-holiday';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { CompanyHolidayForms } from './company-holiday-module-forms';

describe('CompanyHolidayForms', () => {
    describe('registerForms', () => {
        it('should register company holiday model', () => {
            const mockFormFactory = { register: jest.fn() } as unknown as FormFactory;
            CompanyHolidayForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('CompanyHoliday', expect.any(Function));
            expect(mockFormFactory.register).toHaveBeenCalledWith('StoreHoliday', expect.any(Function));
        });
    });
    const formBuilder = new FormBuilder();
    const formFactory = new FormFactory(formBuilder);
    let componentDestroyed: ReplaySubject<any>;

    beforeAll(() => CompanyHolidayForms.registerForms(formFactory, formBuilder));
    beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
    afterEach(() => componentDestroyed.next());

    describe('validations', () => {
        it('should not disable the form', () => {
            const group = formFactory.group('CompanyHoliday', new CompanyHoliday(), componentDestroyed);
            expect(group.disabled).toEqual(false);
        });

        it('should convert storeHolidays to a FormArray & store is required', () => {
            const companyHoliday: CompanyHoliday = {
                ...new CompanyHoliday(),
                id: 999,
                storeHolidays: [new StoreHoliday()],
            };
            const group = formFactory.group('CompanyHoliday', companyHoliday, componentDestroyed, {
                accessMode: AccessMode.EDIT,
            });
            expect(group.getControl('storeHolidays') instanceof FormArray).toBeTruthy();
            (group.getControl('storeHolidays') as FormArray).controls.forEach((sh: TypedFormGroup<StoreHoliday>) => {
                sh.getControl('store').updateValueAndValidity();
                expect(sh.getControl('store').hasError('required')).toBe(true);
            });
        });
    });
});
