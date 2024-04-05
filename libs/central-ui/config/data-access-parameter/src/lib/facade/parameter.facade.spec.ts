import { of } from 'rxjs';
import { ParameterApi } from '../api/parameter.api';
import { ParameterType } from '../model/parameter-type';
import { ParameterState } from '../state/parameter.state';
import { ParameterFacade } from './parameter.facade';

describe('ParameterFacade', () => {
    let api: ParameterApi;
    let facade: ParameterFacade;
    let state: ParameterState;

    beforeEach(() => {
        state = new ParameterState();
        facade = new ParameterFacade('//gateway', null, state);
        api = facade['api'];
    });

    it('should be created', () => {
        expect(api).toBeTruthy();
    });

    describe('findSystemParameterValue', () => {
        it('should call api when cache is not available', async () => {
            jest.spyOn(api, 'findSystemParameterValue').mockReturnValue(of('test'));

            const result = await facade.findSystemParameterValue('TEST_PARAM', ParameterType.STRING).toPromise();

            // verify that it delegated to api;
            expect(api.findSystemParameterValue).toBeCalledWith('TEST_PARAM', ParameterType.STRING);
            expect(result).toBe('test');
        });

        it('should call cache if available and not the api', async () => {
            jest.spyOn(api, 'findSystemParameterValue').mockReturnValue(of('test-api'));

            state.cacheSystemParameter(of('test-cache'), 'TEST_PARAM');

            const result = await facade.findSystemParameterValue('TEST_PARAM', ParameterType.STRING).toPromise();

            // verify that it isn't delegated to api when cache is available;
            expect(api.findSystemParameterValue).not.toBeCalled();
            expect(result).toBe('test-cache');
        });
    });

    describe('findCompanyParameterValue', () => {
        it('should call api when cache is not available', async () => {
            jest.spyOn(api, 'findCompanyParameterValue').mockReturnValue(of('test'));

            const result = await facade
                .findCompanyParameterValue('TEST_PARAM', ParameterType.STRING, '123')
                .toPromise();

            // verify that it delegated to api;
            expect(api.findCompanyParameterValue).toBeCalledWith('TEST_PARAM', ParameterType.STRING, '123');
            expect(result).toBe('test');
        });

        it('should call cache if available and not the api', async () => {
            jest.spyOn(api, 'findCompanyParameterValue').mockReturnValue(of('test-api'));

            state.cacheCompanyParameter(of('test-cache'), 'TEST_PARAM', '123');

            const result = await facade
                .findCompanyParameterValue('TEST_PARAM', ParameterType.STRING, '123')
                .toPromise();

            // verify that it isn't delegated to api when cache is available;
            expect(api.findCompanyParameterValue).not.toBeCalled();
            expect(result).toBe('test-cache');
        });
    });

    describe('findStoreParameterValue', () => {
        it('should call api when cache is not available', async () => {
            jest.spyOn(api, 'findStoreParameterValue').mockReturnValue(of('test'));

            const result = await facade.findStoreParameterValue('TEST_PARAM', ParameterType.STRING, '111').toPromise();

            // verify that it delegated to api;
            expect(api.findStoreParameterValue).toBeCalledWith('TEST_PARAM', ParameterType.STRING, '111');
            expect(result).toBe('test');
        });

        it('should call cache if available and not the api', async () => {
            jest.spyOn(api, 'findStoreParameterValue').mockReturnValue(of('test-api'));

            state.cacheStoreParameter(of('test-cache'), 'TEST_PARAM', '111');

            const result = await facade.findStoreParameterValue('TEST_PARAM', ParameterType.STRING, '111').toPromise();

            // verify that it isn't delegated to api when cache is available;
            expect(api.findStoreParameterValue).not.toBeCalled();
            expect(result).toBe('test-cache');
        });
    });
});
