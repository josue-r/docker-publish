import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentErrorComponent } from './content-error.component';

describe('ContentErrorComponent', () => {
    let component: ContentErrorComponent;
    let fixture: ComponentFixture<ContentErrorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ContentErrorComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ContentErrorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display error message when error default', () => {
        component.description = 'Error, notify MOD';
        fixture.detectChanges();
        const errorElement = fixture.nativeElement.querySelector('.ui-kit-content-error--error');
        expect(errorElement).toBeTruthy();
    });

    it('should display empty message', () => {
        fixture.detectChanges();
        const errorElement = fixture.nativeElement.querySelector('.ui-kit-content-error--description');
        expect(errorElement).toBeTruthy();
    });
});
