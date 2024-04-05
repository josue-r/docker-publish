import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleTableComponent } from './simple-table.component';

describe('SimpleTableComponent', () => {
    let component: SimpleTableComponent<unknown>;
    let fixture: ComponentFixture<SimpleTableComponent<unknown>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SimpleTableComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SimpleTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(Array.isArray(component.data)).toBeTruthy();
    });

    it('should validate that displayedColumns are only the ones with isVisible = true', () => {
        component.columnConfigurations = [
            {
                columnId: 'position',
                isVisible: true,
                label: 'No.',
                customStyles: {
                    width: '10%',
                },
            },
            {
                columnId: 'name',
                isVisible: false,
                label: 'Name',
                customStyles: {
                    width: '20%',
                },
            },
            {
                columnId: 'weight',
                isVisible: true,
                label: 'Weight',
                customStyles: {
                    width: '20%',
                },
            },
            {
                columnId: 'symbol',
                isVisible: false,
                label: 'Symbol',
                customStyles: {
                    width: '50%',
                },
            },
        ];
        expect(component.displayedColumns).toMatchObject(['position', 'weight']);
    });
});
