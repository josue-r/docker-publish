import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { LogoutComponent } from './logout.component';

describe('LogoutComponent', () => {
    let component: LogoutComponent;
    let fixture: ComponentFixture<LogoutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LogoutComponent],
            providers: [{ provide: AuthenticationFacade, useValue: { logout: jest.fn() } }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LogoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should log the user out', () => {
        expect(component.authenticationFacade.logout).toHaveBeenCalled();
    });
});
