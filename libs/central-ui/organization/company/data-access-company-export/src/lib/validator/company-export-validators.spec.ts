import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Observable, of, ReplaySubject } from 'rxjs';
import { CompanyExportFacade } from '../facade/company-export-facade';
import { CompanyExportValidators } from './company-export-validators';

describe('CompanyExportValidators', () => {
    const companyExportValidators: CompanyExportValidators = new CompanyExportValidators();

    it.each`
        field             | type       | scope            | value   | apiValues                           | isDirty  | hasError
        ${'costAccount'}  | ${'COST'}  | ${'GRID'}        | ${'C1'} | ${[{ code: 'C1' }, { code: 'C2' }]} | ${true}  | ${false}
        ${'salesAccount'} | ${'SALES'} | ${'GRID'}        | ${'S1'} | ${[{ code: 'S1' }, { code: 'S2' }]} | ${true}  | ${false}
        ${'costAccount'}  | ${'COST'}  | ${'GRID'}        | ${null} | ${[]}                               | ${true}  | ${false}
        ${'costAccount'}  | ${'COST'}  | ${'GRID'}        | ${null} | ${[]}                               | ${true}  | ${false}
        ${'costAccount'}  | ${'COST'}  | ${'GRID'}        | ${'C1'} | ${[{ code: 'C1' }, { code: 'C2' }]} | ${false} | ${false}
        ${'costAccount'}  | ${'COST'}  | ${'GRID'}        | ${'C1'} | ${[{ code: 'C1' }, { code: 'C2' }]} | ${false} | ${false}
        ${'costAccount'}  | ${'COST'}  | ${'GRID'}        | ${'C1'} | ${[{ code: 'C2' }, { code: 'C3' }]} | ${true}  | ${true}
        ${'costAccount'}  | ${'COST'}  | ${'MASS-UPDATE'} | ${'C1'} | ${[]}                               | ${true}  | ${false}
    `(
        'should validate $field exists with $value code in $scope view',
        async ({ field, type, scope, value, apiValues, isDirty, hasError }) => {
            const companyExportFacade = new CompanyExportFacade(null, null, null);
            const describedGroup = {
                id: new FormControl(),
                code: new FormControl(),
                description: new FormControl(),
                version: new FormControl(),
            };
            const formGroup = new FormGroup({
                company: new FormControl({ code: 'COMP' }),
                costAccount: new FormGroup(describedGroup),
                salesAccount: new FormGroup(describedGroup),
            });
            jest.spyOn(companyExportFacade, 'findByCompanyAndType').mockImplementation(
                (companyCode: string, acntType: 'COST' | 'SALES'): Observable<Described[]> => {
                    return of(apiValues);
                }
            );
            const codeForm = new FormControl(value);
            if (isDirty) {
                codeForm.markAsDirty();
            }
            const errors = companyExportValidators.costSalesAccountValidator(
                formGroup.get(field),
                formGroup.get('company').value.code,
                type,
                scope,
                companyExportFacade
            )(codeForm) as Observable<ValidationErrors>;

            if (hasError) {
                expect(await errors.toPromise()).toBeTruthy();
            } else {
                expect(await errors.toPromise()).toBeFalsy();
            }

            if (scope === 'GRID' && isDirty) {
                expect(companyExportFacade.findByCompanyAndType).toHaveBeenCalledWith('COMP', type);
            } else {
                expect(companyExportFacade.findByCompanyAndType).not.toHaveBeenCalled();
            }
        }
    );

    it.each`
        costValue                                                   | salesValue                                                   | hasError
        ${null}                                                     | ${null}                                                      | ${false}
        ${{ id: 1, code: 'COST', description: 'Cost', version: 1 }} | ${null}                                                      | ${true}
        ${null}                                                     | ${{ id: 2, code: 'SALES', description: 'Cost', version: 1 }} | ${false}
        ${{ id: 1, code: 'COST', description: 'Cost', version: 1 }} | ${{ id: 2, code: 'SALES', description: 'Cost', version: 1 }} | ${false}
    `(
        'should update costAccount to $costValue and salesAccount to $salesValue and update validity',
        async ({ costValue, salesValue, hasError }) => {
            const costAccountForm = new FormControl();
            const salesAccountForm = new FormControl();
            const _destroy = new ReplaySubject();

            companyExportValidators.accountValueChangeValidation(costAccountForm, salesAccountForm, _destroy);

            costAccountForm.setValue(costValue);
            salesAccountForm.setValue(salesValue);

            if (hasError) {
                salesAccountForm.setValidators(Validators.required);
                salesAccountForm.updateValueAndValidity();
                expect(salesAccountForm.getError('required')).toEqual(hasError);
            } else {
                expect(salesAccountForm.getError('required')).toBeNull();
            }
        }
    );
});
