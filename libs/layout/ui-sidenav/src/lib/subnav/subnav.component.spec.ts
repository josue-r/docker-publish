import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { DebugElement } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MenuItem, menuItem1, rootMenuItem1, rootMenuItem2 } from '@vioc-angular/central-ui/data-access-menu';
import { FilterSearchableOnlyPipe } from '../pipes/filter-searchable-only.pipe';
import { HasChildrenPipe } from '../pipes/has-children.pipe';
import { SubnavComponent } from './subnav.component';

describe('SubnavComponent', () => {
    let component: SubnavComponent;
    let fixture: ComponentFixture<SubnavComponent>;
    let overlayContainerElement: HTMLElement; // Providing access to overlay menus

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatListModule, MatMenuModule, MatIconModule, OverlayModule, NoopAnimationsModule],
            declarations: [SubnavComponent, HasChildrenPipe, FilterSearchableOnlyPipe],
        }).compileComponents();
    });

    beforeEach(() => {
        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainerElement = oc.getContainerElement();
        })();
        fixture = TestBed.createComponent(SubnavComponent);
        component = fixture.componentInstance;
    });

    /** This is meant to be the first time detectChanges gets called. Useful for initializing component manually while using onPush. */
    const initializeComponent = (options: { menuItem: MenuItem; currentPage?: boolean; active?: boolean }) => {
        Object.keys(options).forEach((key) => (component[key] = options[key]));
        fixture.detectChanges();
    };

    const getByCss = (css: string) => fixture.debugElement.query(By.css(css));

    const triggerEvent = (element: DebugElement, event: string, eventObject = {}) => {
        element.triggerEventHandler(event, eventObject);
        fixture.detectChanges();
    };

    const verifyElementContent = (elementCss: string, expectedContent: string) =>
        expect(getByCss(elementCss).nativeElement.innerHTML).toContain(expectedContent);

    const openMenu = () => {
        const menuTrigger = fixture.debugElement.query(By.directive(MatMenuTrigger)).injector.get(MatMenuTrigger);
        menuTrigger.openMenu();
        fixture.detectChanges();
    };

    const verifyChildNavigation = (expectedPath: string) => {
        openMenu();
        const spy = jest.spyOn(component.navigate, 'emit');
        const childNav = overlayContainerElement.querySelector('.mat-mdc-menu-item:not(.mat-mdc-menu-trigger)');
        (childNav as HTMLElement).click();
        fixture.detectChanges();
        expect(spy).toHaveBeenCalledWith(expectedPath);
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('with a root menu', () => {
        describe('that has children', () => {
            const getMenuParent = () => getByCss('.sub-nav-toggler');

            it("should add 'active' styling when child subNav menu is opened", () => {
                initializeComponent({ menuItem: rootMenuItem1 });
                expect(getMenuParent().classes['active']).toBeFalsy();
                triggerEvent(getMenuParent(), 'menuOpened');
                expect(getMenuParent().classes['active']).toBeTruthy();
            });

            it("should remove 'active' styling when child subNav menu is closed", () => {
                initializeComponent({ menuItem: rootMenuItem1, active: true });
                triggerEvent(getMenuParent(), 'menuClosed');
                expect(getMenuParent().classes['active']).toBeFalsy();
            });

            it("should have 'current-page' styling applied if the active menu is a child", () => {
                initializeComponent({ menuItem: rootMenuItem1, currentPage: true });
                expect(getByCss('.current-page')).toBeTruthy();
            });

            it("should not have 'current-page' styling applied if the active menu is not a child", () => {
                initializeComponent({ menuItem: rootMenuItem1, currentPage: false });
                expect(getByCss('.current-page')).toBeFalsy();
            });

            it('should use the given menu icon and name', () => {
                initializeComponent({ menuItem: rootMenuItem1 });
                verifyElementContent('.sub-nav-toggler mat-icon', rootMenuItem1.icon);
                verifyElementContent('.sub-nav-toggler .nav-title', rootMenuItem1.name);
            });

            it('should display a menu item for each direct child', () => {
                initializeComponent({ menuItem: rootMenuItem1 });
                openMenu();
                // rootMenuItem1 should have menuItem1 and menuItem2 displayed
                expect(overlayContainerElement.querySelectorAll('.mat-mdc-menu-item').length).toEqual(2);
            });

            it('should emit an event containing the path of a child menu item that has been clicked', () => {
                initializeComponent({ menuItem: rootMenuItem1 });
                verifyChildNavigation(menuItem1.path);
            });
        });

        describe('that is a leaf', () => {
            it("should have 'current-page' styling applied if the active menu is a child", () => {
                initializeComponent({ menuItem: rootMenuItem2, currentPage: true });
                expect(getByCss('.current-page')).toBeTruthy();
            });

            it('should use the given menu icon and name', () => {
                initializeComponent({ menuItem: rootMenuItem2 });
                verifyElementContent('.sub-nav-toggler mat-icon', rootMenuItem2.icon);
                verifyElementContent('.sub-nav-toggler .nav-title', rootMenuItem2.name);
            });

            it('should emit an event containing its path when clicked', () => {
                const spy = jest.spyOn(component.navigate, 'emit');
                initializeComponent({ menuItem: rootMenuItem2 });
                triggerEvent(getByCss('.sub-nav-toggler'), 'click');
                expect(spy).toHaveBeenCalledWith(rootMenuItem2.path);
            });
        });
    });
});
