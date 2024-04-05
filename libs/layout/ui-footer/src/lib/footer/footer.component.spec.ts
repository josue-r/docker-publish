import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
    let component: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FooterComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('css tests', () => {
        const testCSS = (cssClass: string) => {
            const element = fixture.debugElement.query(By.css(cssClass));
            expect(element).not.toBeNull();
        };

        it('should apply passed in styles', () => {
            testCSS('.app-footer');
        });

        it('should center rendered contents', () => {
            testCSS('.app-footer-centered-content');
        });
    });

    it('should provide a link to the terms of use', () => {
        expect(fixture.debugElement.query(By.css('a')).nativeElement.href).toEqual(
            'https://www.valvoline.com/terms-of-use'
        );
    });

    describe('copyright year', () => {
        const verifyCopyRightYear = (year: number, expected: string) => {
            component.currentYear = year;
            fixture.detectChanges();
            expect(
                fixture.debugElement.query(By.css('.app-footer-centered-content')).nativeElement.innerHTML
            ).toContain(expected);
        };

        it('should default to the current year', () => {
            expect(component.currentYear).toEqual(new Date().getFullYear());
        });

        it('should be a range when the year is greater than 2018', () => {
            verifyCopyRightYear(2019, '© Copyright 2018-2019 Valvoline Inc. All Rights Reserved.');
        });

        it('should display 2018 when the year is 2018', () => {
            verifyCopyRightYear(2018, '© Copyright 2018 Valvoline Inc. All Rights Reserved.');
        });
    });
});
