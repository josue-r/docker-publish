import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { SelectAndGoComponent } from './select-and-go.component';

describe('SelectAndGoComponent', () => {
    @Component({
        // tslint:disable-next-line: component-selector
        selector: `valid-host-component`,
        template: `
            <vioc-angular-select-and-go>
                <vioc-angular-filtered-input></vioc-angular-filtered-input>
            </vioc-angular-select-and-go>
        `,
    })
    /** A wrapper component to enable easy content testing of the SelectAndGoComponent */
    class TestValidHostComponent {}

    @Component({
        // tslint:disable-next-line: component-selector
        selector: `invalid-host-component`,
        template: `
            <vioc-angular-select-and-go>
                <vioc-angular-filtered-input></vioc-angular-filtered-input>
                <div>This shouldn't be here</div>
            </vioc-angular-select-and-go>
        `,
    })
    /** A wrapper component to enable easy content testing of the SelectAndGoComponent */
    class TestInvalidHostComponent {}

    @Component({
        // tslint:disable-next-line: component-selector
        selector: `invalid-host-component`,
        template: ` <vioc-angular-select-and-go> </vioc-angular-select-and-go> `,
    })
    /** A wrapper component to enable easy content testing of the SelectAndGoComponent */
    class TestEmptyHostComponent {}

    let fixture: ComponentFixture<TestValidHostComponent>;
    let loader: HarnessLoader;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, UiFilteredInputMockModule, MatIconModule, MatButtonModule],
            declarations: [
                SelectAndGoComponent,
                TestValidHostComponent,
                TestInvalidHostComponent,
                TestEmptyHostComponent,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestValidHostComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should verify the content being passed in to be vioc-angular-filtered-inputs', () => {
            const invalidFixture = TestBed.createComponent(TestInvalidHostComponent);
            expect(() => invalidFixture.detectChanges()).toThrowError(
                'Expected only VIOC-ANGULAR-FILTERED-INPUT but received a DIV'
            );
        });

        it('should verify that at least one dropdown is passed', () => {
            const emptyFixture = TestBed.createComponent(TestEmptyHostComponent);
            expect(() => emptyFixture.detectChanges()).toThrowError(
                'Expected at least one VIOC-ANGULAR-FILTERED-INPUT'
            );
        });
    });

    describe('emitters', () => {
        describe('go', () => {
            it('should emit whenever the go button is clicked', async () => {
                const component = fixture.debugElement
                    .query(By.directive(SelectAndGoComponent))
                    .injector.get(SelectAndGoComponent);
                const spy = jest.spyOn(component.go, 'emit');
                const goButton = await loader.getHarness(MatButtonHarness.with({ selector: '#go-button' }));
                await goButton.click();
                expect(spy).toHaveBeenCalled();
            });
        });
    });
});
