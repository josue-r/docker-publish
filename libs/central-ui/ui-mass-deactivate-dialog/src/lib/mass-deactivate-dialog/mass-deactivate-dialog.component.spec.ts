import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, fakeAsync, flush, inject, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AssignmentCount } from '@vioc-angular/shared/common-api-models';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { Subject } from 'rxjs';
import { MassDeactivateDialogComponent } from './mass-deactivate-dialog.component';

describe('MassDeactivateDialogComponent', () => {
    let component: MassDeactivateDialogComponent;
    let fixture: ComponentFixture<MassDeactivateDialogComponent>;

    const resources: AssignmentCount[] = [
        { id: 1, description: 'SERVICECODE1', companyResourceCount: 1, storeResourceCount: 1 },
        { id: 2, description: 'SERVICECODE2', companyResourceCount: 0, storeResourceCount: 1 },
        { id: 3, description: 'SERVICECODE3', companyResourceCount: 1, storeResourceCount: 0 },
        { id: 4, description: 'SERVICECODE4', companyResourceCount: 0, storeResourceCount: 0 },
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatButtonModule,
                MatCheckboxModule,
                NoopAnimationsModule,
                MatDialogModule,
                MatTableModule,
                UiDialogMockModule,
                UiLoadingMockModule,
            ],
            declarations: [MassDeactivateDialogComponent],
        })
            .overrideModule(BrowserDynamicTestingModule, {
                // MassDeactivateDialogComponent needs to be an entry component to define dialogRef
                set: { bootstrap: [MassDeactivateDialogComponent] },
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MassDeactivateDialogComponent);
        component = fixture.componentInstance;
        component.resources = resources;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('openDialog', () => {
        let dialog: MatDialog;
        let overlayContainer: OverlayContainer;
        let resourcesSubject: Subject<AssignmentCount[]>;

        beforeEach(inject(
            [MatDialog, OverlayContainer],
            (dialogInjector: MatDialog, overlayContainerInjector: OverlayContainer) => {
                dialog = dialogInjector;
                overlayContainer = overlayContainerInjector;
                component.deactivateDialog.dialogRef = dialog.open(MassDeactivateDialogComponent);
                resourcesSubject = new Subject<AssignmentCount[]>();
            }
        ));

        afterEach(() => {
            overlayContainer.ngOnDestroy();
        });

        it('should open the deactivate dialog on openDialog', fakeAsync(() => {
            jest.spyOn(component.deactivateDialog, 'open').mockImplementation();
            jest.spyOn(component, 'configureSupportedColumns');

            component.openDialog(resourcesSubject);
            fixture.detectChanges();

            resourcesSubject.next(resources);
            flush();
            fixture.detectChanges();

            expect(component.resources).toEqual(resources);
            expect(component.deactivateDialog.open).toHaveBeenCalled();
            expect(component.configureSupportedColumns).toHaveBeenCalled();
        }));

        it('should display a spinner when loading data', fakeAsync(() => {
            component.openDialog(resourcesSubject);
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('.deactivation-content'))).toBeFalsy();

            resourcesSubject.next(resources);
            flush();
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.deactivation-content'))).toBeTruthy();
        }));

        it('should close the deactivation dialog', fakeAsync(() => {
            jest.spyOn(component.deactivateDialog, 'close');

            component.openDialog(resourcesSubject);
            fixture.detectChanges();

            resourcesSubject.next(resources);
            flush();
            fixture.detectChanges();

            expect(component.resources).toEqual(resources);
            expect(component.displayedColumns).toEqual(['select', 'code', 'companies', 'stores', 'implication']);

            component.cancel();
            expect(component.deactivateDialog.close).toHaveBeenCalled();
            expect(component.resources).toEqual([]);
            expect(component.displayedColumns).toEqual([]);
        }));
    });

    it('should configure the displayed columns for all resources', () => {
        // All columns should be displayed
        component.configureSupportedColumns();
        expect(component.displayedColumns).toEqual(['select', 'code', 'companies', 'stores', 'implication']);
    });

    it('should configure the displayed columns for all resources except store', () => {
        component.resources = resources.map((result) => {
            return {
                ...result,
                storeResourceCount: undefined,
            };
        });
        // Store resources should not be displayed
        component.configureSupportedColumns();
        expect(component.displayedColumns).toEqual(['select', 'code', 'companies', 'implication']);
    });

    it('should configure the displayed columns for all resources except company', () => {
        component.resources = resources.map((result) => {
            return {
                ...result,
                companyResourceCount: undefined,
            };
        });
        // Company resources should not be displayed
        component.configureSupportedColumns();
        expect(component.displayedColumns).toEqual(['select', 'code', 'stores', 'implication']);
    });

    it('should not configure any displayed columns for resources', () => {
        component.resources = resources.map((result) => {
            return {
                ...result,
                companyResourceCount: undefined,
                storeResourceCount: undefined,
            };
        });
        // None of the columns should be displayed
        component.configureSupportedColumns();
        expect(component.displayedColumns).toEqual([]);
    });

    it('should toggle the selected values in the table', () => {
        expect(component.selection.selected).toEqual([]);

        // All options should be selected
        component.masterToggle();
        expect(component.selection.selected).toEqual(resources);

        // All options should be unselected
        component.masterToggle();
        expect(component.selection.selected).toEqual([]);
    });

    it('should trigger the deactivation event', () => {
        jest.spyOn(component.deactivate, 'emit');
        jest.spyOn(component.deactivateDialog, 'close');

        component.selection.select(resources[0]);
        component.deactivateSelected();

        expect(component.deactivate.emit).toHaveBeenCalledWith([resources[0]]);
        expect(component.deactivateDialog.close).toHaveBeenCalled();
    });

    it.each`
        storeResourceCount | companyResourceCount | implication
        ${10}              | ${10}                | ${'Deactivating would also deactivate the corresponding 10 company and 10 store records'}
        ${0}               | ${10}                | ${'Deactivating would also deactivate the corresponding 10 company records'}
        ${10}              | ${0}                 | ${'Deactivating would also deactivate the corresponding 10 store records'}
        ${0}               | ${0}                 | ${'Deactivating would affect no other records'}
    `(
        `should display "$implication" when storeResourceCount=$storeResourceCount and companyResourceCount=$companyResourceCount`,
        ({ storeResourceCount, companyResourceCount, implication }) => {
            const assignMentCount = { storeResourceCount, companyResourceCount } as AssignmentCount;
            expect(component.implication(assignMentCount)).toEqual(implication);
        }
    );

    describe('reset', () => {
        it('should reset the displayColumns', () => {
            component.displayedColumns = ['Code'];
            component.reset();
            expect(component.displayedColumns).toEqual([]);
        });

        it('should reset the resources', () => {
            const assignMentCount = { storeResourceCount: 10, companyResourceCount: 10 } as AssignmentCount;
            component.resources = [assignMentCount];
            component.reset();
            expect(component.resources).toEqual([]);
        });

        it('should clear the selection', () => {
            jest.spyOn(component.selection, 'clear');
            const assignMentCount = { storeResourceCount: 10, companyResourceCount: 10 } as AssignmentCount;
            component.selection.select(assignMentCount);
            component.reset();
            expect(component.selection.clear).toHaveBeenCalled();
        });
    });
});
