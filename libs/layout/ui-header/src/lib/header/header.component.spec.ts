import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { By } from '@angular/platform-browser';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
    let element: DebugElement;
    let fixture: ComponentFixture<TestHostComponent>;

    const testStyles: any = { background: 'red' };
    const testTitle = 'TEST';

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatToolbarModule],
            declarations: [HeaderComponent, TestHostComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        element = fixture.debugElement.query(By.css('vioc-angular-header'));
    });

    it('should create', () => {
        expect(fixture.componentInstance).toBeTruthy();
        expect(element).not.toBeNull();
    });

    it('should apply passed in styles', () => {
        // Verify styles input is applied to the toolbar
        expect(element.query(By.css('.app-toolbar')).styles.background).toEqual(testStyles.background);
    });

    it('should render passed in appMenu', () => {
        // Verify template defined in the host component gets rendered
        expect(element.query(By.css('.test-menu'))).not.toBeNull();
    });

    it('should render passed in appLogo', () => {
        // Verify template defined in the host component gets rendered
        expect(element.query(By.css('.test-logo'))).not.toBeNull();
    });

    it('should display passed in title', () => {
        // Verify template defined in the host component gets rendered
        expect(element.query(By.css('.page-title')).nativeElement.innerHTML).toEqual(testTitle);
    });

    @Component({
        // tslint:disable-next-line: component-selector
        selector: `host-component`,
        template: `
            <vioc-angular-header
                [styles]="testStyles"
                [appMenu]="menu"
                [appLogo]="logo"
                [title]="testTitle"
            ></vioc-angular-header>
            <ng-template #menu>
                <div class="test-menu">Test Menu</div>
            </ng-template>
            <ng-template #logo>
                <div class="test-logo">Logo</div>
            </ng-template>
        `,
    })
    /** A wrapper component to enable easy input testing of the HeaderComponent */
    class TestHostComponent {
        testStyles = testStyles;
        testTitle = testTitle;
    }
});
