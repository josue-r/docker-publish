import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { LoadingOverlayComponent } from './loading-overlay.component';

describe('LoadingOverlayComponent', () => {
    let component: LoadingOverlayComponent;
    let fixture: ComponentFixture<LoadingOverlayComponent>;

    const getLoadingShade = () => fixture.debugElement.query(By.css('.loading-shade'));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatProgressSpinnerModule],
            declarations: [LoadingOverlayComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoadingOverlayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not display if not loading', () => {
        // loading is defaulted to false
        expect(getLoadingShade()).toBeNull();
    });

    it('should display if loading', () => {
        component.loading = true;
        fixture.detectChanges();
        expect(getLoadingShade()).not.toBeNull();
        expect(fixture.debugElement.query(By.css('mat-spinner'))).not.toBeNull();
    });
});
