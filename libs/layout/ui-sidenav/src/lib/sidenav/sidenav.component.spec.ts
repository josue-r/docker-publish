import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatListModule } from '@angular/material/list';
import { By } from '@angular/platform-browser';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import {
    MenuItem,
    menuItem1,
    mockMenus,
    rootMenuItem1,
    rootMenuItem2,
} from '@vioc-angular/central-ui/data-access-menu';
import { FilterSearchableOnlyPipe } from '../pipes/filter-searchable-only.pipe';
import { SidenavComponent } from './sidenav.component';

describe('SidenavComponent', () => {
    let component: SidenavComponent;
    let fixture: ComponentFixture<SidenavComponent>;

    @Component({
        selector: 'vioc-angular-nav-search',
        template: '',
    })
    class MockNavSearchComponent {
        @Input() menu: MenuItem[];
        @Output() searchResultSelected = new EventEmitter<string>();
    }
    @Component({
        selector: 'vioc-angular-subnav',
        template: '',
    })
    class MockSubNavComponent {
        @Input() menuItem: MenuItem;
        @Input() currentPage = false;
        @Output() navigate = new EventEmitter<string>();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatListModule],
            declarations: [SidenavComponent, MockNavSearchComponent, MockSubNavComponent, FilterSearchableOnlyPipe],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidenavComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should use the provided source for the home logo', () => {
        const testSrc = 'http://localhost/img/logo.png';
        component.homeLogo = testSrc;
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#vui-go-home-link img')).nativeElement.src).toEqual(testSrc);
        expect(fixture.debugElement.query(By.css('#vui-go-home-link img')).nativeElement.alt).toEqual('Logo');
    });

    describe('isCurrentPage', () => {
        it('should be false if no activeMenu', () => {
            component.activeMenu = undefined;
            expect(component.isCurrentPage(menuItem1)).toBeFalsy();
        });

        it('should be false if current item does not match activeMenu', () => {
            component.activeMenu = { rootMenu: rootMenuItem2, subMenu: rootMenuItem2 };
            expect(component.isCurrentPage(rootMenuItem1)).toBeFalsy();
        });

        it('should be true if current item matches activeMenu', () => {
            component.activeMenu = { rootMenu: rootMenuItem1, subMenu: menuItem1 };
            expect(component.isCurrentPage(rootMenuItem1)).toBeTruthy();
        });
    });

    describe('navigate', () => {
        const verifyNavigate = (childComponent: any, event: string) => {
            const testNavigatePath = 'root1/test1';
            const spy = jest.spyOn(component.navigate, 'emit');
            fixture.debugElement.query(By.directive(childComponent)).triggerEventHandler(event, testNavigatePath);
            expect(spy).toHaveBeenCalledWith(testNavigatePath);
        };

        beforeEach(() => {
            component.menu = mockMenus;
            fixture.detectChanges();
        });

        it('should emit when the nav-search component has a search result selected', () => {
            verifyNavigate(MockNavSearchComponent, 'searchResultSelected');
        });

        it('should emit when the subnav component has a menu item clicked', () => {
            verifyNavigate(MockSubNavComponent, 'navigate');
        });
    });

    describe('goHome', () => {
        beforeEach(() => fixture.detectChanges());

        it('should emit when the menu logo is clicked', () => {
            const spy = jest.spyOn(component.goHome, 'emit');
            fixture.debugElement.query(By.css('#vui-go-home-link')).triggerEventHandler('click', {});
            expect(spy).toHaveBeenCalled();
        });
    });
});
