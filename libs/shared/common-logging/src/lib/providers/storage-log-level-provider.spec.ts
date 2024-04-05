import { LogLevel } from '../log-level.enum';
import { Loggers } from '../loggers';
import { StorageLogLevelProvider } from './storage-log-level-provider';

describe('StorageLogLevelProvider', () => {
    let provider: StorageLogLevelProvider;
    beforeEach(() => {
        localStorage.clear();
        provider = new StorageLogLevelProvider(localStorage);
        Loggers.publishers = [{ publish: () => Promise.resolve() }];
    });
    afterEach(() => {
        localStorage.clear();
        if (provider) {
            provider.pollerSubscription.unsubscribe();
        }
    });

    // TODO: I don't see any way to test this.  Neither tick() and jest.useFakeTimers() work with the rxjs "scheduler"
    // The only solutions that I've seen step on and replace the rxjs timer() call, which seems to defeat the purpose of testing
    it.todo('should poll local storage periodically for updates');

    it('should return DEFAULT if no log level set', async () => {
        provider.refreshLogLevels();
        expect(await provider.getLevel('NoLogConfigured')).toEqual(LogLevel.DEFAULT);
    });

    describe('getLevel', () => {
        it.each`
            loggerName      | expectedLevelAsString
            ${''}           | ${'OFF'}
            ${'FooO'}       | ${'OFF'}
            ${'FooD'}       | ${'DEBUG'}
            ${'FooI'}       | ${'INFO'}
            ${'FooW'}       | ${'WARN'}
            ${'FooE'}       | ${'ERROR'}
            ${'FooA'}       | ${'ALL'}
            ${'FooInvalid'} | ${'DEFAULT'}
        `(
            'should return $expectedLevelAsString for loggerName=$loggerName',
            async ({ loggerName, expectedLevelAsString }) => {
                localStorage.setItem('logging.level.FooO', 'OfF');
                localStorage.setItem('logging.level.FooD', 'Debug');
                localStorage.setItem('logging.level.FooI', 'INFO');
                localStorage.setItem('logging.level.FooW', 'Warn');
                localStorage.setItem('logging.level.FooE', 'Error');
                localStorage.setItem('logging.level.FooA', 'ALL');
                localStorage.setItem('logging.level.FooInvalid', 'NA');
                provider.refreshLogLevels();
                expect(await provider.getLevel(loggerName)).toEqual(LogLevel[expectedLevelAsString]);
            }
        );

        it('should support partial log levels', async () => {
            localStorage.setItem('logging.level.Foo', 'DEBUG');
            localStorage.setItem('logging.level.Foo.Bar', 'WARN');
            localStorage.setItem('logging.level.Foo.Bar.Baz', 'ERROR');

            provider.refreshLogLevels();
            expect(await provider.getLevel('Bar')).toEqual(LogLevel.DEFAULT); // default
            expect(await provider.getLevel('Bar.Foo.Bar.Baz')).toEqual(LogLevel.DEFAULT); // default
            expect(await provider.getLevel('Foo')).toEqual(LogLevel.DEBUG); // Config should match Foo
            expect(await provider.getLevel('Foo.Baz')).toEqual(LogLevel.DEBUG); // Config should match Foo
            expect(await provider.getLevel('Foo.Bar')).toEqual(LogLevel.WARN); // Config should match Foo.Bar
            expect(await provider.getLevel('Foo.Bar.Foo')).toEqual(LogLevel.WARN); // Config should match Foo.Bar
            expect(await provider.getLevel('Foo.Bar.Baz')).toEqual(LogLevel.ERROR); // Config should match Foo.Bar.Baz
            expect(await provider.getLevel('Foo.Bar.Baz.Foo')).toEqual(LogLevel.ERROR); // Config should match Foo.Bar.Baz
        });
    });

    it('should detect and use default log level', async () => {
        provider.refreshLogLevels();
        expect(await provider.getLevel('NoLogConfigured')).toEqual(LogLevel.DEFAULT);
    });
});
