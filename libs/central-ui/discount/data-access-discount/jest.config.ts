export default {
    displayName: 'central-ui-discount-data-access-discount',
    preset: '../../../../jest.preset.js',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],

    transformIgnorePatterns: ['node_modules/(?!.*.mjs$)'],
    coverageDirectory: '../../../../coverage/libs/central-ui/discount/data-access-discount',
    transform: {
        '^.+.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                stringifyContentPathRegex: '\\.(html|svg)$',
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    snapshotSerializers: [
        'jest-preset-angular/build/serializers/no-ng-attributes',
        'jest-preset-angular/build/serializers/ng-snapshot',
        'jest-preset-angular/build/serializers/html-comment',
    ],
};
