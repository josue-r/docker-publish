export default {
    preset: '../../../jest.preset.js',
    coverageDirectory: '../../../coverage/libs/shared/feature-dropdown-column',

    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],

    displayName: 'shared-feature-dropdown-column',

    transform: {
        '^.+.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!.*.mjs$)'],
    snapshotSerializers: [
        'jest-preset-angular/build/serializers/ng-snapshot',
        'jest-preset-angular/build/serializers/html-comment',
    ],
};
