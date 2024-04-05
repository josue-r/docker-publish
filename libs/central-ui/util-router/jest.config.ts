export default {
    preset: '../../../jest.preset.js',
    coverageDirectory: '../../../coverage/libs/central-ui/util-router',

    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],

    displayName: 'central-ui-util-router',

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