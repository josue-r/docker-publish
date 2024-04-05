import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { CancelButtonComponent } from './cancel-button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
describe('CancelButtonComponent', () => {
    let component: CancelButtonComponent;
    let fixture: ComponentFixture<CancelButtonComponent>;
    let router: Router;
    const routeParams = new Subject();
    const parentRoute: ActivatedRoute = new ActivatedRoute();

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CancelButtonComponent],
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
        fixture = TestBed.createComponent(CancelButtonComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        router.navigate = jest.fn();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('with cancel button clicked', () => {
        it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();
            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });
});
