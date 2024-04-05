import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { LoadingComponent } from './loading.component';
import { LoadingDirective } from './loading.directive';

describe('LoadingDirective', () => {
    @Component({
        template: ` <div id="loadingDiv" *viocAngularLoading="dataLoaded; class: 'testClass'"></div> `,
    })
    class LoadableComponent {
        dataLoaded: boolean;
    }

    let fixture: ComponentFixture<LoadableComponent>;
    let component: LoadableComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatProgressSpinnerModule],
            declarations: [LoadingDirective, LoadableComponent, LoadingComponent],
        })
            .overrideModule(BrowserDynamicTestingModule, {
                set: {
                    // LoadingComponent needs to be an entryComponent and default configureTestingModule doesn't support that
                    bootstrap: [LoadingComponent],
                },
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoadableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the loading component if data is not loaded', () => {
        expect(fixture.debugElement.query(By.css('.loading'))).not.toBeNull();
    });

    it('should not display the loading component if data is loaded', () => {
        component.dataLoaded = true;
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.loading'))).toBeNull();
        expect(fixture.debugElement.query(By.css('#loadingDiv'))).not.toBeNull();
    });

    it('should have a configurable additional class for the loading div', () => {
        expect(fixture.debugElement.query(By.css('.testClass'))).not.toBeNull();
    });
});
