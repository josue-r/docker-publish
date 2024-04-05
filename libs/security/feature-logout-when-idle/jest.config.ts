export default {
    preset: '../../../jest.preset.js',
    coverageDirectory: '../../../coverage/libs/security/feature-logout-when-idle',

    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],

    displayName: 'security-feature-logout-when-idle',

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
