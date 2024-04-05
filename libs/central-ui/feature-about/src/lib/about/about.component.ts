import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Version } from '../version';
import { VersionEntry } from '../version-entry';

@Component({
    selector: 'vioc-angular-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
    constructor(private readonly httpClient: HttpClient, @Inject(GATEWAY_TOKEN) private readonly gateway) {}

    private readonly logger = Loggers.get('feature-about', 'AboutComponent');
    apps = [
        'config',
        'discount',
        'inventory',
        'order',
        'organization',
        'product',
        'security',
        'service',
        'tsb-alert',
        'vehicle-technical',
    ];
    versions: VersionEntry[] = [];

    ngOnInit() {
        this.versions = this.apps //
            .map((key) => ({
                key,
                description: `${key}-api`,
                version: 'loading...',
                time: null,
            }));
        // Update the entries with the result from the API.
        // This is uglier than using an async pipe in the template but I couldn't find a way to prevent multiple API calls for each row
        this.versions //
            .forEach((entry) => {
                this.getInfoEndpoint(entry.key).subscribe((info) => {
                    entry.time = info.time;
                    entry.version = info.version;
                });
            });
    }

    getInfoEndpoint(api: string): Observable<Version> {
        return this.httpClient //
            .get<{ build: Version }>(`${this.gateway}${api}/actuator/info`)
            .pipe(
                map((info) => info.build),
                catchError((e) => {
                    this.logger.error(`Error fetching info endpoint for API=${api}`, e);
                    return of({ version: 'unknown', time: null });
                })
            );
    }
}
