import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { FeatureSearchMockModule } from '@vioc-angular/shared/feature-search';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { EMPTY } from 'rxjs';
import { StoreSelectionComponent } from './store-selection.component';

describe('StoreSelectionComponent', () => {
    let component: StoreSelectionComponent;
    let fixture: ComponentFixture<StoreSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSearchMockModule],
            declarations: [StoreSelectionComponent],
            providers: [
                { provide: HttpClient, useValue: { get: () => EMPTY } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StoreSelectionComponent);
        component = fixture.componentInstance;
        component.control = new FormControl([]);
        component.searchFn = jest.fn();
    });

    describe('initialized properly', () => {
        beforeEach(() => {
            component.accessRoles = ['test_role'];
            fixture.detectChanges();
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should pass down the store columns', () => {
            expect(component.columns).toEqual(component.searchComponent.columns);
        });

        it('should pass down the default sort', () => {
            expect(component.sort).toEqual(component.searchComponent.sort);
        });

        it('should be a selectable search', () => {
            expect(component.searchComponent.selectable).toBeTruthy();
        });

        it('should not have previous search logic enabled', () => {
            expect(component.searchComponent.previousSearchEnabled).toBeFalsy();
        });
    });

    it('should require the accessRoles input', () => {
        expect(() => fixture.detectChanges()).toThrowError('Attribute "accessRoles" is required.');
    });
});
