import { HttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MomentPipe } from '@vioc-angular/shared/common-functionality';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { EMPTY, of, throwError } from 'rxjs';
import { Version } from '../version';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
    let component: AboutComponent;
    let fixture: ComponentFixture<AboutComponent>;
    let httpClient: HttpClient;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatTableModule, MatButtonModule],
            declarations: [AboutComponent, MomentPipe],
            providers: [
                { provide: HttpClient, useValue: { get: () => EMPTY } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AboutComponent);
        component = fixture.componentInstance;
        httpClient = TestBed.inject(HttpClient);
    });

    it('should hit info endpoints', fakeAsync(() => {
        component.apps = ['foo', 'bar']; // Just look at two apps
        // Mock the info endpoint response
        jest.spyOn(component, 'getInfoEndpoint').mockImplementation((api) =>
            of({ version: `${api}-SNAPSHOT`, time: '2020-04-28T17:31:53.848Z' })
        );

        // trigger init
        fixture.detectChanges();
        flush();

        // versions should be loaded
        expect(component.versions).toEqual([
            { key: 'foo', description: 'foo-api', version: 'foo-SNAPSHOT', time: '2020-04-28T17:31:53.848Z' },
            { key: 'bar', description: 'bar-api', version: 'bar-SNAPSHOT', time: '2020-04-28T17:31:53.848Z' },
        ]);
    }));

    describe('getInfoEndpoint', () => {
        it.each`
            app
            ${'config'}
            ${'discount'}
            ${'inventory'}
            ${'order'}
            ${'organization'}
            ${'product'}
            ${'security'}
            ${'service'}
            ${'tsb-alert'}
            ${'vehicle-technical'}
        `('should make get request', async ({ app }) => {
            jest.spyOn(httpClient, 'get').mockReturnValue(
                of({
                    build: {
                        version: '1.0.0-SNAPSHOT',
                        artifact: `vioc-central-api-${app}`,
                        name: `vioc-central-api-${app}`,
                        group: 'com.vioc.central',
                        time: '2022-01-23T17:31:53.848Z',
                    },
                })
            );

            const version: Version = await component.getInfoEndpoint(`${app}`).toPromise();

            expect(version) //
                .toEqual({
                    version: '1.0.0-SNAPSHOT',
                    artifact: `vioc-central-api-${app}`,
                    name: `vioc-central-api-${app}`,
                    group: 'com.vioc.central',
                    time: '2022-01-23T17:31:53.848Z',
                });
            expect(httpClient.get).toHaveBeenCalledWith(`//gateway/${app}/actuator/info`);
        });

        it('should handle errors by returning version of "unknown"', async () => {
            jest.spyOn(httpClient, 'get').mockReturnValue(throwError(new Error('I broke')));

            const version: Version = await component.getInfoEndpoint('product').toPromise();

            expect(version) //
                .toEqual({
                    version: 'unknown',
                    time: null,
                });
            expect(httpClient.get).toHaveBeenCalledWith('//gateway/product/actuator/info');
        });
    });
});
