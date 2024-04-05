import { ParameterType } from '../model/parameter-type';
import { ParameterApi } from './parameter.api';

describe('ParameterApi', () => {
    const api = new ParameterApi(null, { http: null });

    beforeEach(() => {
        jest.clearAllMocks();
        api.get = jest.fn();
    });

    it('should be created', () => {
        expect(api).toBeTruthy();
    });
    describe('delegate to the get method', () => {
        it('findSystemParameterValue', () => {
            api.findSystemParameterValue('param', ParameterType.STRING);
            expect(api.get).toHaveBeenCalledWith(['param', ParameterType.STRING]);
        });

        it('findCompanyParameterValue', () => {
            api.findCompanyParameterValue('param', ParameterType.STRING, '111');
            expect(api.get).toHaveBeenCalledWith(['param', ParameterType.STRING], { compResourceId: '111' });
        });

        it('findStoreParameterValue', () => {
            api.findStoreParameterValue('param', ParameterType.STRING, '111');
            expect(api.get).toHaveBeenCalledWith(['param', ParameterType.STRING], { storeResourceId: '111' });
        });
    });
});
