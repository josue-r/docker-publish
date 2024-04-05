import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
    @Component({
        template: `
            <vioc-angular-dialog [name]="'Test Dialog'" [content]="content" [actions]="actions" #testDialog>
                <ng-template #content>
                    <div class="test">This is test content</div>
                </ng-template>
                <ng-template #actions>
                    <button>Confirm</button>
                </ng-template>
            </vioc-angular-dialog>
        `,
    })
    class MockDialogComponent {
        @ViewChild('testDialog', { static: true }) testDialog: DialogComponent;
    }

    let component: DialogComponent;
    let fixture: ComponentFixture<DialogComponent>;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let dialogService: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, NoopAnimationsModule],
            declarations: [DialogComponent, MockDialogComponent],
            providers: [MatDialog],
        })
            .overrideModule(BrowserDynamicTestingModule, {
                set: { bootstrap: [MockDialogComponent] },
            })
            .compileComponents();
    });

    beforeEach(() => {
        inject([OverlayContainer], (overlayContainerInjector: OverlayContainer) => {
            overlayContainer = overlayContainerInjector;
            overlayContainerElement = overlayContainerInjector.getContainerElement();
        })();
        fixture = TestBed.createComponent(DialogComponent);
        component = fixture.componentInstance;
        component.name = 'Test Dialog';

        dialogService = TestBed.inject(MatDialog);
    });

    afterEach(() => {
        dialogService.closeAll();
        fixture.detectChanges();
        overlayContainer.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open a dialog', () => {
        component.open();
        expect(dialogService.openDialogs).toContain(component.dialogRef);
    });

    it('should close the dialog', fakeAsync(() => {
        component.open();
        expect(dialogService.openDialogs).toContain(component.dialogRef);

        component.close();
        fixture.detectChanges();
        flush();
        expect(dialogService.openDialogs).not.toContain(component.dialogRef);
    }));

    it('should close by clicking outside the dialog', fakeAsync(() => {
        component.open();
        expect(dialogService.openDialogs).toContain(component.dialogRef);

        const backdrop: HTMLElement = overlayContainerElement.querySelector('.cdk-overlay-backdrop');
        backdrop.click();
        fixture.detectChanges();
        flush();
        expect(dialogService.openDialogs).not.toContain(component.dialogRef);
    }));

    describe('dialog content', () => {
        let dialog: MatDialog;
        let mockDialogFixture: ComponentFixture<MockDialogComponent>;
        let mockDialogComponent: MockDialogComponent;

        beforeEach(inject([MatDialog], (dialogInjector: MatDialog) => {
            dialog = dialogInjector;
            mockDialogFixture = TestBed.createComponent(MockDialogComponent);
            mockDialogComponent = mockDialogFixture.componentInstance;
            mockDialogComponent.testDialog.dialogRef = dialog.open(MockDialogComponent);
            mockDialogComponent.testDialog.open();
            mockDialogFixture.detectChanges();
        }));

        it('should allow a name to be provided to the dialog', () => {
            expect(overlayContainerElement.querySelector('h3').innerHTML).toEqual('Test Dialog');
        });

        it('should allow content to be passed to the dialog', () => {
            expect(overlayContainerElement.querySelector('.test').innerHTML).toEqual('This is test content');
        });

        it('should allow actions to be passed to the dialog', () => {
            expect(overlayContainerElement.querySelector('button').innerHTML).toEqual('Confirm');
        });
    });
});
