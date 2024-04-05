import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { LoginErrorComponent } from './login-error.component';

describe('LoginErrorComponent', () => {
    let component: LoginErrorComponent;
    let fixture: ComponentFixture<LoginErrorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LoginErrorComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            queryParamMap: convertToParamMap({
                                error: 'invalid_scope',
                                error_description: 'Unknown/invalid scope(s): [profile]',
                            }),
                        },
                    },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginErrorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display error and code', () => {
        const codeDiv = fixture.debugElement.query(By.css('#code'));
        // Should have a div with an id of "code"
        expect(codeDiv).toBeTruthy();
        expect(codeDiv.nativeElement.textContent.trim()).toBe(`Error Code: invalid_scope`);

        const descriptionDiv = fixture.debugElement.query(By.css('#description'));
        expect(descriptionDiv).toBeTruthy(); //Should have a div with an id of "description"
        expect(descriptionDiv.nativeElement.textContent.trim()).toEqual(
            `Error Description: Unknown/invalid scope(s): [profile]`
        );
    });
});
