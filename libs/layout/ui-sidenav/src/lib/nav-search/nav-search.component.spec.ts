import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import {
    MenuItem,
    menuItem1,
    menuItem2,
    menuItem3,
    mockMenus,
    rootMenuItem1,
    rootMenuItem2,
    searchableOnlyMenuItem,
} from '@vioc-angular/central-ui/data-access-menu';
import { NavSearchComponent } from './nav-search.component';

describe('NavSearchComponent', () => {
    let component: NavSearchComponent;
    let fixture: ComponentFixture<NavSearchComponent>;
    let querySelectorSpy: jest.SpyInstance; // Providing ability to query items outside of component

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatOptionModule,
                MatIconModule,
                MatAutocompleteModule,
                MatTooltipModule,
                MatListModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
            ],
            declarations: [NavSearchComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NavSearchComponent);
        component = fixture.componentInstance;
        component.menu = mockMenus;
        querySelectorSpy = jest.spyOn(document, 'querySelector').mockReturnValue(document.createElement('div'));
    });

    /** This is meant to be the first time detectChanges gets called. Useful for initializing component manually while using onPush. */
    const initializeComponent = (options = { navSearchFocused: false }) => {
        Object.keys(options).forEach((key) => (component[key] = options[key]));
        fixture.detectChanges();
    };

    /** Convert a MenuItem to a NavSearchOption */
    const convertMenuItem = (menuItem: MenuItem) => ({ name: menuItem.name, path: menuItem.path, index: -1 });

    it('should create', () => {
        initializeComponent();
        expect(component).toBeTruthy();
    });

    describe('set menu', () => {
        it('should build options out of the given menu items', () => {
            component.menu = mockMenus;

            expect(component.options).toEqual(
                expect.arrayContaining(
                    [
                        menuItem1, // expect the 2nd level leaf
                        menuItem3, // expect the 3rd level leaf
                        rootMenuItem2, // expect the root without children
                        searchableOnlyMenuItem, // expect the searchable only menu
                    ].map((mi) => convertMenuItem(mi))
                )
            );

            // (These checks are implicitly done above as well)
            // don't expect the child menu that has children
            expect(component.options).not.toContainEqual(convertMenuItem(menuItem2));
            // don't expect the root with children
            expect(component.options).not.toContainEqual(convertMenuItem(rootMenuItem1));
        });

        it('should get called each time the menuItems change', () => {
            // Mocking implementation to prevent recursive calls and get an accurate call count
            const spy = jest.spyOn(component, 'buildSearchOptions').mockImplementation();
            component.menu = [];
            expect(spy).toHaveBeenCalledTimes(1);
            component.menu = mockMenus;
            expect(spy).toHaveBeenCalledTimes(2);
        });

        it("shouldn't completely replace if called twice", () => {
            const menus: MenuItem[] = [
                { name: 'Foo', path: '/foo' },
                { name: 'Bar', path: '/bar' },
            ];

            // verify menus are created as expected
            component.menu = menus;
            expect(component.options.map((o) => o.name)) //
                .toEqual(expect.arrayContaining(['Foo', 'Bar']));

            // set the menus again, it should replace them instead of appending them
            component.menu = menus;
            expect(component.options.map((o) => o.name)) //
                .toEqual(expect.arrayContaining(['Foo', 'Bar']));
        });
    });

    describe('filter', () => {
        beforeEach(() => initializeComponent({ navSearchFocused: true }));

        const verifyFilterResults = (searchString: string, expectedResults: Array<string>) => {
            component.searchControl.patchValue(searchString);
            component.searchControl.updateValueAndValidity();
            fixture.detectChanges();
            const autoComplete = fixture.debugElement
                .query(By.directive(MatAutocomplete))
                .injector.get(MatAutocomplete);
            expect(autoComplete.options.map((option) => option.value.name)).toEqual(expectedResults);
        };

        it('should give no results with input less than two characters', () => {
            verifyFilterResults('t', []);
        });

        it('should give no options with no input', () => {
            verifyFilterResults('', []);
        });

        it('should provide filtered results if given input', () => {
            verifyFilterResults('test', [menuItem1.name, menuItem3.name]);
        });

        it('should list results in alphabetical order', () => {
            const menus: MenuItem[] = [
                { name: 'testDelta', path: '/testdelta' },
                { name: 'testAlpha', path: '/testalpha' },
                { name: 'testEcho', path: '/testecho' },
                { name: 'testCharlie', path: '/testcharlie' },
                { name: 'testBravo', path: '/testbravo' },
            ];

            component.menu = menus;
            verifyFilterResults('test', ['testAlpha', 'testBravo', 'testCharlie', 'testDelta', 'testEcho']);
        });
    });

    describe('displayOption', () => {
        it('should return option name if the object exists', () => {
            expect(component.displayOption(convertMenuItem(menuItem3))).toEqual(menuItem3.name);
        });

        it('should return undefined if object does not exist', () => {
            expect(component.displayOption(null)).toBeUndefined();
        });
    });

    describe('optionSelected', () => {
        beforeEach(() => initializeComponent());

        it('should emit the path of the selected option', () => {
            const spy = jest.spyOn(component.searchResultSelected, 'emit');
            const eventObj = { option: { value: convertMenuItem(menuItem3) } };
            fixture.debugElement.query(By.directive(MatAutocomplete)).triggerEventHandler('optionSelected', eventObj);
            expect(spy).toHaveBeenCalledWith(menuItem3.path);
            expect(querySelectorSpy).toHaveBeenCalledWith('.app-sidenav');
        });
    });

    describe('hasChildren', () => {
        it('should return the number of submenus if menu item has at least one sub menu', () => {
            const result = component.hasChildren(rootMenuItem1);
            expect(result).toBe(2);
        });

        it('should return false if menu item has no sub menu', () => {
            const result = component.hasChildren(rootMenuItem2);
            expect(result).toBe(false);
        });
    });

    describe('navSearchFocus', () => {
        const verifyNavSearchFocus = (isFocused: boolean) => {
            component.navSearchFocus(isFocused);
            expect(component.navSearchFocused).toBe(isFocused);
            const lastQuerySelectorResult = querySelectorSpy.mock.results.pop().value as Element;
            expect(lastQuerySelectorResult.classList.contains('overflowed')).toBe(isFocused);
        };

        it('should apply class if true', () => {
            verifyNavSearchFocus(true);
        });

        it('should remove class if false', () => {
            verifyNavSearchFocus(false);
        });
    });

    describe('afterIfWork', () => {
        it('should focus and select all existing text', () => {
            initializeComponent({ navSearchFocused: true });
            const testValue = 'test';
            const input = ({ focus: jest.fn(), select: jest.fn() } as unknown) as HTMLInputElement;
            input.value = testValue;
            component.afterIfWork(input);
            expect(input.focus).toHaveBeenCalled();
            expect(input.select).toHaveBeenCalled();
        });
    });
});
