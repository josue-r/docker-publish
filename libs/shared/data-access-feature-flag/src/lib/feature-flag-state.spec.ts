import { fakeAsync } from '@angular/core/testing';
import { FeatureConfiguration } from '@vioc-angular/shared/common-feature-flag';
import { expectObservable } from '@vioc-angular/test/util-test';
import { EMPTY, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FeatureFlagState } from './feature-flag-state';
import { FeatureStatus } from './models/feature-status';

describe('FeatureFlagState', () => {
    it('should create an instance', () => {
        expect(new FeatureFlagState(EMPTY)).toBeTruthy();
    });
    describe.each`
        config                            | expected
        ${{ default: true }}              | ${true}
        ${{ default: false }}             | ${false}
        ${{ default: 'invalid' }}         | ${false}
        ${{ comment: 'default missing' }} | ${false}
        ${{}}                             | ${false}
        ${undefined}                      | ${false}
        ${'not an object'}                | ${false}
    `('getDefault', ({ config, expected }) => {
        it(`should return ${expected} with a config of ${JSON.stringify(config)}`, fakeAsync(() => {
            const state = new FeatureFlagState(of(config));

            expectObservable(state.getDefault()).toBe(expected);
        }));
    });

    describe.each`
        features                                   | expected                     | desc
        ${{ a: { b: { c: true } } }}               | ${FeatureStatus.ENABLED}     | ${'feature is enabled for all'}
        ${{ a: { b: { c: ['user2', 'User1'] } } }} | ${FeatureStatus.ENABLED}     | ${'feature is enabled for user1'}
        ${{ a: { b: { c: false } } }}              | ${FeatureStatus.DISABLED}    | ${'feature is disabled for all'}
        ${{ a: { b: { c: ['user2'] } } }}          | ${FeatureStatus.DISABLED}    | ${'feature is only enabled for user2'}
        ${undefined}                               | ${FeatureStatus.UNSPECIFIED} | ${'feature is invalid due to undefined feature'}
        ${null}                                    | ${FeatureStatus.UNSPECIFIED} | ${'feature is invalid due to null feature'}
        ${'invalid'}                               | ${FeatureStatus.UNSPECIFIED} | ${'feature is invalid due to feature if wrong type'}
        ${{ a: undefined }}                        | ${FeatureStatus.UNSPECIFIED} | ${'feature is invalid due to undefined a'}
        ${{ a: { b: null } }}                      | ${FeatureStatus.UNSPECIFIED} | ${'feature is invalid due to undefined a.b'}
        ${{ a: { b: { c: undefined } } }}          | ${FeatureStatus.UNSPECIFIED} | ${'feature is invalid due to undefined a.b'}
        ${{ notA: { b: { c: true } } }}            | ${FeatureStatus.UNSPECIFIED} | ${'feature is not specified for a.b.c'}
        ${{ a: { notB: { c: true } } }}            | ${FeatureStatus.UNSPECIFIED} | ${'feature is not specified for a.b.c'}
        ${{ a: { a: { notC: true } } }}            | ${FeatureStatus.UNSPECIFIED} | ${'feature is not specified for a.b.c'}
    `('getStatus("a.b.c", "user1")', ({ features, expected, desc }) => {
        const statuses: string[] = [];
        statuses[FeatureStatus.ENABLED] = 'ENABLED';
        statuses[FeatureStatus.DISABLED] = 'DISABLED';
        statuses[FeatureStatus.UNSPECIFIED] = 'UNSPECIFIED';
        const statusString = statuses[expected];
        const featureString = JSON.stringify(features);
        it(`should return ${statusString} with a features=${featureString} since ${desc}`, fakeAsync(() => {
            const config: FeatureConfiguration = { default: false, features };
            const state = new FeatureFlagState(of(config));

            const actualStatus: Observable<FeatureStatus> = state.getStatus('a.b.c', 'user1');
            // This is ugly but transform the status to a string to get a usable error message, otherwise we'll just get the ordinal
            const actualStatusAsString: Observable<string> = actualStatus.pipe(map((s) => statuses[s]));
            expectObservable(actualStatusAsString).toEqual(statusString);
        }));
    });

    describe.each`
        passedConfig                                              | expectedConfig
        ${null}                                                   | ${{ default: false, features: {} } as FeatureConfiguration}
        ${undefined}                                              | ${{ default: false, features: {} } as FeatureConfiguration}
        ${{ default: true }}                                      | ${{ default: true, features: {} } as FeatureConfiguration}
        ${{ features: { a: { b: { c: true } } } }}                | ${{ default: false, features: { a: { b: { c: true } } } } as FeatureConfiguration}
        ${{ default: true, features: { a: { b: { c: true } } } }} | ${{ default: true, features: { a: { b: { c: true } } } } as FeatureConfiguration}
    `('config', ({ passedConfig, expectedConfig }) => {
        it(`should accept ${JSON.stringify(passedConfig)} and load ${JSON.stringify(expectedConfig)} `, () => {
            const state = new FeatureFlagState(of(passedConfig));

            expect(state['config'].getValue()).toEqual(expectedConfig);
        });
    });
});
