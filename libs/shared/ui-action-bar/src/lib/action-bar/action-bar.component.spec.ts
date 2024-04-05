import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { ActionBarComponent } from './action-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
describe('ActionBarComponent', () => {
    @Component({
        template: ` <vioc-angular-action-bar><button>save</button></vioc-angular-action-bar> `,
    })
    class MockActionBarComponent {}

    let component: ActionBarComponent;
    let fixture: ComponentFixture<ActionBarComponent>;
    let buttonFixture: ComponentFixture<MockActionBarComponent>;
    const routeParams = new Subject();
    const parentRoute: ActivatedRoute = new ActivatedRoute();
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiButtonModule],
            declarations: [ActionBarComponent, MockActionBarComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: { params: routeParams, parent: parentRoute },
                },
                { provide: Router, useValue: { navigate: jest.fn() } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ActionBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it.each`
        isCancelButtonDisplayed
        ${true}
        ${false}
    `('Cancel button flag $isCancelButtonDisplayed', ({ isCancelButtonDisplayed }) => {
        component.isCancelButtonDisplayed = isCancelButtonDisplayed;
        fixture.detectChanges();
        const buttonHtmlElement = fixture.debugElement.query(By.css('#cancel-action'));
        if (isCancelButtonDisplayed) {
            expect(buttonHtmlElement).not.toBeNull();
        } else {
            expect(buttonHtmlElement).toBeNull();
        }
    });

    it('should apply styling to buttons passed as content', () => {
        buttonFixture = TestBed.createComponent(MockActionBarComponent);
        buttonFixture.detectChanges();

        const buttonHtmlElement = buttonFixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

        expect(buttonHtmlElement).not.toBeNull();
    });
});
