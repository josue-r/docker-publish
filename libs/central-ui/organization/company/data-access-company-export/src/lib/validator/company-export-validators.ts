import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, of, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { CompanyExportFacade } from '../facade/company-export-facade';

@Injectable()
export class CompanyExportValidators {
    /**
     * Validates that the entered account exists for the company account configuration for `COST` or `SALES` accounts. If
     * the account exists, the cost/sales control will be updated with the existing account value.
     */
    costSalesAccountValidator(
        formField: AbstractControl,
        companyCode: string,
        type: 'COST' | 'SALES',
        scope: string,
        companyExportFacade: CompanyExportFacade
    ): AsyncValidatorFn {
        return (control: AbstractControl): Observable<{ [key: string]: boolean } | null> => {
            const accountCode = control.value;
            if (scope === 'GRID' && control.dirty) {
                return companyExportFacade.findByCompanyAndType(companyCode, type).pipe(
                    map((accounts) => {
                        const existingAccount = accounts.find((a) => a.code === accountCode);
                        if (!existingAccount && accountCode) {
                            return { invalidAccount: true };
                        } else if (existingAccount) {
                            formField.patchValue({
                                id: existingAccount.id,
                                description: existingAccount.description,
                                version: existingAccount.version,
                            });
                        } else {
                            formField.patchValue({ id: null, description: null, version: null });
                        }
                    })
                );
            }
            return of(null);
        };
    }

    /**
     * Adds value change subscriptions to the cost/sales account forms to validate if the other is
     * set correctly.
     */
    accountValueChangeValidation(
        costAccount: AbstractControl,
        salesAccount: AbstractControl,
        componentDestroyed: ReplaySubject<any>
    ): void {
        costAccount.valueChanges
            .pipe(
                // distinct to prevent infinite loops and for performance
                distinctUntilChanged(),
                takeUntil(componentDestroyed)
            )
            .subscribe(() => {
                salesAccount.markAsTouched();
                salesAccount.updateValueAndValidity();
            });
        salesAccount.valueChanges
            .pipe(
                // distinct to prevent infinite loops and for performance
                distinctUntilChanged(),
                takeUntil(componentDestroyed)
            )
            .subscribe(() => {
                costAccount.markAsTouched();
                costAccount.updateValueAndValidity();
            });
    }
}
