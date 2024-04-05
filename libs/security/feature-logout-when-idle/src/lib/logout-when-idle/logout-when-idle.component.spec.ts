import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Idle } from '@ng-idle/core';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { LogoutWhenIdleComponent } from './logout-when-idle.component';

describe('LogoutWhenIdleComponent', () => {
    let component: LogoutWhenIdleComponent;
    let fixture: ComponentFixture<LogoutWhenIdleComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiDialogMockModule],
            declarations: [LogoutWhenIdleComponent],
            providers: [
                {
                    provide: Idle,
                    useValue: {
                        setIdle: () => {},
                        setTimeout: () => {},
                        setInterrupts: () => {},
                        watch: () => {},
                        onTimeoutWarning: new EventEmitter(),
                        onTimeout: new EventEmitter(),
                        onIdleEnd: new EventEmitter(),
                        onIdleStart: new EventEmitter(),
                    },
                },
                { provide: AuthenticationFacade, useValue: { logout: () => {} } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LogoutWhenIdleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // I don't see any way to test this without having log delays in the test
});
