import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { QueryPage, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { DefaultOverride, FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SearchFacade } from '@vioc-angular/shared/data-access-search';
import { SearchComponent } from '@vioc-angular/shared/feature-search';
import { EntityPatch } from '@vioc-angular/shared/util-api';
import { Columns } from '@vioc-angular/shared/util-column';
import { FormFactoryOptions } from '@vioc-angular/shared/util-form';
import { camelCase, snakeCase, startCase } from 'lodash';
import { take, takeUntil } from 'rxjs/operators';
import { SearchPageFacade } from '../models/search-page-facade';
import { SearchPage } from '../search-page';

@Component({
    selector: 'vioc-angular-search-page',
    templateUrl: './search-page.component.html',
    providers: [SearchFacade],
})
export class SearchPageComponent extends SearchPage implements OnInit {
    private readonly _logger = Loggers.get('feature-search-page', 'SearchPageComponent');

    /** Component that provides a view for the returned `ResponseEntity` data. */
    @ViewChild('search') searchComponent: SearchComponent;

    @ViewChild('selectionItems', { static: true }) selectionItems: TemplateRef<any>;

    /** The columns mapping for the search. */
    @Input() columns: Columns;

    /** Entity Type for FormFactory (only applies to grid view). */
    @Input() entityType: string;

    /**
     * Determines the identifying portion of the entity in the url after `routePrefix`. For instance, if route `routePrefix="service"`,
     * this should be a function that maps `(service:Service) => service.code`.  If the service code is `CONVENTIONAL`, the `routePrefix`
     * along with `routePathVariables` would create view url of `\service\view\CONVENTIONAL`.
     */
    @Input() routePathVariables: (entity: any) => string[];

    /** The `SearchPageFacade` to facilitate search/datasync/etc. */
    @Input() searchPageFacade: SearchPageFacade<any>;

    /**
     * The "domain" for the search, used to determine access. For instance, if the domain is SERVICE, the we will look for
     * [ROLE_SERVICE_VIEW, ROLE_SERVICE_ADD, etc.] roles to determine access.
     *
     * If not set, it will be defaulted using entityType. Ex, if `entityType='FooBar'`, defaults to `FOO_BAR`.
     */
    @Input() securityDomain: string;

    /**
     * Enables/disables datasync functionality. If this is enabled, a `Datasync` button will be available when records are selected.
     *
     * Defaults to `true`.
     */
    @Input() dataSyncable = true;

    /**
     * Determines whether or not the Grid View button is shown on the search page.
     *
     * Defaults to `true`.
     */
    @Input() gridModeEnabled = true;

    /**
     * The prefix for the view/update routes. For instance, the view page for ABC is `\service\ABC`, this value should be `service`.
     *
     * If not set, it will be defaulted using entityType. Ex, if `entityType='FooBar'`, defaults to `../foo-bar`
     */
    @Input() routePrefix: string;

    /** Template that should house the actions for the table header. */
    @Input() actionsTemplate: TemplateRef<any>;

    /** Template that should house the actions for the table header when there is a selection. */
    @Input() selectionActionsTemplate: TemplateRef<any>;

    /** Template that should house other actions that will show up in the vertical menu. */
    @Input() menuItemsTemplate: TemplateRef<any>;

    /** Additional options used by the `FormFactory` when creating the `TypedFormGroup` for the grid view. */
    @Input() gridFormOptions: FormFactoryOptions;

    /**
     * The domain to use for feature flags.
     *
     * If not specified, this will use the value of `entityType` camel-cased.  For instance, if `entityType="FooBar"`, this will default
     * to `"fooBar"`.
     *
     * This will be used to apply the `FeatureFlagDirective` on various portions of the screen.  For example, if
     * `featureFlagDomain="fooBar"`, the grid view will be feature-flagged with `fooBar.search.grid`.
     */
    @Input() set featureFlagDomain(domain: string) {
        this.featureFlagPrefix = domain ? `${domain}.search` : null;
    }

    /**
     * The prefix to use for feature flags.
     */
    featureFlagPrefix: string;

    /**
     * QuerySort representing the current sort of the table.
     *
     * Defaults to `first column`
     */
    @Input() sort: QuerySort;

    /**
     * QuerySort array defining sorts to append to any existing sort.
     */
    @Input() defaultSorts: QuerySort[];

    /**
     * Default page index and number of records to be displayed to the user.
     *
     * Starting index: `0`, record count: `20`
     */
    page = new QueryPage(0, 20);

    @Input() isLoading = false;

    /** Has the EDIT role for the `securityDomain`. */
    hasEditAccess = false;

    /** Has the VIEW role for the `securityDomain`. */
    hasViewAccess = false;

    /** Has the ADD role for the `securityDomain`. */
    hasAddAccess = false;

    private _clickRowFeatureFlagEnabled = false;
    private _clickRowEditFeatureFlagEnabled = false;
    private _gridModeFeatureFlagEnabled = false;
    public dataSyncFeatureFlagEnabled = false;

    constructor(
        private readonly router: Router,
        private readonly messageFacade: MessageFacade,
        private readonly roleFacade: RoleFacade,
        private readonly featureFlagFacade: FeatureFlagFacade,
        private readonly route: ActivatedRoute
    ) {
        super();
        // override so that common search screen features default to enabled
        this.featureFlagFacade.overrideDefault = DefaultOverride.ENABLED;
    }

    ngOnInit(): void {
        // validate inputs
        if (!this.columns) {
            throw new Error('The "columns" input must be set');
        }
        if (!this.entityType) {
            throw new Error('The "entityType" input must be set');
        }
        if (!this.routePathVariables) {
            throw new Error('The "routePathVariables" input must be set');
        }
        if (!this.searchPageFacade) {
            throw new Error('The "searchPageFacade" input must be set');
        }
        // setup search and save logic (see SearchComponent.search/save for full implementation)
        this.searchFn = (querySearch: QuerySearch) => {
            querySearch.defaultSorts = this.defaultSorts;
            return this.searchPageFacade.search(querySearch);
        };
        this.saveFn = (patches: EntityPatch<any>[]) => this.searchPageFacade.entityPatch(patches);
        // apply defaults
        if (!this.routePrefix) {
            // get current url and get the parent path
            // Ex: "foo/bar/baz" => "/foo/bar"
            const lastSlashIndex = this.router.url.lastIndexOf('/');
            if (lastSlashIndex < 0) {
                // not found
                throw new Error(`Can't default the route prefix from ${this.router.url}.  This should be manually set`);
            }
            this.routePrefix = this.router.url.substring(0, lastSlashIndex);
        }
        if (!this.securityDomain) {
            // Ex. "FooBar" => "FOO_BAR"
            this.securityDomain = `${snakeCase(startCase(this.entityType)).toUpperCase()}`;
        }
        if (!this.featureFlagPrefix) {
            // Ex. "FooBar" => "fooBar"
            this.featureFlagDomain = camelCase(this.entityType);
        }

        // Represents all roles, declared on feature module, that do not follow the default pattern 'ROLE_{SECURITY DOMAIN}_READ'
        // and that should have view access.
        // e.g. ROLE_NATIONAL_DISCOUNT_READ
        const customViewRoles: string[] = this.route.snapshot.data.customViewRoles;

        // Represents all roles, declared on feature module, that do not follow the default pattern 'ROLE_{SECURITY DOMAIN}_UPDATE'
        // and that should have edit access.
        // e.g. ROLE_STORE_LOCATION_DIRECTIONS_UPDATE
        const customEditRoles: string[] = this.route.snapshot.data.customEditRoles;

        // Represents all roles, declared on feature module, that do not follow the default pattern 'ROLE_{SECURITY DOMAIN}_ADD'
        // and that should have add access.
        // e.g. ROLE_NATIONAL_DISCOUNT_ADD
        const customAddRoles: string[] = this.route.snapshot.data.customAddRoles;

        // determine security levels
        this.roleFacade
            .hasAnyRole([`ROLE_${this.securityDomain}${AccessMode.EDIT.defaultRoleSuffix}`].concat(customEditRoles))
            .pipe(takeUntil(this._destroyed))
            .subscribe((hasAccess) => (this.hasEditAccess = hasAccess));
        this.roleFacade
            .hasAnyRole([`ROLE_${this.securityDomain}${AccessMode.VIEW.defaultRoleSuffix}`].concat(customViewRoles))
            .pipe(takeUntil(this._destroyed))
            .subscribe((hasAccess) => (this.hasViewAccess = hasAccess));
        this.roleFacade
            .hasAnyRole([`ROLE_${this.securityDomain}${AccessMode.ADD.defaultRoleSuffix}`].concat(customAddRoles))
            .pipe(takeUntil(this._destroyed))
            .subscribe((hasAccess) => (this.hasAddAccess = hasAccess));
        this.featureFlagFacade
            .isEnabled(`${this.featureFlagPrefix}.clickRow`)
            .pipe(take(1))
            .subscribe((enabled) => (this._clickRowFeatureFlagEnabled = enabled));
        this.featureFlagFacade
            .isEnabled(`${this.featureFlagPrefix}.clickRowEdit`)
            .pipe(take(1))
            .subscribe((enabled) => (this._clickRowEditFeatureFlagEnabled = enabled));
        this.featureFlagFacade
            .isEnabled(`${this.featureFlagPrefix}.grid`)
            .pipe(take(1))
            .subscribe((enabled) => (this._gridModeFeatureFlagEnabled = enabled));
        this.featureFlagFacade
            .isEnabled(`${this.featureFlagPrefix}.dataSync`)
            .pipe(take(1))
            .subscribe((enabled) => (this.dataSyncFeatureFlagEnabled = enabled));
    }

    /** Triggers the previous search query for the search page. */
    triggerPreviousSearch(): void {
        this.searchComponent.triggerPreviousSearch();
    }

    /*
     * Navigates to view/edit page fo selected row based on current role.
     */
    open(row: any): void {
        if (this._clickRowFeatureFlagEnabled) {
            if (this.hasEditAccess && this._clickRowEditFeatureFlagEnabled) {
                this.router.navigate([this.routePrefix, 'edit', ...this.routePathVariables(row)]);
            } else if (this.hasViewAccess) {
                this.router.navigate([this.routePrefix, 'view', ...this.routePathVariables(row)]);
            }
        }
    }

    /** Datasync the selected services from the mass-activate component based on id. */
    dataSync(): void {
        const ids = this.searchComponent.selection.selected.map((selection) => selection.id);
        this.isLoading = true;
        this._logger.debug('Datasyncing entities with ids:', ids);
        this.searchPageFacade.dataSync(ids).subscribe(
            (count) => {
                this.messageFacade.addMessage({
                    message: `${count} record${count === 1 ? '' : 's'} datasynced`,
                    severity: 'success',
                });
                this.searchComponent.selection.clear();
                this.isLoading = false;
            },
            (err) => {
                this.isLoading = false;
                throw err;
            }
        );
    }

    /** Determines what should be passed in as selection actions for input */
    get usableSelectionActions(): TemplateRef<any> | undefined {
        return this.dataSyncable || !isNullOrUndefined(this.selectionActionsTemplate) ? this.selectionItems : undefined;
    }

    /** Determines if the grid view option should be available in the menu. */
    get gridAccessible(): boolean {
        return this.gridModeEnabled && this.hasEditAccess && this._gridModeFeatureFlagEnabled;
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        // Checking the search component for changes (if it exists)
        return this.searchComponent.unsavedChanges;
    }
}
