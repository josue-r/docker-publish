import { Component, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//  This needs to be put into a feature module
// eslint-disable-next-line
import { ActiveMenu, MenuFacade, MenuItem } from '@vioc-angular/central-ui/data-access-menu';
import { AboutDialogComponent } from '@vioc-angular/central-ui/feature-about';
import { RouterService } from '@vioc-angular/central-ui/util-router';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//  This needs to be put into a feature module that configures all
// eslint-disable-next-line
import { AuthenticationFacade, User } from '@vioc-angular/security/data-access-security';
import { Loggers } from '@vioc-angular/shared/common-logging';
import * as moment from 'moment';
import { merge, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Component({
    selector: 'vioc-angular-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    private readonly logger = Loggers.get('central-ui', 'AppComponent');

    readonly watermark: string;

    readonly homeLogo = `${environment.deployUrl}assets/img/vioc-logo.png`;

    readonly appLogoImage = `${environment.deployUrl}assets/img/central.png`;

    readonly headerStyles: any = {
        background: `url(${environment.deployUrl}assets/img/vioc-central-header.png) left top no-repeat, linear-gradient(to bottom, #0094cd 57px, transparent 57px)`,
    };

    readonly menu$: Observable<MenuItem[]>;

    readonly activeMenu$: Observable<ActiveMenu>;

    readonly title$: Observable<string>;

    user: Observable<User>;

    readonly version = `${environment.version}`;

    @ViewChild(AboutDialogComponent) aboutDialog: AboutDialogComponent;

    constructor(
        private readonly _authFacade: AuthenticationFacade,
        menuFacade: MenuFacade,
        private readonly router: Router,
        private readonly routerService: RouterService,
        titleService: Title,
        @Inject(LOCALE_ID) locale: string
    ) {
        this.logger.debug('environment:', environment);
        this.logger.debug('locale:', locale);
        this.configureMoment(locale);
        this.menu$ = menuFacade.getMenu();
        this.activeMenu$ = menuFacade.getActiveMenu();
        const initialPageTitle = titleService.getTitle(); // Expecting 'VIOC Central' from title tag
        const defaultHeaderTitle = 'Home'; // Display when no menu item is available (Dashboard has no menu item)
        this.title$ = merge(
            of(defaultHeaderTitle),
            this.activeMenu$.pipe(map((am) => (am.subMenu ? am.subMenu.name : defaultHeaderTitle)))
        )
            // Update browser tab title. Useful for history. (Ex: 'VIOC Central - Product Catalog')
            .pipe(tap((headerTitle) => titleService.setTitle(`${initialPageTitle} - ${headerTitle}`)));
        if (environment.environmentName === 'prod') {
            this.watermark = '';
        } else {
            this.watermark = environment.environmentName;
        }
        this.user = this._authFacade.getUser();
    }

    /**
     * Add global configuration to the Moment objects.
     */
    private configureMoment(locale: string): void {
        this.logger.debug('Configuring moment.js');
        // Configure to use the browser locale https://momentjs.com/docs/#/i18n/changing-locale/
        moment.locale(locale);
        // DateTime format ignoring timezone and offset info (This is how CWA currently works. Once decommisioned, we may want to reevaluate)
        const apiDateFormat = 'YYYY-MM-DD[T]HH:mm:ss.SSS';
        // Http client uses JSON.stringify to serialize the body. Adding a toJSON function customizes how serialization will work.
        moment.prototype.toJSON = function () {
            return this.format(apiDateFormat); // 'this' should refer to the moment object being serialized
        };
    }

    get authenticated(): Observable<boolean> {
        return this._authFacade.isAuthenticated();
    }

    navigate(path: string): void {
        this.router.navigate([path]);
    }

    goHome(): void {
        this.routerService.navigateToDashboard();
    }

    logout(): void {
        // redirect the user to the logout url to allow displaying of window
        // messages such as the unsaved changes message
        this.router.navigate(['/logout']);
    }

    showAbout() {
        this.aboutDialog.open();
    }
}
