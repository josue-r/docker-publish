import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InfoButtonComponent } from './info-button.component';

describe('InfoButtonComponent', () => {
    let component: InfoButtonComponent;
    let fixture: ComponentFixture<InfoButtonComponent>;
    let overlayContainer: OverlayContainer;
    const tooltipMessage = 'Test message.';

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfoButtonComponent],
            imports: [MatTooltipModule, OverlayModule, NoopAnimationsModule],
        }).compileComponents();
        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
        })();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfoButtonComponent);
        component = fixture.componentInstance;
        component.info = tooltipMessage;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display a tooltip on click', fakeAsync(() => {
        fixture.debugElement.query(By.css('.info-button')).nativeElement.click();
        fixture.detectChanges();
        tick();
        expect(overlayContainer.getContainerElement().textContent).toEqual(tooltipMessage);
    }));
});
