import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MomentPipe } from '@vioc-angular/shared/common-functionality';
import * as moment from 'moment';
import { AuditTrailComponent } from './audit-trail.component';

describe('AuditTrailComponent', () => {
    let component: AuditTrailComponent;
    let fixture: ComponentFixture<AuditTrailComponent>;
    const auditTrailSelector = '.audit-trail';

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AuditTrailComponent, MomentPipe],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AuditTrailComponent);
        component = fixture.componentInstance;
        component.updatedBy = undefined;
        component.updatedOn = undefined;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('if audited is not set', () => {
        const date = '2018-07-25T12:00:00';
        it('should display if both fields are set', () => {
            component.updatedBy = 'test';
            component.updatedOn = date;
            fixture.detectChanges();
            const auditTrail: HTMLElement = fixture.debugElement.query(By.css(auditTrailSelector)).nativeElement;
            expect(auditTrail.textContent.trim()).toEqual('Last updated by test on Jul 25, 2018 12:00 PM');
        });

        describe('should not display', () => {
            const testAuditTrailExists = () => {
                fixture.detectChanges();
                const auditTrail = fixture.debugElement.query(By.css(auditTrailSelector));
                expect(auditTrail).toBeFalsy();
            };
            it('if updatedOn is undefined', () => {
                component.updatedBy = 'test';
                testAuditTrailExists();
            });

            it('if updatedBy is undefined', () => {
                component.updatedOn = date;
                testAuditTrailExists();
            });

            it('if both updatedBy and updatedOn are undefined', () => {
                testAuditTrailExists();
            });
        });
    });

    describe('if audited is set', () => {
        const date = '2018-07-25T12:00:00';
        it('should display', () => {
            component.updatedBy = undefined;
            component.updatedOn = undefined;
            component.audited = { updatedOn: date, updatedBy: 'me' };

            fixture.detectChanges();

            const auditTrail: HTMLElement = fixture.debugElement.query(By.css(auditTrailSelector)).nativeElement;
            expect(auditTrail.textContent.trim()).toEqual('Last updated by me on Jul 25, 2018 12:00 PM');
        });

        it('should be ovrridden via updatedBy property', () => {
            component.updatedBy = 'someone';
            component.updatedOn = undefined;
            component.audited = { updatedOn: date, updatedBy: 'me' };

            fixture.detectChanges();

            const auditTrail: HTMLElement = fixture.debugElement.query(By.css(auditTrailSelector)).nativeElement;
            expect(auditTrail.textContent.trim()).toEqual('Last updated by someone on Jul 25, 2018 12:00 PM');
        });

        it('should be ovrridden via updatedOn property', () => {
            component.updatedBy = undefined;
            component.updatedOn = moment('2018-10-05T18:00:00');
            component.audited = { updatedOn: date, updatedBy: 'me' };

            fixture.detectChanges();

            const auditTrail: HTMLElement = fixture.debugElement.query(By.css(auditTrailSelector)).nativeElement;
            expect(auditTrail.textContent.trim()).toEqual('Last updated by me on Oct 5, 2018 6:00 PM');
        });
    });
});
