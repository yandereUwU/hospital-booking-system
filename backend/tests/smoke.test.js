// backend/tests/smoke.test.js
describe('Smoke Test - Basic Jest Functionality', () => {
    test('1 + 1 should equal 2', () => {
        expect(1 + 1).toBe(2);
    });

    test('Array should contain item', () => {
        const arr = [1, 2, 3];
        expect(arr).toContain(2);
    });

    test('Object should have property', () => {
        const obj = { name: 'test', value: 123 };
        expect(obj).toHaveProperty('name');
    });

    test('Simple string test', () => {
        expect('hello').toBe('hello');
    });
});