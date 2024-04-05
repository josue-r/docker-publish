import { OverlayContainer } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
    let component: PaginatorComponent;
    let fixture: ComponentFixture<PaginatorComponent>;
    let overlayContainerElement: HTMLElement;

    const getNextButton = () => fixture.debugElement.query(By.css('.mat-mdc-paginator-navigation-next'));
    const getPreviousButton = () => fixture.debugElement.query(By.css('.mat-mdc-paginator-navigation-previous'));
    const getFirstButton = () => fixture.debugElement.query(By.css('.mat-mdc-paginator-navigation-first'));
    const getLastButton = () => fixture.debugElement.query(By.css('.mat-mdc-paginator-navigation-last'));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatPaginatorModule, NoopAnimationsModule, PortalModule],
            declarations: [PaginatorComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        inject([OverlayContainer], (overlayContainerInjector: OverlayContainer) => {
            overlayContainerElement = overlayContainerInjector.getContainerElement();
        })();
        fixture = TestBed.createComponent(PaginatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe.each`
        field            | expectedValue
        ${'index'}       | ${0}
        ${'size'}        | ${20}
        ${'length'}      | ${0}
        ${'sizeOptions'} | ${[10, 20, 50]}
    `('inputs', ({ field, expectedValue }) => {
        it(`should default ${field} to ${expectedValue}`, () => {
            expect(component[field]).toEqual(expectedValue);
        });
    });

    describe('outputs', () => {
        beforeEach(() => jest.spyOn(component.pageChange, 'emit'));

        describe.each`
            buttonSupplier       | buttonName    | length | index | expectedEvent
            ${getNextButton}     | ${'next'}     | ${100} | ${2}  | ${{ length: 100, pageIndex: 3, pageSize: 20, previousPageIndex: 2 }}
            ${getNextButton}     | ${'next'}     | ${100} | ${4}  | ${undefined}
            ${getNextButton}     | ${'next'}     | ${0}   | ${0}  | ${undefined}
            ${getPreviousButton} | ${'previous'} | ${100} | ${2}  | ${{ length: 100, pageIndex: 1, pageSize: 20, previousPageIndex: 2 }}
            ${getPreviousButton} | ${'previous'} | ${100} | ${0}  | ${undefined}
            ${getPreviousButton} | ${'previous'} | ${0}   | ${0}  | ${undefined}
            ${getFirstButton}    | ${'first'}    | ${100} | ${2}  | ${{ length: 100, pageIndex: 0, pageSize: 20, previousPageIndex: 2 }}
            ${getFirstButton}    | ${'first'}    | ${100} | ${0}  | ${undefined}
            ${getFirstButton}    | ${'first'}    | ${0}   | ${0}  | ${undefined}
            ${getLastButton}     | ${'last'}     | ${100} | ${0}  | ${{ length: 100, pageIndex: 4, pageSize: 20, previousPageIndex: 0 }}
            ${getLastButton}     | ${'last'}     | ${100} | ${2}  | ${{ length: 100, pageIndex: 4, pageSize: 20, previousPageIndex: 2 }}
            ${getLastButton}     | ${'last'}     | ${0}   | ${0}  | ${undefined}
            ${getLastButton}     | ${'last'}     | ${100} | ${4}  | ${undefined}
        `('page navigation', ({ buttonSupplier, buttonName, length, index, expectedEvent }) => {
            it(`should emit ${JSON.stringify(
                expectedEvent
            )} if length=${length}, index=${index} and pageSize=20 on ${buttonName} button click`, () => {
                component.length = length;
                component.index = index;
                component.size = 20;
                fixture.detectChanges();
                buttonSupplier().triggerEventHandler('click', null);
                if (expectedEvent) {
                    expect(component.pageChange.emit).toHaveBeenCalledWith(expectedEvent);
                } else {
                    expect(component.pageChange.emit).not.toHaveBeenCalled(); // expecting no event if no event object
                }
            });
        });

        it('should change page size when clicking on different page size option', () => {
            fixture.debugElement.query(By.css('.mat-mdc-select-trigger')).triggerEventHandler('click', null);
            fixture.detectChanges();
            // Select third option "50" and check text (assuming default sizeOptions are 10,20,50)
            const option = overlayContainerElement.querySelectorAll('mat-option')[2] as HTMLElement;
            expect(option.querySelector('.mdc-list-item__primary-text').innerHTML.trim()).toEqual('50');
            // Click option and update page
            option.click();
            fixture.detectChanges();
            // Check that page size changed with click
            expect(component.pageChange.emit).toHaveBeenCalledWith({
                length: 0,
                pageIndex: 0,
                pageSize: 50,
                previousPageIndex: 0,
            });
        });
    });

    describe('refreshPageValues', () => {
        it('should update the paginator component with the current values', () => {
            const index = 4;
            const size = 40;
            jest.spyOn(component.changeDetectorRef, 'detectChanges');
            component.index = index;
            component.size = size;
            component.refreshPageValues();
            expect(component.paginator.pageIndex).toEqual(index);
            expect(component.paginator.pageSize).toEqual(size);
            expect(component.changeDetectorRef.detectChanges).toHaveBeenCalled();
        });
    });
});
