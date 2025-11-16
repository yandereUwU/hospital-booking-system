// backend/tests/basic.test.js
describe('Basic Test Setup', () => {
    test('Jest should work correctly', () => {
        expect(1 + 1).toBe(2);
    });

    test('Environment should be test', () => {
        expect(process.env.NODE_ENV).toBeDefined();
    });
});