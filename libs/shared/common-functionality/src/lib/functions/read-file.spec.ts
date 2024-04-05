import { readFile } from './read-file';

describe('readFile', () => {
    const createTextFile = (text: string): File => new File([text], 'file.txt', { type: 'text/plain' });

    it('should read the file and return a base 64 string representation', async () => {
        const fileContents = 'Test file text';
        const encodedFileBytes = await readFile(createTextFile(fileContents));
        expect(atob(encodedFileBytes)).toEqual(fileContents);
    });

    it('should not error on large files', async () => {
        // 255kb caused an issue in the previous implementation
        const file = createTextFile('a'.repeat(255000));
        expect(() => readFile(file)).not.toThrowError();
        expect.assertions(1);
    });
});
