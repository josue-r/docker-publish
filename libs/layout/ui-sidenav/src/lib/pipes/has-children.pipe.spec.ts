import { HasChildrenPipe } from './has-children.pipe';

describe('HasChildrenPipe', () => {
    const pipe = new HasChildrenPipe();

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it.each`
        subMenus                                                                  | expectedResult
        ${[{ name: 'test1', path: '/test1' }]}                                    | ${true}
        ${[{ name: 'test1', path: '/test1' }, { name: 'test2', path: '/test2' }]} | ${true}
        ${[]}                                                                     | ${false}
        ${undefined}                                                              | ${false}
        ${null}                                                                   | ${false}
    `('expectedResult=$expectedResult when menuItem submenu=$subMenus', ({ subMenus, expectedResult }) => {
        expect(pipe.transform({ name: 'test root', subMenus })).toEqual(expectedResult);
    });
});
