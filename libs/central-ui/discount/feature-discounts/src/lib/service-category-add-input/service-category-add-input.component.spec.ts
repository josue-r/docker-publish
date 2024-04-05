import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    FeatureSharedServiceCategorySelectionMockModule,
    ServiceCategorySelectionComponent,
} from '@vioc-angular/central-ui/service/feature-shared-service-category-selection';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { DialogComponent, UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { EMPTY, of } from 'rxjs';
import { ServiceCategoryAddInputComponent } from './service-category-add-input.component';

describe('ServiceCategoryAddInputComponent', () => {
    let component: ServiceCategoryAddInputComponent;
    let fixture: ComponentFixture<ServiceCategoryAddInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ServiceCategoryAddInputComponent],
            imports: [
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                NoopAnimationsModule,
                ReactiveFormsModule,
                UiDialogMockModule,
                FeatureSharedServiceCategorySelectionMockModule,
            ],
            providers: [{ provide: RoleFacade, useValue: { hasAnyRole: jest.fn(() => of()) } }],
        }).compileComponents();

        fixture = TestBed.createComponent(ServiceCategoryAddInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.searchFn = jest.fn();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('service search dialog', () => {
        let dialog: DebugElement;
        let dialogComponent: DialogComponent;
        const addServicesButton = () => {
            return dialog.query(By.css('#add-services-button')).nativeElement;
        };
        beforeEach(() => {
            component.searchDialog.dialogRef = {
                afterClosed: () => {
                    return EMPTY;
                },
            } as any as MatDialogRef<any>;
            jest.spyOn(component.searchDialog.dialogRef, 'afterClosed').mockReturnValue(EMPTY);

            dialog = fixture.debugElement.query(By.css('#search-add-service'));
            dialogComponent = dialog.componentInstance;
        });

        it('should have content passed to the product search dialog', () => {
            expect(dialogComponent.content).not.toBeNull();
            expect(dialog.query(By.css('#service-selection'))).not.toBeNull();
        });

        it('should have actions passed to the product search dialog', () => {
            expect(dialogComponent.actions).not.toBeNull();
            expect(dialog.query(By.css('#cancel-search-button'))).not.toBeNull();
            expect(dialog.query(By.css('#add-services-button'))).not.toBeNull();
        });

        describe('service selection', () => {
            const services = [
                { id: 1, code: 'P1' },
                { id: 2, code: 'P2' },
            ];
            const expectedServices = [
                { id: 1, code: 'P1' },
                { id: 2, code: 'P2' },
            ];
            let serviceSelection: DebugElement;
            let serviceCategorySelectionComponent: ServiceCategorySelectionComponent;

            beforeEach(() => {
                serviceSelection = dialog.query(By.css('#service-selection'));
                serviceCategorySelectionComponent = serviceSelection.componentInstance;
            });

            it('should have the searchFn passed', () => {
                expect(serviceCategorySelectionComponent.searchFn).toEqual(component.searchFn);
            });

            it('should display errors for products that already exist', () => {
                jest.spyOn(component.categories, 'emit');
                serviceCategorySelectionComponent.control.setValue(services);
                // product that already exists
                component.existingServiceCategoryCodes = ['P1'];
                // update the selected values so the add button is enabled
                fixture.detectChanges();

                addServicesButton().click();
                fixture.detectChanges();

                const error = fixture.debugElement.query(By.css('#service-error'));

                expect(component.categories.emit).toHaveBeenCalledWith([{ id: 2, code: 'P2' }]);
                expect(error.nativeElement.textContent).toEqual('Category code(s) P1 already added');
            });

            describe('action buttons', () => {
                it('should trigger the addServices', () => {
                    jest.spyOn(component, 'addServiceCategories');
                    serviceCategorySelectionComponent.control.setValue(services);
                    // update the selected values so the add button is enabled
                    fixture.detectChanges();

                    addServicesButton().click();
                    fixture.detectChanges();

                    expect(component.addServiceCategories).toHaveBeenCalled();
                });

                it('should update the selected service values when they are selected', () => {
                    jest.spyOn(component.categories, 'emit');
                    serviceCategorySelectionComponent.control.setValue(services);
                    // update the selected values so the add button is enabled
                    fixture.detectChanges();

                    addServicesButton().click();
                    fixture.detectChanges();

                    expect(component.categories.emit).toHaveBeenCalledWith(expectedServices);
                });

                it('should close the dialog after clicking the add button', () => {
                    jest.spyOn(component, 'closeSearchDialog');
                    serviceCategorySelectionComponent.control.setValue(services);
                    // update the selected values so the add button is enabled
                    fixture.detectChanges();

                    addServicesButton().click();
                    fixture.detectChanges();

                    expect(component.closeSearchDialog).toHaveBeenCalled();
                });

                it('should disable the add button if no products are selected', () => {
                    expect(addServicesButton().disabled).toEqual(true);
                });

                it('should close the search dialog after clicking cancel', () => {
                    jest.spyOn(component, 'closeSearchDialog');

                    dialog.query(By.css('#cancel-search-button')).nativeElement.click();
                    fixture.detectChanges();

                    expect(component.closeSearchDialog).toHaveBeenCalled();
                });
            });
        });

        describe('service search button', () => {
            const searchDialogButton = () => {
                return fixture.debugElement.query(By.css('#service-search')).nativeElement;
            };

            it('should open the service search dialog', () => {
                jest.spyOn(component, 'openSearchDialog');
                jest.spyOn(component.searchDialog, 'open');

                searchDialogButton().click();
                fixture.detectChanges();

                expect(component.openSearchDialog).toHaveBeenCalled();
                expect(component.searchDialog.open).toHaveBeenCalled();
            });

            it('should be disabled if addDisabled is true', () => {
                component.addDisabled = true;
                fixture.detectChanges();

                expect(searchDialogButton().disabled).toEqual(true);
            });
        });
    });
});
