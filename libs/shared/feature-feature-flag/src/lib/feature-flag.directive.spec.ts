import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
import { EMPTY, of } from 'rxjs';
import { FeatureFlagDirective } from './feature-flag.directive';

describe('FeatureFlagDirective', () => {
    @Component({
        template: `
            <div id="enabled" *viocAngularFeatureFlag="'test.feat.enabled'"></div>
            <div id="disabled" *viocAngularFeatureFlag="'test.feat.disabled'"></div>
        `,
    })
    class TestComponent {}

    let fixture: ComponentFixture<TestComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FeatureFlagDirective, TestComponent],
            providers: [
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: { test: { feat: { enabled: true, disabled: false } } },
                    } as FeatureConfiguration),
                },
                {
                    provide: AuthenticationFacade,
                    useValue: { getUser: () => EMPTY },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
    });

    describe.each`
        feature                 | id            | expected
        ${'test.feat.enabled'}  | ${'enabled'}  | ${true}
        ${'test.feat.disabled'} | ${'disabled'} | ${false}
    `('ngOnInit', ({ feature, id, expected }) => {
        it(`id of ${id} should ${expected ? '' : 'not '}be present due to feature-flag=${feature}`, () => {
            const element = fixture.debugElement.query(By.css(`#${id}`));
            if (expected) {
                expect(element).not.toBeNull();
            } else {
                expect(element).toBeNull();
            }
        });
    });

    describe.each`
        feat
        ${'a'}
        ${'a.b'}
        ${'a.c.d.e'}
    `('ngOnInit', ({ feat }) => {
        it(`detect "${feat}" as invalid`, () => {
            const directive = new FeatureFlagDirective(null, null, null, null);
            directive.viocAngularFeatureFlag = feat;

            expect(() => directive.ngOnInit()).toThrowError(/Feature Flags should be in the format of .*/);
        });
    });
});
